import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableConfig, ActionWithHandler } from '../../../shared/components/generic-table/generic-table.model';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { GenericFilterComponent } from "../../../shared/components/generic-filter/generic-filter.component";
import { FilterConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { Partner, PartnerFilterCriteria, PartnerPagePayload } from '../../../models/partner.model';
import { ApiPartnerServices } from '../../../services/partner.service';
import { finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LanguageService } from '../../../services/language.service';
import { DialogService } from '../../../services/dialog.service';
import { ApiAuthServices } from '../../../services/auth.service';
import { PAGES, PERMISSIONS } from '../../../utils/shared/constants/auth.constants';

@Component({
  selector: 'app-partner-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    GenericFilterComponent,
    GenericTableComponent,
    TranslatePipe
  ],
  templateUrl: './partner-list.component.html',
  styleUrl: './partner-list.component.scss'
})
export class PartnerListComponent {

  authService = inject(ApiAuthServices);
  permissions = PERMISSIONS;
  pages = PAGES;
  constructor(
    private api: ApiPartnerServices,
    private router: Router,
    private snack: MatSnackBar,
    private translate: LanguageService,
    private dialogService: DialogService
  ) {}

  partners: Partner[] = [];
  total = 0;
  drawerOpen = false;

  partnerId?: string | number;
  page = 1;
  size = DEFAULT_PAGE_SIZE;
  totalPages = 1;
  currentPage = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private criteria = signal<PartnerFilterCriteria>({});
  loading = false;
  isLoadingFilter = false;

  partnerTableConfig: TableConfig = {
    columns: [
      { 
        key: 'partnerCode', 
        header: 'system.partner.partnerCode', 
        align: 'center',
      },
      { 
        key: 'partnerName', 
        header: 'system.partner.partnerName', 
        align: 'center',
      },
      { 
        key: 'contactInfo', 
        header: 'system.partner.contactInfo', 
        align: 'center',
        isTruncate: true,
      },
      { 
        key: 'phoneNumber', 
        header: 'system.partner.phoneNumber', 
        align: 'center',
      },
      { 
        key: 'partnerType', 
        header: 'system.partner.partnerType', 
        align: 'center',
        isTranslate: true,
        customColor: [
          { code: 'system.partner.partnerTypeSeller', color: '#d41900' },
          { code: 'system.partner.partnerTypeSupplier', color: '#e97712' },
          { code: 'system.partner.partnerTypeBoth', color: '#137333' },
        ]
      },
      { 
        key: 'status', 
        header: 'system.partner.partnerStatusStr', 
        template: 'pill',
        align: 'center',
        customColor: [
          { code: 'common.active', color: '#137333' },
          { code: 'common.inactive', color: '#d41900' }
        ],
        isTranslate: true
      },
      {
        key: 'balance',
        header: 'system.partner.balance',
        align: 'center',
      },
    ],
    actions: [
      {
        type: 'view',
        tooltip: 'common.view',
        icon: 'visibility',
        color: '#000',
        visible: () => this.authService.isPermissionGranted(this.permissions.PARTNER_READ),
        handler: (item: Partner) => this.onViewPartner(item)
      } as ActionWithHandler,
      { 
        type: 'edit', 
        tooltip: 'common.edit',
        icon: 'edit',
        color: '#000',
        visible: () => this.authService.isPermissionGranted(this.permissions.PARTNER_UPDATE),
        handler: (item: Partner) => this.onEditPartner(item)
      } as ActionWithHandler,
      // { 
      //   type: 'delete', 
      //   tooltip: 'common.delete',
      //   icon: 'delete',
      //   color: '#ff0404',
      //   visible: () => this.authService.isPermissionGranted(this.permissions.PARTNER_DELETE),
      //   handler: (item: Partner) => this.onDeletePartner(item)
      // } as ActionWithHandler
    ],
    showSequenceNumber: true,
    enablePagination: true,
    enableStatusToggle: true,
    emptyMessage: 'common.noData'
  } 

  partnerFilterConfig: FilterConfig = {
    fields: [
      {
        type: 'text',
        key: 'keyword',
        label: 'system.partner.placeholderSearch',
        class: 'col-md-3',
        placeholder: 'system.partner.placeholderSearch',
        icon: 'search'
      },
      {
        type: 'select',
        key: 'partnerType',
        label: 'system.partner.partnerType',
        class: 'col-md-3',
        options: [
          { value: 'all', displayName: 'system.partner.allPartnerTypes' },
          { value: 'SELLER', displayName: 'system.partner.partnerTypeSeller' },
          { value: 'SUPPLIER', displayName: 'system.partner.partnerTypeSupplier' },
          { value: 'BOTH', displayName: 'system.partner.partnerTypeBoth' },
        ],
        isTranslate: true
      },
      {
        type: 'select',
        key: 'partnerStatus',
        label: 'system.partner.partnerStatusStr',
        class: 'col-md-3',
        options: [
          { value: 'all', displayName: 'common.allStatus' },
          { value: '0', displayName: 'common.inactive' },
          { value: '1', displayName: 'common.active' },
        ],
        isTranslate: true
      }
    ],
    showApplyButton: true,
    showClearButton: true,
    applyButtonText: 'common.apply',
    clearButtonText: 'common.clear',
    applyButtonIcon: 'filter_list',
    classButton: 'col-md-3'
  };

  ngOnInit() {
    this.onApplyFilters({});
  }

  onDrawerClosed() {
    this.drawerOpen = false;
    this.partnerId = undefined;
  }

  onDrawerOpen() {
    this.partnerId = undefined;
    this.drawerOpen = true;
  }

  onAddPartner(): void {
    this.router.navigate(['/system/partner-management/create']);
  }

  onViewPartner(partner: Partner): void {
    this.router.navigate(['/system/partner-management/', partner.id]);
  }

  onEditPartner(partner: Partner): void {
    this.router.navigate(['/system/partner-management/edit', partner.id]);
  }

  onStatusToggle(partner: Partner, event: any) {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.partner.confirmChangeStatus', { status: partner.partnerStatus === 1 ? this.translate.translate('common.disable') : this.translate.translate('common.enable'), partnerName: partner.partnerName }),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      partner._disabled = true;
      this.loading = true

      if (partner.partnerStatus === 1) {
        this.api.disablePartner(partner.id).pipe(finalize(() => {
          this.loading = false;
          partner._disabled = false;
        })).subscribe((response: any) => {
          this.load();
          this.snack.open(this.translate.translate('system.partner.disablePartnerSuccess'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }, (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.partner.disablePartnerFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        });
      } else {
        this.api.enablePartner(partner.id).pipe(finalize(() => {
          this.loading = false;
          partner._disabled = false;
        })).subscribe((response: any) => {
          this.load();
          this.snack.open(this.translate.translate('system.partner.enablePartnerSuccess'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }, (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.partner.enablePartnerFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        });
      }

      
    });
  }

  onDeletePartner(partner: Partner): void {
    this.loading = true;
    this.isLoadingFilter = true;
    this.api.deletePartner(partner.id)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.isLoadingFilter = false;
      })
    )
    .subscribe((response: any) => {
      this.snack.open(this.translate.translate('system.partner.deletePartnerSuccess'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      this.load();
    },
    err => {
      this.snack.open(err?.error?.errorMessage || this.translate.translate('system.partner.deletePartnerFailed'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
    });
  }

  private buildPayload(): PartnerPagePayload {
    const c = this.criteria();
    const payload: PartnerPagePayload = {
      page: this.page - 1,
      size: this.size,
    }
    if (c.keyword) payload.keyword = c.keyword.trim();
    if (c.partnerType && c.partnerType != 'all') payload.partnerType = c.partnerType;
    if (c.partnerStatus && c.partnerStatus != 'all') payload.partnerStatus = c.partnerStatus;
    return payload;
  }

  load(): void {
    this.loading = true;
    const payload = this.buildPayload();
    this.isLoadingFilter = true;
    this.api.getPartnerPage(payload)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.isLoadingFilter = false;
      })
    )
    .subscribe((response: any) => {
      this.partners = response?.content.map((item: any) => ({
        ...item,
        _enabled: item.partnerStatus === 1 ? true : false,
        status:  item.partnerStatus === 1 ? 'common.active' : 'common.inactive',
        partnerType: item.partnerType === 'SELLER' ? 'system.partner.partnerTypeSeller' : item.partnerType === 'SUPPLIER' ? 'system.partner.partnerTypeSupplier' : 'system.partner.partnerTypeBoth'
      })) || [];
      this.total = response?.totalElements || 0;
      this.totalPages = response?.totalPages || 1;
      this.currentPage = response?.number + 1 || 1;
    },
    err => {
      this.loading = false;
      this.isLoadingFilter = false;
    });
  }

  onApplyFilters(c: PartnerFilterCriteria) {
    this.criteria.set(c);
    this.page = 1;
    this.load();
  }

  onClearFilters() {}

  onPageChange(p: number) {
    if (p < 1) return;
    this.page = p;
    this.load();
  }

  onPageSizeChange(s: number) {
    this.size = s;
    this.page = 1;
    this.load();
  }

}


