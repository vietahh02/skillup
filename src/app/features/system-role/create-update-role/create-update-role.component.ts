import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { Component, EventEmitter, inject, Inject, Input, Output, SimpleChanges } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize, map } from "rxjs/operators";
import { ApiRoleSystemServices } from "../../../services/system-role.service";
import { TranslatePipe } from "../../../utils/translate.pipe";
import { MatProgressBar } from "@angular/material/progress-bar";
import { PageSettingRoleDetail, PermissionRoleDetail } from "../../../models/role.model";
import { ActionSetting, PageSetting } from '../../../models/config.model';
import { DataSourceFunction, SearchableSelectConfig, SearchParams, SelectableItem } from "../../../shared/components/generic-searchable-select/generic-searchable-select.model";
import { Observable } from "rxjs";
import { ApiConfigServices } from "../../../services/system-config.service";
import { GenericSearchableSelectComponent } from "../../../shared/components/generic-searchable-select/generic-searchable-select.component";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { LanguageService } from "../../../services/language.service";

@Component({
    selector: 'create-update-role',
    imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    MatProgressBar,
    GenericSearchableSelectComponent
],
    templateUrl: './create-update-role.component.html',
    styleUrl: './create-update-role.component.scss'
  })
  export class CreateUpdateRoleComponent {
    private fb = inject(FormBuilder);
    private api = inject(ApiRoleSystemServices);
    private snack = inject(MatSnackBar);
    private configApi = inject(ApiConfigServices);
    private translate = inject(LanguageService);
    dataSourcePermission: DataSourceFunction;
    dataSourcePage: DataSourceFunction;

    searchPermissionSelectConfig: SearchableSelectConfig = {
      placeholder: this.translate.translate('system.role.selectPermissions'),
      searchPlaceholder: this.translate.translate('system.role.searchPermissions'),
      displayProperty: 'displayName',
      noResultsMessage: this.translate.translate('system.role.noPermissionsFound'),
      loadingMessage: this.translate.translate('system.role.loadingPermissions'),
      pageSize: 1000,
    };
    
    searchPageSelectConfig: SearchableSelectConfig = {
      placeholder: this.translate.translate('system.role.selectPages'),
      searchPlaceholder: this.translate.translate('system.role.searchPages'),
      displayProperty: 'displayName',
      noResultsMessage: this.translate.translate('system.role.noPagesFound'),
      loadingMessage: this.translate.translate('system.role.loadingPages'),
      pageSize: 1000,
    };

    initialPermissionOptions: SelectableItem[] = [
      { value: '', displayName: this.translate.translate('system.role.allPermissions'), translate: true, 
        handleItem: (event?: any) => { 
          if (!event.isUserInput) return; 
          if (event.source._selected) { 
            this.form.get('permissions')?.setValue([...Array.from(this.allPermissionIds)]);
          }else {
            this.form.get('permissions')?.setValue([]);
          }
        } 
      }
    ];

    initialPageOptions: SelectableItem[] = [
      { value: '', displayName: this.translate.translate('system.role.allPages'), translate: true, 
        handleItem: (event?: any) => {
          if (!event.isUserInput){
            return; 
          }
          if (event.source._selected) { 
            this.form.get('pages')?.setValue([...Array.from(this.allPageSettingIds)]);
          }else {
            this.form.get('pages')?.setValue([]);
          }
        } 
      }
    ];

    allPermissionIds: Set<string> = new Set<string>();
    allPageSettingIds: Set<string> = new Set<string>();
    roleId?: string | number;

    constructor(
      public dialogRef: MatDialogRef<CreateUpdateRoleComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { roleId?: string | number, loadData: () => void }
    ) {
      this.roleId = data.roleId || undefined;
      this.dataSourcePermission = this.getPermissionsDataSource();
      this.dataSourcePage = this.getPagesDataSource();
    }

    ngOnInit() {
      if (this.roleId) {
        this.loadDetail();
      }
    }
    
    onCancel() {
      this.dialogRef.close();
    }

    form = this.fb.group({
        roleCode: ['', [Validators.required, Validators.maxLength(100)]],
        roleName: ['', [Validators.required, Validators.maxLength(100)]],
        permissions: [[] as string[], []],
        pages: [[] as string[], []]
    });

    permissionOptions: SelectableItem[] = [];
    pageOptions: SelectableItem[] = [];

    loading = false;
    isSubmit = false;

    loadDetail() {
      this.loading = true;
      this.isSubmit = true;
      if (this.roleId) {
        this.api.getRoleDetail(this.roleId).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: (res) => {
            console.log(res);
            const permissions = res.permissions.map((permission: PermissionRoleDetail) => {
              this.permissionOptions.push({
                value: permission.id,
                displayName: permission.permissionName,
              });
              return permission.id
            });
            const pages = res.pageSettings.map((page: PageSettingRoleDetail) => {
              this.pageOptions.push({
                value: page.id,
                displayName: page.pageName,
              });
              return page.id
            });

            this.form.patchValue({
              roleCode: res.roleCode,
              roleName: res.roleName,
              permissions: permissions,
              pages: pages
            });
          }
        });
      }
    }

    private getPermissionsDataSource(): DataSourceFunction {
      return (params: SearchParams): Observable<SelectableItem[]> => {
        const payload: any = {
          page: params.page,
          size: params.size
        };
  
        if (params.keyword) {
          payload.keyword = params.keyword;
        }
  
        return this.configApi.getActionsByPartner(payload).pipe(
          map((res: any) =>
            (res as ActionSetting[] || []).map((item: ActionSetting) => {
              this.allPermissionIds.add(item.id.toString());
              return ({
              value: item.id,
              displayName: item.permissionName,
            } as SelectableItem)
            })
          )
        );
      };
    }

    private getPagesDataSource(): DataSourceFunction {
      return (params: SearchParams): Observable<SelectableItem[]> => {
        const payload: any = {
          page: params.page,
          size: params.size
        };
        console.log(this.form.get('pages')?.value);
        console.log(this.form.get('permissions')?.value);
  
        if (params.keyword) {
          payload.keyword = params.keyword;
        }
  
        return this.configApi.getPagesByPartner(payload).pipe(
          map((res: any) =>
            (res as PageSetting[] || []).map((item: PageSetting) => {
              this.allPageSettingIds.add(item.id.toString());
              return ({
                value: item.id,
                displayName: item.pageName,
              } as SelectableItem)
            })
          )
        );
      };
    }

    onSubmit() {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      
      this.loading = true;
      this.isSubmit = true;
      const formVal = this.form.getRawValue();
      const payload = {
        roleCode: formVal.roleCode || '',
        roleName: formVal.roleName || '',
        permissionIds: formVal.permissions || [],
        pageSettingIds: formVal.pages || [],
        requestId: 'string'
      };

      if (this.roleId) {
        this.api.updateRole(this.roleId, payload).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.role.roleUpdatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.data.loadData();
            this.onCancel();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.role.failedToUpdateRole'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }else {
        this.api.createRole(payload).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.role.roleCreatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.data.loadData();
            this.onCancel();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.role.failedToCreateRole'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    }

  }