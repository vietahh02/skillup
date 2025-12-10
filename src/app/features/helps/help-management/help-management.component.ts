import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { ActionWithHandler, TableConfig } from '../../../shared/components/generic-table/generic-table.model';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { DialogService } from '../../../services/dialog.service';
import { LanguageService } from '../../../services/language.service';
import { Help, HelpFilterCriteria, HelpPagePayload } from '../../../models/help.model';
import { ApiHelpServices } from '../../../services/help.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-help-management',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    GenericTableComponent,
    TranslatePipe
],
  templateUrl: './help-management.component.html',
  styleUrl: './help-management.component.scss'
})
export class HelpManagementComponent implements OnInit {
  private translate = inject(LanguageService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);
  private helpApi = inject(ApiHelpServices);
  private dialogService = inject(DialogService);
  
  helps: Help[] = [];
  helpTableConfig!: TableConfig;

  ngOnInit() {
    this.onApplyHelpFilters({});

    this.helpTableConfig = {
    columns: [
      { key: 'code', header: 'system.document.code', align: 'center' },
      { key: 'title', header: 'system.help.titleHelp', align: 'center' }
    ],
    actions: this.setupActionsTableConfig(),
    enablePagination: false,
    enableStatusToggle: false,
    emptyMessage: 'common.noData'
  }
  }

  private helpCriteria = signal<HelpFilterCriteria>({});
  loadingHelp = false;

  setupActionsTableConfig(): ActionWithHandler[] {
    const actions: ActionWithHandler[] = [];
      actions.push({
        type: 'view',
        tooltip: 'system.help.view',
        icon: 'visibility',
        color: '#1b14ec',
        handler: (item: Help) => this.onViewHelp(item)
      });
      actions.push({
        type: 'edit',
        tooltip: 'system.help.edit',
        icon: 'edit',
        color: '#000',
        handler: (item: Help) => this.onEditHelp(item)
      });
      actions.push({
        type: 'delete',
        tooltip: 'system.help.delete',
        icon: 'delete',
        color: '#ff0404',
        handler: (item: Help) => this.onDeleteHelp(item)
      });
    return actions;
  }

  buildHelpPayload(): HelpPagePayload {
    const c = this.helpCriteria();
    const payload: HelpPagePayload = {};
    if (c.keyword) payload.keyword = c.keyword.trim();
    return payload;
  }

  loadHelp() {
    this.loadingHelp = true;
    const payload = this.buildHelpPayload();
    this.helpApi.getHelpPage(payload)
      .pipe(finalize(() => {
        this.loadingHelp = false;
      }))
      .subscribe({
        next: (res: any) => {
          this.helps = res;
        },
        error: (err: any) => {
          this.snack.open(err?.error?.errorMessage || this.translate.translate('system.help.failedToLoadHelps'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
  }

  onApplyHelpFilters(filters: HelpFilterCriteria) {
    this.helpCriteria.set(filters);
    this.loadHelp();
  }

  onNewHelp() {
    this.router.navigate(['/system/help-management/create']);
  }
  
  onViewHelp(help: Help) {
    this.router.navigate(['/system/help-management', help.code]);
  }

  onEditHelp(help: Help) {
    this.router.navigate(['/system/help-management/edit', help.code]);
  }

  onDeleteHelp(help: Help) {
    this.dialogService.confirm({
      title: this.translate.translate('system.help.deleteHelp'),
      message: this.translate.translate('system.help.deleteHelpMessage'),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe({
      next: (result: boolean) => {
        if (!result) return;
        this.loadingHelp = true;
        this.helpApi.deleteHelp(help.id).pipe(finalize(() => {
          this.loadingHelp = false;
        })).subscribe({
          next: () => {
            this.loadHelp();
            this.snack.open(this.translate.translate('system.help.deletedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          },
          error: (err: any) => {
            this.snack.open(err?.error?.errorMessage || this.translate.translate('system.help.failedToDeleteHelp'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    });
  }
}
