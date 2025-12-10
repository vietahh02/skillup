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
import { Role } from "../../../models/role.model";
import { TranslatePipe } from '../../../utils/translate.pipe';
import { GenericSearchableSelectComponent } from "../../../shared/components/generic-searchable-select/generic-searchable-select.component";
import { DataSourceFunction, errorOption, SearchableSelectConfig, SearchParams, SelectableItem } from "../../../shared/components/generic-searchable-select/generic-searchable-select.model";
import { Observable } from "rxjs";
import { CreateUserDto } from "../../../models/user.model";
import { CreateUpdateProductPayload } from "../../../models/product.model";
import { ApiProductServices } from "../../../services/system-product.service";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { LanguageService } from "../../../services/language.service";
@Component({
    selector: 'product-create-update',
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
    ],
    templateUrl: './product-create-update.component.html',
    styleUrl: './product-create-update.component.scss'
  })
  export class ProductCreateUpdateComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private api = inject(ApiProductServices);
    private snack = inject(MatSnackBar);
    private roleApi = inject(ApiRoleSystemServices);
    private translate = inject(LanguageService);
    @Input() id?: string | number;
    @Output() onClose = new EventEmitter<void>();
    @Output() loadData = new EventEmitter<void>();

    typeOptions: SelectableItem[] = [
      { value: 'PACKAGE', displayName: 'system.product.productTypePackage'   },
      { value: 'DATA', displayName: 'system.product.productTypeData' },
      { value: 'SERVICE', displayName: 'system.product.productTypeService' },
      { value: 'GIFT_CARD', displayName: 'system.product.productTypeGiftCard' },
      { value: 'COUPON', displayName: 'system.product.productTypeCoupon' },
      { value: 'OTHER', displayName: 'system.product.productTypeOther' },
    ];

    unitOptions: SelectableItem[] = [
      { value: 'AMOUNT', displayName: 'system.product.unitAmount' },
      { value: 'PERCENTAGE', displayName: 'system.product.unitPercentage' },
    ];

    // dataSourceRole: DataSourceFunction;
    // optionsRole: SelectableItem[] = [];

    searchSelectConfig: SearchableSelectConfig = {
      placeholder: this.translate.translate('system.product.selectRoles'),
      searchPlaceholder: this.translate.translate('system.product.searchRoles'),
      displayProperty: 'displayName',
      noResultsMessage: this.translate.translate('system.product.noRolesFound'),
      loadingMessage: this.translate.translate('system.product.loadingRoles'),
      pageSize: 20,
      debounceTime: 500
    };

    errorList: errorOption[] = [
      { key: 'required', value: this.translate.translate('system.product.rolesRequired') }
    ];

    constructor(
      public dialogRef: MatDialogRef<ProductCreateUpdateComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { id?: string | number, loadData: () => void }
    ) {
    }

    onCloseDrawer() {
      this.form.reset();
      this.id = undefined;
      this.onClose.emit();
    }

    onCancel() {
      this.dialogRef.close();
    }

    form = this.fb.group({
        productCode: ['', [Validators.required, Validators.maxLength(255)]],
        name: ['', [Validators.required, Validators.maxLength(255)]],
        type: ['', [Validators.required]],
        description: ['', [Validators.maxLength(5000)]],
        unit: ['', [Validators.required]],
    });

    loading = false;
    isSubmit = false;

    ngOnChanges(changes: SimpleChanges) {
      if (changes['id'] && changes['id'].currentValue && changes['id'].currentValue !== changes['id'].previousValue) {
        this.loadDetail();
      }else {
        this.id = undefined;
        this.form.reset();
      }
    }

    loadDetail() {
      this.loading = true;  
      this.isSubmit = true;
      if (this.id) {

      }
    }

    onSubmit() {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      
      this.loading = true;
      this.isSubmit = true;
      const formVal = this.form.getRawValue();
      const payload : CreateUpdateProductPayload = {
        productCode: formVal.productCode || '',
        productName: formVal.name || '',
        productType: formVal.type || '',
        description: formVal.description || '',
        unit: formVal.unit || '',
        requestId: 'string'
      };

      if (this.id) {
        this.api.updateProduct(payload).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.product.updatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCloseDrawer();
            this.loadData.emit();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.product.failedToUpdate'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }else {
        this.api.createProduct(payload).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.product.createdSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.onCloseDrawer();
            this.loadData.emit();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.product.failedToCreate'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    }

  }