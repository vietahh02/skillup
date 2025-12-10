import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { ActionWithHandler, TableConfig } from '../../../shared/components/generic-table/generic-table.model';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GenericFilterComponent } from "../../../shared/components/generic-filter/generic-filter.component";
import { FilterConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { ApiDocumentServices } from '../../../services/system-document.service';
import { Document, DocumentFilterCriteria, DocumentPagePayload, formatEnumName } from '../../../models/document.model';
import { CreateUpdateDocumentDialogComponent } from '../create-update-document/create-update-document.component';
import { MatDialog } from '@angular/material/dialog';
import { DEFAULT_PAGE_SIZE } from '../../../utils/shared/constants/pagination.constants';
import { DialogService } from '../../../services/dialog.service';
import { PreviewMailComponent } from '../preview-mail/preview-mail.component';
import { ApiAuthServices } from '../../../services/auth.service';
import { PERMISSIONS } from '../../../utils/shared/constants/auth.constants';
import { SendMailComponent } from '../send-mail/send-mail.component';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-document-management',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatTableModule,
    GenericFilterComponent,
    GenericTableComponent,
    TranslatePipe
],
  templateUrl: './document-management.component.html',
  styleUrl: './document-management.component.scss'
})
export class DocumentManagementComponent implements OnInit {
  private translate = inject(LanguageService);

  documents: Document[] = [];
  permissions = PERMISSIONS;
  documentTableConfig: TableConfig = {
    columns: [],
    actions: [],
    enablePagination: true,
    enableStatusToggle: false,
    emptyMessage: 'common.noData'
  };
  
  constructor(private snack: MatSnackBar, private documentApi: ApiDocumentServices,
    private dialog: MatDialog, private dialogService: DialogService, public authService: ApiAuthServices
  ) {
  }

  ngOnInit() {
    this.onApplyDocumentFilters({});

    this.documentTableConfig = {
    columns: [
      { key: 'code', header: 'system.document.code', align: 'center' },
      { key: 'type', header: 'system.document.type', align: 'center', template: 'pill', customColor: [
        { code: 'Email', color: 'orange' },
        { code: 'SMS', color: 'blue' },
      ] },
      { key: 'title', header: 'system.document.documentTitle', align: 'center' }
    ],
    actions: this.setupActionsTableConfig(),
    enablePagination: true,
    enableStatusToggle: false,
    emptyMessage: 'common.noData'
  }
  }

  documentId?: string | number;

  private documentCriteria = signal<DocumentFilterCriteria>({});
  loadingDocument = false;
  loadingDocumentFilter = false;
  pageDocument = 1;
  sizeDocument = DEFAULT_PAGE_SIZE;
  totalDocument = 0;
  totalPagesDocument = 0;

  documentFilterConfig: FilterConfig = {
    fields: [
      {
        type: 'text',
        key: 'keyword',
        class: 'col-md-3',
        placeholder: 'system.document.placeholderSearch',
        icon: 'search'
      }
    ],
    showApplyButton: true,
    showClearButton: true,
    applyButtonText: 'common.apply',
    clearButtonText: 'common.clear',
    applyButtonIcon: 'filter_list',
    classButton: 'col-md-9'
  }

  setupActionsTableConfig(): ActionWithHandler[] {
    const actions: ActionWithHandler[] = [];
    if (this.authService.isPermissionGranted(this.permissions.CONFIG_READ)) {
      actions.push({
        type: 'view',
        tooltip: 'system.document.view',
        icon: 'visibility',
        color: '#1b14ec',
        handler: (item: Document) => this.onViewDocument(item)
      });
    }
    if (this.authService.isPermissionGranted(this.permissions.CONFIG_UPDATE)) {
      actions.push({
        type: 'edit',
        tooltip: 'system.document.edit',
        icon: 'edit',
        color: '#000',
        handler: (item: Document) => this.onEditDocument(item)
      });
    }
    if (this.authService.isPermissionGranted(this.permissions.CONFIG_DELETE)) {
      actions.push({
        type: 'delete',
        tooltip: 'system.document.delete',
        icon: 'delete',
        color: '#ff0404',
        handler: (item: Document) => this.onDeleteDocument(item)
      });
    }
    if (this.authService.isPermissionGranted(this.permissions.CONFIG_READ)) {
      actions.push({
        type: 'mail',
        tooltip: 'system.document.mail',
        icon: 'mail',
        color: '#FF9800',
        visible: (item: Document) => item.type === 'Email',
        handler: (item: Document) => this.onDocumentMail(item)
      });
    }
    return actions;
  }

  buildDocumentPayload(): DocumentPagePayload {
    const c = this.documentCriteria();
    const payload: DocumentPagePayload = {
      page: this.pageDocument - 1,
      size: this.sizeDocument
    }
    if (c.keyword) payload.keyword = c.keyword.trim();
    return payload;
  }

  loadDocuments() {
    this.loadingDocument = true;
    this.loadingDocumentFilter = true;
    const payload = this.buildDocumentPayload();
    this.documentApi.getDocumentPage(payload)
      .pipe(finalize(() => {
        this.loadingDocument = false;
        this.loadingDocumentFilter = false;
      }))
      .subscribe({
        next: (res: any) => {
          this.documents = res.content.map((item: any) => ({
            ...item,
            type: item.type !== "SMS" ? formatEnumName(item.type) : item.type,
            code: formatEnumName(item.code),
          }));
          this.totalDocument = res.totalElements;
          this.totalPagesDocument = res.totalPages;
        },
        error: (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToLoadDocuments'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
  }

  onApplyDocumentFilters(filters: DocumentFilterCriteria) {
    this.documentCriteria.set(filters);
    this.pageDocument = 1;
    this.loadDocuments();
  }

  onClearDocumentFilters() {}

  onNewDocument() {
    this.dialog.open(CreateUpdateDocumentDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { loadDocuments: () => this.loadDocuments() },
      disableClose: true,
      autoFocus: false
    });
  }

  onViewDocument(doc: Document) {
    this.dialog.open(PreviewMailComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '70vh',
      data: { document: doc },
      disableClose: true,
      autoFocus: false
    });
  }

  onEditDocument(doc: Document) {
    this.dialog.open(CreateUpdateDocumentDialogComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { document: doc, loadDocuments: () => this.loadDocuments() },
      disableClose: true,
      autoFocus: false
    });
  }

  onDeleteDocument(doc: Document) {
    this.dialogService.confirm({
      title: this.translate.translate('system.document.deleteDocument'),
      message: this.translate.translate('system.document.deleteDocumentMessage'),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe({
      next: (result: boolean) => {
        if (!result) return;
        this.loadingDocument = true;
        this.documentApi.deleteDocument(doc.id).pipe(finalize(() => {
          this.loadingDocument = false;
        })).subscribe({
          next: (res: any) => {
            this.loadDocuments();
            this.snack.open(this.translate.translate('system.document.deletedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.document.failedToDeleteDocument'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    });
  }

  onDocumentMail(doc: Document) {
    this.dialog.open(SendMailComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { document: doc },
      disableClose: true,
      autoFocus: false
    });
  }

  onPageDocumentChange(page: number) {
    if (page < 1) return;
    this.pageDocument = page;
    this.loadDocuments();
  }

  onPageSizeDocumentChange(size: number) {
    this.sizeDocument = size;
    this.pageDocument = 1;
    this.loadDocuments();
  }

}

