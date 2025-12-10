import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { PageSetting, ActionSetting, DocumentTemplate, PageSettingUpdate, ActionSettingUpdate, ConfigPagePayload } from '../../models/config.model';
import { GenericTableComponent } from "../../shared/components/generic-table/generic-table.component";
import { TableConfig } from '../../shared/components/generic-table/generic-table.model';
import { ApiConfigServices } from '../../services/system-config.service';
import { finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../utils/translate.pipe';
import { DEFAULT_PAGE_SIZE } from '../../utils/shared/constants/pagination.constants';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-system-config',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatTableModule,
    GenericTableComponent,
    TranslatePipe
],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.scss'
})
export class SystemConfigComponent implements OnInit {
  pagesSettings: PageSetting[] = [];
  actionsSettings: ActionSetting[] = [];
  documentTemplates: DocumentTemplate[] = [];

  // Track original state for comparison
  originalPagesSettings: PageSetting[] = [];
  originalActionsSettings: ActionSetting[] = [];

  // Track changed items
  changedPages: PageSetting[] = [];
  changedActions: ActionSetting[] = [];

  constructor(private configApi: ApiConfigServices, private snack: MatSnackBar, private translate: LanguageService) {
  }

  ngOnInit() {
    this.loadActions();
    this.loadPages();
  }

  loadingPages = false;
  currentPagePages = 1;
  totalItemsPages = 0;
  totalPagesPages = 1;
  pageSizePages = DEFAULT_PAGE_SIZE;
  
  loadingActions = false;
  currentPageActions = 1;
  totalItemsActions = 0;
  totalPagesActions = 1;
  pageSizeActions = DEFAULT_PAGE_SIZE;

  actionsTableConfig: TableConfig = {
    columns: [
      { key: 'permissionCode', header: 'ID', align: 'center' },
      { key: 'permissionName', header: 'system.config.name', align: 'center' },
      { key: 'isEnabled', header: 'system.config.enable', align: 'center', template: 'toggle', 
        actionHandler: { type: 'toggle', handler: (item: ActionSetting, event: any) => this.onActionDisableToggleChange(item, event) }
      },
      { key: 'isOtpRequired', header: 'system.config.otpRequired', align: 'center', template: 'toggle', 
        actionHandler: { type: 'toggle', handler: (item: ActionSetting, event: any) => this.onActionOtpToggleChange(item, event) }
      },
      { key: 'approvalSetting', header: 'system.config.approvalSetting', align: 'center' }
    ],
    showSequenceNumber: true,
    enablePagination: true,
    emptyMessage: 'common.noData'
  }

  pagesTableConfig: TableConfig = {
    columns: [
      { key: 'path', header: 'system.config.path', align: 'left', 
        customValue: (item: PageSetting) => this.getPagePath(item),
        cellClass: 'multi-line-cell'
      },
      { key: 'enabled', header: 'system.config.enable', align: 'center', template: 'toggle', 
        actionHandler: { type: 'toggle', handler: (item: PageSetting, event: any) => this.onPageDisableToggleChange(item, event) }
      },
    ],
    showSequenceNumber: true,
    enablePagination: true,
    emptyMessage: 'common.noData'
  }

  buildActionsPayload(): ConfigPagePayload {
    return {
      page: this.currentPageActions - 1,
      size: this.pageSizeActions
    };
  }

  buildPagesPayload(): ConfigPagePayload {
    return {
      page: this.currentPagePages - 1,
      size: this.pageSizePages
    };
  }

  loadActions() {
    this.loadingActions = true;
    this.configApi.getActions(this.buildActionsPayload()).pipe(finalize(() => this.loadingActions = false)).subscribe({
      next: (actions: any) => {
        const newActions = actions.content || [];
        this.updateOriginalStatesForActions(newActions);
        this.actionsSettings = this.applyChangesToActions(newActions);
        this.totalPagesActions = actions.totalPages;
        this.totalItemsActions = actions.totalElements;
        this.currentPageActions = actions.number + 1;
      },
      error: (error: any) => {
        this.snack.open(error?.error?.errorMessage || this.translate.translate('system.config.failedToLoadActions'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      }
    });
  }

  loadPages() {
    this.loadingPages = true;
    this.configApi.getPages(this.buildPagesPayload()).pipe(finalize(() => this.loadingPages = false)).subscribe({
      next: (pages: any) => {
        const newPages = pages.content || [];
        this.updateOriginalStatesForPages(newPages);
        this.pagesSettings = this.applyChangesToPages(newPages);
        this.totalPagesPages = pages.totalPages;
        this.totalItemsPages = pages.totalElements;
        this.currentPagePages = pages.number + 1;
      },
      error: (error: any) => {
        this.snack.open(error?.error?.errorMessage || this.translate.translate('system.config.failedToLoadPages'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      }
    });
  }

  getPagePath(page: PageSetting) {
    return `${page.pageName} \n ${page.path}`;
  }

  private addToChangedPages(page: PageSetting) {
    const existingIndex = this.changedPages.findIndex(p => p.id === page.id);
    if (existingIndex === -1) {
      this.changedPages.push({...page});
    } else {
      this.changedPages[existingIndex] = {...page};
    }
  }

  private removeFromChangedPages(pageId: number) {
    this.changedPages = this.changedPages.filter(p => p.id !== pageId);
  }

  private addToChangedActions(action: ActionSetting) {
    const existingIndex = this.changedActions.findIndex(a => a.id === action.id);
    if (existingIndex === -1) {
      this.changedActions.push({...action});
    } else {
      this.changedActions[existingIndex] = {...action};
    }
  }

  private removeFromChangedActions(actionId: number) {
    this.changedActions = this.changedActions.filter(a => a.id !== actionId);
  }

  private isPageStateChanged(page: PageSetting): boolean {
    const original = this.originalPagesSettings.find(p => p.id === page.id);
    return original ? original.enabled !== page.enabled : false;
  }

  private isActionStateChanged(action: ActionSetting): boolean {
    const original = this.originalActionsSettings.find(a => a.id === action.id);
    return original ? 
      (original.isEnabled !== action.isEnabled || original.isOtpRequired !== action.isOtpRequired) : 
      false;
  }

  private applyChangesToPages(pages: PageSetting[]): PageSetting[] {
    return pages.map(page => {
      const changedPage = this.changedPages.find(cp => cp.id === page.id);
      if (changedPage) {
        return { ...page, enabled: changedPage.enabled };
      }
      return page;
    });
  }

  private applyChangesToActions(actions: ActionSetting[]): ActionSetting[] {
    return actions.map(action => {
      const changedAction = this.changedActions.find(ca => ca.id === action.id);
      if (changedAction) {
        return { 
          ...action, 
          isEnabled: changedAction.isEnabled,
          isOtpRequired: changedAction.isOtpRequired 
        };
      }
      return action;
    });
  }

  private updateOriginalStatesForPages(newPages: PageSetting[]) {
    newPages.forEach(newPage => {
      const isChanged = this.changedPages.some(cp => cp.id === newPage.id);
      if (!isChanged) {
        const existingIndex = this.originalPagesSettings.findIndex(op => op.id === newPage.id);
        if (existingIndex >= 0) {
          this.originalPagesSettings[existingIndex] = { ...newPage };
        } else {
          this.originalPagesSettings.push({ ...newPage });
        }
      }
    });
  }

  private updateOriginalStatesForActions(newActions: ActionSetting[]) {
    newActions.forEach(newAction => {
      const isChanged = this.changedActions.some(ca => ca.id === newAction.id);
      if (!isChanged) {
        const existingIndex = this.originalActionsSettings.findIndex(oa => oa.id === newAction.id);
        if (existingIndex >= 0) {
          this.originalActionsSettings[existingIndex] = { ...newAction };
        } else {
          this.originalActionsSettings.push({ ...newAction });
        }
      }
    });
  }

  onPageDisableToggleChange(page: PageSetting, event: any) {
    page.enabled = event.checked;
    
    if (this.isPageStateChanged(page)) {
      this.addToChangedPages(page);
    } else {
      this.removeFromChangedPages(page.id);
    }
  }

  onActionDisableToggleChange(action: ActionSetting, event: any) {
    action.isEnabled = event.checked;
    
    if (this.isActionStateChanged(action)) {
      this.addToChangedActions(action);
    } else {
      this.removeFromChangedActions(action.id);
    }
  }

  onActionOtpToggleChange(action: ActionSetting, event: any) {
    action.isOtpRequired = event.checked;
    
    if (this.isActionStateChanged(action)) {
      this.addToChangedActions(action);
    } else {
      this.removeFromChangedActions(action.id);
    }
  } 

  onUpdatePages() {
    if (this.changedPages.length === 0) {
      this.snack.open(this.translate.translate('system.config.noChangesToSaveForPages'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
    } else {
      this.loadingPages = true;
      const payload: PageSettingUpdate = {
        pageSettingIds: this.changedPages.map(page => page.id)
      };
      this.configApi.updatePages(payload).pipe(finalize(() => this.loadingPages = false)).subscribe({
        next: () => {
          this.clearAllChangesPages();
          this.snack.open(this.translate.translate('system.config.pageChangesSavedSuccessfully'), '', { duration: 3000, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        },
        error: (error: any) => {
          this.snack.open(error?.error?.errorMessage || this.translate.translate('system.config.failedToSavePageChanges'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
  }

  onUpdateActions() {
    if (this.changedActions.length === 0) {
      this.snack.open(this.translate.translate('system.config.noChangesToSaveForActions'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
    } else {
      this.loadingActions = true;
      const payload: ActionSettingUpdate[] = this.changedActions.map(action => ({
        permissionId: action.id,
        optRequired: action.isOtpRequired,
        enabled: action.isEnabled
      }));
      this.configApi.updateActions(payload).pipe(finalize(() => this.loadingActions = false)).subscribe({
        next: () => {
          this.clearAllChangesActions();
          this.snack.open(this.translate.translate('system.config.actionChangesSavedSuccessfully'), '', { duration: 3000, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        },
        error: (error: any) => {
          this.snack.open(error?.error?.errorMessage || this.translate.translate('system.config.failedToSaveActionChanges'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      });
    }
  }

  getChangesSummary() {
    return {
      changedPagesCount: this.changedPages.length,
      changedActionsCount: this.changedActions.length,
      changedPages: this.changedPages,
      changedActions: this.changedActions
    };
  }

  clearAllChanges() {
    this.clearAllChangesPages();
    this.clearAllChangesActions();
  }

  clearAllChangesPages() {
    this.changedPages = [];
    this.originalPagesSettings = JSON.parse(JSON.stringify(this.pagesSettings));
  }

  clearAllChangesActions() {
    this.changedActions = [];
    this.originalActionsSettings = JSON.parse(JSON.stringify(this.actionsSettings));
  }

  hasUnsavedChangesPages(): boolean {
    return this.changedPages.length > 0;
  }

  hasUnsavedChangesActions(): boolean {
    return this.changedActions.length > 0;
  }

  onPageActionsChange(page: number) {
    this.currentPageActions = page;
    this.loadActions();
  }

  onPageSizeActionsChange(size: number) {
    this.pageSizeActions = size;
    this.currentPageActions = 1;
    this.loadActions();
  }

  onPagePagesChange(page: number) {
    this.currentPagePages = page;
    this.loadPages();
  }

  onPageSizePagesChange(size: number) {
    this.pageSizePages = size;
    this.currentPagePages = 1;
    this.loadPages();
  }
}

