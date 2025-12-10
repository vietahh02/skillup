import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { finalize, map } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Role, RoleFilterCriteria, RolePagePayload } from '../../../models/role.model';
import { ApiRoleSystemServices } from '../../../services/system-role.service';
import { CreateUpdateRoleComponent } from "../create-update-role/create-update-role.component";
import { MatSidenavModule } from '@angular/material/sidenav';
import { TableConfig } from '../../../shared/components/generic-table/generic-table.model';
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { GenericFilterComponent } from "../../../shared/components/generic-filter/generic-filter.component";
import { FilterConfig, FilterFieldConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { ApiPartnerServices } from '../../../services/partner.service';
import { Partner } from '../../../models/partner.model';
import { DataSourceFunction, SearchParams, SelectableItem } from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import { ApiAuthServices } from '../../../services/auth.service';
import { PAGES, PERMISSIONS } from '../../../utils/shared/constants/auth.constants';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-role-management',
  imports: [MatIconModule, MatSidenavModule, GenericTableComponent, GenericFilterComponent, TranslatePipe],
  templateUrl: './role-management.component.html',
  styleUrl: './role-management.component.scss'
})
export class SystemRoleManagementComponent {
  
  authService = inject(ApiAuthServices);
  permissions = PERMISSIONS;
  pages = PAGES;
  private translate = inject(LanguageService);

  rows: Role[] = [];
  total = 0;
  drawerOpen = false;

  roleId?: number | string;
  page = 1;
  size = DEFAULT_PAGE_SIZE;
  totalPages = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private criteria = signal<RoleFilterCriteria>({});
  loading = false;
  isLoadingFilter = false;
  filterFields: FilterFieldConfig[] = [];
  roleFilterConfig: FilterConfig = {
    fields: []
  };
  initialFilterValues = { partnerId: 'all', isEnabled: 'all' };

  constructor(
    private api: ApiRoleSystemServices,
    private dialogService: DialogService,
    private snack: MatSnackBar,
    private partnerApi: ApiPartnerServices,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.initialFilterValues.partnerId = this.authService.getPartnerId() || 'all';
    this.onApplyFilters(this.initialFilterValues);
    this.getFilterFields();
    this.roleFilterConfig = {
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
      placeholder: 'system.role.placeholderSearch',
      icon: 'search'
    });
    if (this.authService.isAdminHub()) {
      this.filterFields.push({
        type: 'select-searchable',
        key: 'partnerId',
        class: 'col-md-3',
        placeholder: 'system.role.selectPartner',
        icon: 'search',
        options: [{ value: 'all', displayName: "All partners" },{ value: true, displayName: 'My Roles (Admin)' }],
        searchableConfig: {
          dataSource: this.getRolesDataSource(),
          config: {
            placeholder: 'system.role.selectPartner',
          }
        }
      });
    }
    this.filterFields.push({
      type: 'select',
      key: 'isEnabled',
      class: 'col-md-3',
      placeholder: 'system.role.selectStatus',
      options: [
        { value: 'all', displayName: 'common.allStatus' },
        { value: '0', displayName: 'common.inactive' },
        { value: '1', displayName: 'common.active' },
      ],
      isTranslate: true
    });
  }
  
  roleTableConfig: TableConfig = {
    columns: [
      { key: 'roleCode', header: 'system.role.roleCode', align: 'center' },
      { key: 'roleName', header: 'system.role.roleName', align: 'center' },
      { key: 'status', header: 'system.role.status', align: 'center', template: 'pill', customColor: [
        { code: 'common.active', color: '#137333' },
        { code: 'common.inactive', color: '#d41900' }
      ], isTranslate: true },
      { key: 'partnerName', header: 'system.role.partner', align: 'center' },
      { key: 'permissions', header: 'system.role.permissions', align: 'center', customValue: (item: Role) => this.getPermissionValue(item) },
    ],
    actions: [
      { type: 'edit', tooltip: 'common.edit', icon: 'edit', color: '#000', 
        visible: () => this.authService.isAdmin() || this.authService.isPermissionGranted(this.permissions.ROLE_UPDATE),
        handler: (item: Role) => this.onEditRole(item) 
      },
      { type: 'delete', tooltip: 'common.delete', icon: 'delete', color: '#ff0404', 
        visible: () => this.authService.isAdmin() || this.authService.isPermissionGranted(this.permissions.ROLE_DELETE), 
        handler: (item: Role) => this.onDelete(item) 
      },
    ],
    showSequenceNumber: true,
    enablePagination: true,
    enableStatusToggle: () => this.authService.isAdmin() || this.authService.isPermissionGranted(this.permissions.ROLE_UPDATE),
    emptyMessage: 'common.noData'
  }; 

  onDrawerClosed() {
    this.drawerOpen = false;
  }

  onDrawerOpen() {
    this.roleId = undefined;
    this.drawerOpen = true;
  }

  onCreateRole() {
    this.dialog.open(CreateUpdateRoleComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { loadData: () => this.load() },
      disableClose: true,
      autoFocus: false
    });
  }

  onEditRole(role: Role) {
    this.dialog.open(CreateUpdateRoleComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { roleId: role.id, loadData: () => this.load() },
      disableClose: true,
      autoFocus: false
    });
  }

  getRolesDataSource(): DataSourceFunction {
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

  private buildPayload(): RolePagePayload {
    const c = this.criteria();

    const payload: RolePagePayload = {
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
    this.api.getRolePage(payload)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.isLoadingFilter = false;
        })
      )
      .subscribe((result: any) => {
        this.rows = result?.content.map((item: any) => ({
          ...item,
          status: item.enabled ? 'common.active' : 'common.inactive',
          _enabled: item.enabled,
          _disabled: false
        })) as Role[];
        this.total = result.totalElements;
        this.totalPages = result.totalPages;
        this.page = result.number + 1;
      });
  }

  private getPermissionValue(role: Role): string {
    const template = this.translate.translate('system.role.permissionsValue');
    return template.replace('{{pageSettingCount}}', role.pageSettingCount.toString()).replace('{{permissionCount}}', role.permissionCount.toString());
  }

  onApplyFilters(c: RoleFilterCriteria) {
    this.criteria.set(c);
    this.page = 1;
    this.load();
  }

  onClearFilters() {
  }

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

  onStatusToggle(role: Role, event: any) {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.role.confirmChangeStatus', { status: !role.enabled ? this.translate.translate('common.enable') : this.translate.translate('common.disable') }),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      // role._enabled = true;
      role._disabled = true;
      this.loading = true

      this.api[!role.enabled ? 'enableRole' : 'disableRole'](role.id).pipe(finalize(() => {
        this.loading = false;
        // role._enabled = false;
        role._disabled = false;
      })).subscribe({
        next: (res) => {
          this.load();
          this.snack.open(
            !role.enabled ? this.translate.translate('system.role.enabledSuccessfully') : this.translate.translate('system.role.disabledSuccessfully'),
            '',
            { duration: 2200, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['success-snackbar', 'custom-snackbar'] }
          );
        },
        error: (e) => {
          this.snack.open(
            e?.error?.errorMessage || this.translate.translate('system.role.failedToEnableRole'),
            '',
            { duration: 2200, horizontalPosition: 'right', verticalPosition: 'top', panelClass: ['error-snackbar', 'custom-snackbar'] }
          );
        }
      });
    });
  }

  onDelete(role: Role) {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.role.confirmDeleteRole'),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }
      this.loading = true
      this.api.deleteRole(role.id).subscribe({
        next: (res) => {
           this.load();
            this.snack.open(
              this.translate.translate('system.role.roleDeletedSuccessfully'),
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
            e?.error?.errorMessage || this.translate.translate('system.role.failedToDeleteRole'),
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
}
