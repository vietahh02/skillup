import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { finalize, pipe, map } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { User, UserFilterCriteria, UserPagePayload } from '../../../models/user.model';
import { ApiUserSystemServices } from '../../../services/system-user.service';
import { MatSidenavModule } from '@angular/material/sidenav'; 
import { CommonModule } from '@angular/common';
import { CreateUpdateUserComponent } from "../create-update-user/create-update-user.component";
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { TableConfig } from '../../../shared/components/generic-table/generic-table.model';
import { ActionWithHandler } from '../../../shared/components/generic-table/generic-table.model';
import { FilterConfig, FilterFieldConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { GenericFilterComponent } from "../../../shared/components/generic-filter/generic-filter.component";
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { DataSourceFunction, SearchParams, SelectableItem } from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import { Partner } from '../../../models/partner.model';
import { ApiPartnerServices } from '../../../services/partner.service';
import { ApiAuthServices } from '../../../services/auth.service';
import { PAGES, PERMISSIONS } from '../../../utils/shared/constants/auth.constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, MatIconModule, MatSidenavModule, GenericFilterComponent, GenericTableComponent, TranslatePipe],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class SystemUserManagementComponent {

  authService = inject(ApiAuthServices);
  permissions = PERMISSIONS;
  pages = PAGES;

  rows: User[] = [];
  total = 0;
  drawerOpen = false;

  userId?: string | number;
  page = 1;
  size = DEFAULT_PAGE_SIZE;
  totalPages = 1;
  currentPage = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private criteria = signal<UserFilterCriteria>({});
  loading = false;
  isLoadingFilter = false;

  initialUserFilterValues = { partnerId: 'all', isEnabled: 'all' };
  filterFields: FilterFieldConfig[] = [];
  userFilterConfig: FilterConfig = {
    fields: []
  }

  constructor(
    private api: ApiUserSystemServices,
    private partnerApi: ApiPartnerServices,
    private dialogService: DialogService,
    private snack: MatSnackBar,
    private translate: LanguageService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initialUserFilterValues.partnerId = this.authService.getPartnerId() || 'all';
    this.onApplyFilters(this.initialUserFilterValues);
    this.getFilterFields();
    this.userFilterConfig = {
      fields: this.filterFields,
      showApplyButton: true,
      showClearButton: true,
      applyButtonText: 'common.apply',
      clearButtonText: 'common.clear',
      applyButtonIcon: 'filter_list',
      classButton: this.filterFields.length > 2 ? 'col-md-3' : 'col-md-6'
    };
  }

  getFilterFields() {
    this.filterFields.push({
      type: 'text',
      key: 'keyword',
      class: 'col-md-3',
      placeholder: 'system.user.placeholderSearch',
      icon: 'search'
    });
    if (this.authService.isAdminHub()) {
      this.filterFields.push({
        type: 'select-searchable',
        key: 'partnerId',
        class: 'col-md-3',
        placeholder: 'system.user.selectPartner',
        icon: 'search',
        options: [{ value: 'all', displayName: 'All partners' },{ value: true, displayName: 'My Users (Admin)' }],
        searchableConfig: {
          dataSource: this.getPartnersDataSource(),
          config: {
            placeholder: 'system.user.selectPartner',
          }
        }
      });
    }
    this.filterFields.push({
      type: 'select',
      key: 'isEnabled',
      class: 'col-md-3',
      placeholder: 'system.user.selectStatus',
      options: [
        { value: 'all', displayName: 'common.allStatus' },
        { value: '0', displayName: 'common.inactive' },
        { value: '1', displayName: 'common.active' },
      ],
      isTranslate: true
    });
  }

  userTableConfig: TableConfig = {
      columns: [
        { 
          key: 'username', 
          header: 'system.user.username',
          align: 'center',
        },
        { 
          key: 'lastActivity', 
          header: 'system.user.lastActivity', 
          align: 'center',
          customValue: (item: User) => this.getTimeAgoValue(item)
        },
        { 
          key: 'email', 
          header: 'system.user.email', 
          align: 'center',
          isTruncate: true
        },
        { 
          key: 'phoneNumber', 
          header: 'system.user.phoneNumber', 
          align: 'center'
        },
        { 
          key: 'roleNames', 
          header: 'system.user.roles', 
          align: 'center',
          isTruncate: true
        },
        { 
          key: 'status', 
          header: 'system.user.status', 
          template: 'pill',
          align: 'center',
          customColor: [
            { code: 'common.active', color: '#137333' },
            { code: 'common.inactive', color: '#d41900' }
          ],
          isTranslate: true
        },
        { 
          key: 'partnerName', 
          header: 'system.user.partner', 
          align: 'center',
          isTruncate: true
        },
      ],
      actions: [
        { 
          type: 'edit', 
          tooltip: 'common.edit',
          icon: 'edit',
          color: '#000',
          visible: () => this.authService.isAdmin() || this.authService.isPermissionGranted(this.permissions.ACCOUNT_UPDATE),
          handler: (item: User) => this.onEditUser(item)
        } as ActionWithHandler,
        { 
          type: 'delete', 
          tooltip: 'common.delete',
          icon: 'delete',
          color: '#ff0404',
          visible: () => this.authService.isAdmin() || this.authService.isPermissionGranted(this.permissions.ACCOUNT_DELETE),
          handler: (item: User) => this.onDelete(item)
        } as ActionWithHandler,
        { 
          type: 'custom',
          tooltip: 'common.resetPassword',
          icon: 'lock_reset',
          color: '#FF9800',
          visible: (item: User) => this.authService.isAdmin() && item.enabled || this.authService.isPermissionGranted(this.permissions.ACCOUNT_RESET) && item.enabled,
          handler: (item: User, event: any) => this.onResetPassword(item, event)
        } as ActionWithHandler
      ],
      showSequenceNumber: true,
      enablePagination: true,
      enableStatusToggle: () => this.authService.isAdmin() || this.authService.isPermissionGranted(this.permissions.ACCOUNT_UPDATE),
      emptyMessage: 'common.noData'
  };
  
  onDrawerClosed() {
    this.drawerOpen = false;
    this.userId = undefined;
  }

  onDrawerOpen() {
    this.userId = undefined;
    this.drawerOpen = true;
  }

  onCreateUser() {
    this.dialog.open(CreateUpdateUserComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { loadData: () => this.load() },
      disableClose: true,
      autoFocus: false
    });
  }

  onEditUser(user: User) {
    this.dialog.open(CreateUpdateUserComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { userId: user.id, loadData: () => this.load() },
      disableClose: true,
      autoFocus: false
    });
  }

  onResetPassword(user: User, event: Event) {
    const button = event?.currentTarget as HTMLButtonElement;
    if (button) {
      button.disabled = true;
    }
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'), 
      message: this.translate.translate('system.user.confirmResetPassword'),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        button.disabled = false;
        return;
      }
      this.loading = true
      this.api.resetPassword(user.id).pipe(finalize(() => {
        this.loading = false;
        button.disabled = false;
      })).subscribe({
        next: (res) => {
          this.snack.open(
            this.translate.translate('system.user.resetPasswordSuccessful'),
            '',
            { duration: 2200, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['success-snackbar', 'custom-snackbar'] }
          );
        },
        error: (e) => {
          this.snack.open(
            e?.error?.errorMessage || this.translate.translate('system.user.resetPasswordFailed'),
            '',
            { duration: 2200, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['error-snackbar', 'custom-snackbar'] }
          );
        }
      });
    });
  }

  onStatusToggle(user: User, event: any) {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.user.confirmChangeStatus', { status: !user.enabled ? this.translate.translate('common.enable') : this.translate.translate('common.disable') }),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      user._disabled = true;
      this.loading = true

      this.api[!user.enabled ? 'enableUser' : 'disableUser'](user.id).pipe(finalize(() => {
        this.loading = false;
        user._disabled = false;
      })).subscribe({
        next: (res) => {
          this.load();
          this.snack.open(
            !user.enabled ? this.translate.translate('system.user.enableUserSuccessful') : this.translate.translate('system.user.disableUserSuccessful'),
            '',
            { duration: 2200, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['success-snackbar', 'custom-snackbar'] }
          );
        },
        error: (e) => {
          this.snack.open(
            e?.error?.errorMessage || !user.enabled ? this.translate.translate('system.user.enableUserFailed') : this.translate.translate('system.user.disableUserFailed'),
            '',
            { duration: 2200, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['error-snackbar', 'custom-snackbar'] }
          );
        }
      });
    });
  }

  onDelete(user: User) {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.user.confirmDeleteUser'),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.loading = true
      this.api.deleteUser(user.id).pipe(finalize(() => this.loading = false)).subscribe({
        next: (res) => {
           this.load();
            this.snack.open(
              this.translate.translate('system.user.deleteUserSuccessful'),
              '',
              { 
                duration: 2200, 
                horizontalPosition: 'right', 
                verticalPosition: 'top',
                panelClass: ['success-snackbar', 'custom-snackbar']
              }
            );
        },
        error: (e) => {
          this.snack.open(
            e?.error?.errorMessage || this.translate.translate('system.user.deleteUserFailed'),
            '',
            { 
              duration: 2200, 
              horizontalPosition: 'right', 
              verticalPosition: 'top',
              panelClass: ['error-snackbar', 'custom-snackbar']
            }
          );
        }
      });
    });
  }

  getPartnersDataSource(): DataSourceFunction {
    return (params: SearchParams) => {
      const payload: any = {
        page: params.page,
        size: params.size
      };

      if (params.keyword) {
        payload.keyword = params.keyword;
      }
      return this.partnerApi.getPartnerPage(payload).pipe(
        map((res: any) =>
          (res?.content as Partner[] || []).map((item: Partner) => ({
            value: item.id,
            displayName: item.partnerName,
          } as SelectableItem))
        )
      );
    };
  }

  private buildPayload(): UserPagePayload {
    const c = this.criteria();

    const payload: UserPagePayload = {
      page: this.page - 1,
      size: this.size,
    };

    if (c.keyword) payload.keyword = c.keyword.trim();
    if (c.partnerId && c.partnerId != 'all') {
      if (c.partnerId === true) {
        payload.isHub = true;
      } else {
        payload.partnerId = c.partnerId;
      }
    }
    if (c.isEnabled && c.isEnabled != 'all') payload.isEnabled = c.isEnabled;

    return payload;
  }

  load() {
    this.loading = true;
    const payload = this.buildPayload();
    this.isLoadingFilter = true;
    this.api.getUserPage(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isLoadingFilter = false;
        })
      )
      .subscribe((result: any) => {
        this.rows = result?.content.map((item: any) => ({
          ...item,
          lastActivity: `${this.getTimeAgo(item.latestLogTime)} \n ${item.latestIps || 'N/A'}`,
          status: item.enabled ? 'common.active' : 'common.inactive',
          _enabled: item.enabled
        }) as User);
        this.total = result.totalElements;
        this.totalPages = result.totalPages;
        this.currentPage = result.number + 1;
      },
      err => {

      });
  }

  private getTimeAgoValue(user: User) {
    return `${this.getTimeAgo(user.latestLogTime)} \n ${user.latestIps || 'N/A'}`;
  }
  
  private getTimeAgo(date: string) {
    if (!date) {
      return this.translate.translate('system.user.never');
    }

    const now = new Date();
    const dateObj = new Date(date);
    const diff = now.getTime() - dateObj.getTime();
    
    if (diff < 0) {
      return this.translate.translate('system.user.justNow');
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} ${years > 1 ? this.translate.translate('system.user.years') : this.translate.translate('system.user.year')} ${this.translate.translate('system.user.ago')}`;
    } else if (months > 0) {
      return `${months} ${months > 1 ? this.translate.translate('system.user.months') : this.translate.translate('system.user.month')} ${this.translate.translate('system.user.ago')}`;
    } else if (days > 0) {
      return `${days} ${days > 1 ? this.translate.translate('system.user.days') : this.translate.translate('system.user.day')} ${this.translate.translate('system.user.ago')}`;
    } else if (hours > 0) {
      return `${hours} ${hours > 1 ? this.translate.translate('system.user.hours') : this.translate.translate('system.user.hour')} ${this.translate.translate('system.user.ago')}`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes > 1 ? this.translate.translate('system.user.minutes') : this.translate.translate('system.user.minute')} ${this.translate.translate('system.user.ago')}`;
    } else if (seconds > 5) {
      return `${seconds} ${seconds > 1 ? this.translate.translate('system.user.seconds') : this.translate.translate('system.user.second')} ${this.translate.translate('system.user.ago')}`;
    } else {
      return this.translate.translate('system.user.fewSecondsAgo');
    }
  }

  onApplyFilters(c: UserFilterCriteria) {
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
