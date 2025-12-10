import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { Component, EventEmitter, Inject, inject, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { ApiUserSystemServices } from "../../../services/system-user.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize, map } from "rxjs/operators";
import { MatProgressBar } from "@angular/material/progress-bar";
import { ApiRoleSystemServices } from "../../../services/system-role.service";
import { Role, RolePagePayload } from "../../../models/role.model";
import { TranslatePipe } from '../../../utils/translate.pipe';
import { GenericSearchableSelectComponent } from "../../../shared/components/generic-searchable-select/generic-searchable-select.component";
import { DataSourceFunction, errorOption, SearchableSelectConfig, SearchParams, SelectableItem } from "../../../shared/components/generic-searchable-select/generic-searchable-select.model";
import { Observable } from "rxjs";
import { CreateUserDto } from "../../../models/user.model";
import { DialogData } from "../../document-management/create-update-document/create-update-document.component";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { LanguageService } from "../../../services/language.service";
import { generateUUID } from "../../../utils/uuid.util";
import { ApiAuthServices } from "../../../services/auth.service";
@Component({
    selector: 'create-update-user',
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      MatProgressBar,
      TranslatePipe,
      GenericSearchableSelectComponent
    ],
    templateUrl: './create-update-user.component.html',
    styleUrl: './create-update-user.component.scss'
  })
  export class CreateUpdateUserComponent {
    private fb = inject(FormBuilder);
    private api = inject(ApiUserSystemServices);
    private snack = inject(MatSnackBar);
    private roleApi = inject(ApiRoleSystemServices);
    private translate = inject(LanguageService);
    private authService = inject(ApiAuthServices);
    constructor(
      public dialogRef: MatDialogRef<CreateUpdateUserComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { userId?: string | number, loadData: () => void }
    ) {
      this.userId = data.userId;
      this.partnerId = this.authService.getPartnerId() || undefined;
      this.dataSourceRole = this.getRolesDataSource();
    }

    userId?: string | number;
    partnerId?: string | number;
    dataSourceRole: DataSourceFunction;
    optionsRole: SelectableItem[] = [];
    isSubmitting = false;

    searchSelectConfig: SearchableSelectConfig = {
      placeholder: this.translate.translate('system.user.selectRoles'),
      searchPlaceholder: this.translate.translate('system.user.searchRoles'),
      displayProperty: 'displayName',
      noResultsMessage: this.translate.translate('system.user.noRolesFound'),
      loadingMessage: this.translate.translate('system.user.loadingRoles'),
      pageSize: 20,
      debounceTime: 500
    };

    errorList: errorOption[] = [
      { key: 'required', value: this.translate.translate('system.user.rolesRequired') }
    ];

    onCancel() {
      this.form.reset();
      this.dialogRef.close();
    }

    form = this.fb.group({
        username: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^\S+$/)]],
        email: ['', [Validators.required, Validators.maxLength(100), Validators.email]],
        fullName: ['', [Validators.required, Validators.maxLength(100)]],
        phoneNumber: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^\+?[0-9]{1,3}?[-.\s()]?[0-9]{1,4}[-.\s()]?[0-9]{3,4}[-.\s()]?[0-9]{3,4}$/)]],
        roleIds: [[] as number[] | string[], [Validators.required]],
        language: ['', [Validators.required]]
    });

    languageOptions = [
      { value: 'en', label: 'English' },
      { value: 'my', label: 'Myanmar' },
    ];

    loading = false;

    ngOnInit() {
      if (this.userId) {
        this.loadDetail();
      }
    }

    private getRolesDataSource(): DataSourceFunction {
      return (params: SearchParams): Observable<SelectableItem[]> => {
        const payload: RolePagePayload = {
          page: params.page,
          size: params.size,
          isEnabled: 1
        };
  
        if (params.keyword) {
          payload.keyword = params.keyword;
        }

        if (this.partnerId) {
          payload.partnerId = this.partnerId;
        }

        if (this.authService.isAdminHub()) {
          payload.isHub = true;
        }
  
        return this.roleApi.getRolePage(payload).pipe(
          map((res: any) =>
            (res?.content as Role[] || []).map((item: Role) => ({
              value: item.id,
              displayName: item.roleName + ' - ' + item.roleCode,
            } as SelectableItem))
          )
        );
      };
    }

    loadDetail() {
      this.loading = true;  
      this.isSubmitting = true;
      if (this.userId) {
        this.api.getUserDetail(this.userId).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: (res) => {
            const roles = res.roles.map((role: {id: number, roleName: string, roleCode: string}) => {
              this.optionsRole.push({
                value: role.id,
                displayName: role.roleName + ' - ' + role.roleCode,
              });
              return role.id
            }); 
            this.form.patchValue({
              username: res.username,
              email: res.email,
              roleIds: roles,
              language: res.language
            });
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.user.failedToGetUserDetail'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCancel();
          }
        });
      }
    }

    onSubmit() {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      
      this.loading = true;
      this.isSubmitting = true;
      const formVal = this.form.getRawValue();
      const payload : CreateUserDto = {
        fullName: formVal.fullName || '',
        phoneNumber: formVal.phoneNumber || '',
        username: formVal.username || '',
        email: formVal.email || '',
        roleIds: formVal.roleIds || [],
        language: formVal.language || '',
        requestId: generateUUID()
      };

      if (this.userId) {
        this.api.updateUser(this.userId, payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.user.userUpdatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCancel();
            this.data.loadData();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.user.failedToUpdateUser'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }else {
        this.api.createUser(payload).pipe(finalize(() => {this.loading = false, this.isSubmitting = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.user.userCreatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCancel();
            this.data.loadData();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.user.failedToCreateUser'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    }

  }