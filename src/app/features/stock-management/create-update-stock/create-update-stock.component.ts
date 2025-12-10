import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { Component, EventEmitter, inject, Input, Output, SimpleChanges, Inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize, map } from "rxjs/operators";
import { TranslatePipe } from "../../../utils/translate.pipe";
import { MatProgressBar } from "@angular/material/progress-bar";
import { DataSourceFunction, errorOption, SearchableSelectConfig, SearchParams, SelectableItem } from "../../../shared/components/generic-searchable-select/generic-searchable-select.model";
import { GenericSearchableSelectComponent } from "../../../shared/components/generic-searchable-select/generic-searchable-select.component";
import { ApiStockServices } from "../../../services/stock.service";
import { Partner } from "../../../models/partner.model";
import { ApiPartnerServices } from "../../../services/partner.service";
import { StockCreateUpdatePayload } from "../../../models/stock.model";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ApiAuthServices } from "../../../services/auth.service";
import { LanguageService } from "../../../services/language.service";

@Component({
    selector: 'create-update-stock',
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
    templateUrl: './create-update-stock.component.html',
    styleUrl: './create-update-stock.component.scss'
  })
  export class CreateUpdateStockComponent {
    private fb = inject(FormBuilder);
    private api = inject(ApiStockServices);
    private snack = inject(MatSnackBar);
    private partnerApi = inject(ApiPartnerServices);
    public authService = inject(ApiAuthServices);
    private translate = inject(LanguageService);
    dataSourcePartner: DataSourceFunction;
    stockId?: string | number;
    partnerId?: string | null;

    searchPartnerSelectConfig: SearchableSelectConfig = {
      placeholder: this.translate.translate('system.stock.selectPartner'),
      searchPlaceholder: this.translate.translate('system.stock.searchPartner'),
      displayProperty: 'displayName',
      noResultsMessage: this.translate.translate('system.stock.noPartnerFound'),
      loadingMessage: this.translate.translate('system.stock.loadingPartner'),
    };

    errorListPartner: errorOption[] = [
      { key: 'required', value: 'system.stock.partnerRequired' }
    ];

    stockTypeOptions: SelectableItem[] = [
      { value: 'BALANCE', displayName: 'system.stock.stockTypeBalance' },
      { value: 'DATA', displayName: 'system.stock.stockTypeData' },
      { value: 'ITEM', displayName: 'system.stock.stockTypeItem' },

    ];

    constructor(
      public dialogRef: MatDialogRef<CreateUpdateStockComponent>,
      @Inject(MAT_DIALOG_DATA) public data: { stockId?: string | number, loadData: () => void }
    ) {
      this.stockId = data.stockId || undefined;
      this.dataSourcePartner = this.getPartnersDataSource();
    }

    ngOnInit() {
      if (this.stockId) {
        this.loadDetail();
      }
      this.partnerId = this.authService.getPartnerId();
    }
    
    onCancel() {
      this.form.reset();
      this.dialogRef.close();
    }

    form = this.fb.group({
      stockType: ['', [Validators.required, Validators.maxLength(255)]],
      partnerId: ['', [Validators.required]],
    });

    loading = false;
    isSubmit = false;

    ngOnChanges(changes: SimpleChanges) {
      if (changes['stockId'] && changes['stockId'].currentValue && changes['stockId'].currentValue !== changes['stockId'].previousValue) {
        this.loadDetail();
      }else {
        this.stockId = undefined;
        this.form.reset();
      }
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
          map((res: any) => (res?.content as Partner[] || []).map((item: Partner) => ({ value: item.id, displayName: item.partnerName } as SelectableItem)) as any)
        );
      };
    }

    loadDetail() {
      this.loading = true;
      this.isSubmit = true;
      if (this.stockId) {
        this.api.getStockDetail(this.stockId).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: (res) => {
            this.form.patchValue({
              stockType: res.stockType,
              partnerId: res.partnerId,
            });
          }
        });
      }
    }

    onSubmit() {
      if (this.partnerId) {
        this.form.get('partnerId')?.setValue(this.partnerId);
      }
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      
      this.loading = true;
      this.isSubmit = true;
      const formVal = this.form.getRawValue();
      const payload = {
        stockType: formVal.stockType || '',
        partnerId: formVal.partnerId || '',
      };

      this.saveStock(payload);
      
    }

    saveStock(payload: StockCreateUpdatePayload) {
      if (this.stockId) {
        this.api.updateStock(this.stockId, payload).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.stock.stockUpdatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.dialogRef.close();
            this.data.loadData();
          },
          error: (e) => {
            this.snack.open(e?.error?.errorMessage || this.translate.translate('system.stock.failedToUpdateStock'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }else {
        this.api.createStock(payload).pipe(finalize(() => {this.loading = false, this.isSubmit = false})).subscribe({
          next: () => {
            this.snack.open(this.translate.translate('system.stock.stockCreatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.dialogRef.close();
            this.data.loadData();
          },
          error: (e) => {
              this.snack.open(e?.error?.errorMessage || this.translate.translate('system.stock.failedToCreateStock'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          }
        });
      }
    }

  }