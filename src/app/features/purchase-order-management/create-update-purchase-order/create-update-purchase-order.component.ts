import { Component, EventEmitter, inject, Inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { ApiPurchaseOrderServices } from '../../../services/purchase-order.service';
import { ApiStockServices } from '../../../services/stock.service';
import { ApiAuthServices } from '../../../services/auth.service';
import { GenericSearchableSelectComponent } from '../../../shared/components/generic-searchable-select/generic-searchable-select.component';
import { DataSourceFunction, SearchParams, SelectableItem, SearchableSelectConfig } from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { generateUUID } from '../../../utils/uuid.util';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-create-update-purchase-order',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBar,
    MatDialogModule,
    TranslatePipe,
    GenericSearchableSelectComponent
  ],
  templateUrl: './create-update-purchase-order.component.html',
  styleUrl: './create-update-purchase-order.component.scss'
})
export class CreateUpdatePurchaseOrderComponent implements OnInit, OnChanges {
  private fb = new FormBuilder();
  private translate = inject(LanguageService);  
  stockDataSource!: DataSourceFunction;
  searchStockSelectConfig: SearchableSelectConfig = {
    placeholder: 'system.purchaseOrder.selectStock',
    searchPlaceholder: 'system.purchaseOrder.searchStock',
    displayProperty: 'displayName',
    noResultsMessage: 'common.noData',
    loadingMessage: 'common.loading',
    pageSize: 20,
    debounceTime: 500
  };
  initialStockOptions: SelectableItem[] = [];

  constructor(
    private api: ApiPurchaseOrderServices,
    private stockApi: ApiStockServices,
    private authService: ApiAuthServices,
    private snack: MatSnackBar,
    private dialogRef: MatDialogRef<CreateUpdatePurchaseOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id?: string | number }
  ) {
    this.stockDataSource = (params: SearchParams): Observable<SelectableItem[]> => {
      const partnerId = this.authService.getPartnerId();
      if (!partnerId) {
        return new Observable(observer => {
          observer.next([]);
          observer.complete();
        });
      }

      return this.stockApi.getStockPage({ partnerId: partnerId }).pipe(
        map((response: any) => {
          const stocks = Array.isArray(response) ? response : (response?.content || response?.result || []);
          const filteredStocks = stocks || [];
          
          let result = filteredStocks;
          if (params.keyword && params.keyword.trim() !== '') {
            const keyword = params.keyword.trim().toLowerCase();
            result = filteredStocks.filter((stock: any) => 
              stock.id?.toLowerCase().includes(keyword) ||
              stock.stockType?.toLowerCase().includes(keyword)
            );
          }

          const startIndex = (params.page || 0) * (params.size || 20);
          const endIndex = startIndex + (params.size || 20);
          const paginatedResult = result.slice(startIndex, endIndex);

          return paginatedResult.map((stock: any) => ({
            value: stock.id?.toString() || '',
            displayName: stock.stockType || ''
          }));
        })
      );
    };
  }

  @Input() id?: string | number;
  @Output() onClose = new EventEmitter<void>();
  @Output() loadData = new EventEmitter<void>();

  form = this.fb.group({
    requestType: ['DEPOSIT', [Validators.required]],
    paymentType: ['Cash', [Validators.required]],
    amount: ['', [Validators.required, this.amountValidator.bind(this)]],
    stockId: [''],
    bankCode: [''],
    bankName: [''],
    bankAccount: [''],
    bankTransactionId: [''],
    attachmentIds: [''],
    file: [null as File | null],
    note: ['']
  });

  loading = false;
  isSubmit = false;
  selectedFileName: string | null = null;

  orderTypeOptions = [
    { value: 'DEPOSIT', label: 'system.purchaseOrder.typeDeposit' },
    { value: 'WITHDRAW', label: 'system.purchaseOrder.typeWithdrawal' },
    { value: 'INCREASE', label: 'system.purchaseOrder.typeIncrease' },
    { value: 'DECREASE', label: 'system.purchaseOrder.typeDecrease' },
  ];

  paymentMethodOptions = [
    { value: 'Cash', label: 'system.purchaseOrder.paymentMethodCash' },
    { value: 'Bank', label: 'system.purchaseOrder.paymentMethodBank' }
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id'] && changes['id'].currentValue && changes['id'].currentValue !== changes['id'].previousValue) {
      this.loadDetail();
    } else {
      this.id = undefined;
      this.form.reset({
        requestType: 'DEPOSIT',
        paymentType: 'Cash',
        amount: '',
        stockId: '',
        bankCode: '',
        bankName: '',
        bankAccount: '',
        bankTransactionId: '',
        attachmentIds: '',
        file: null,
        note: ''
      });
      this.selectedFileName = null;
    }
  }

  ngOnInit() {
    if (this.data && this.data.id) {
      this.id = this.data.id;
      this.loadDetail();
    }

    this.form.get('paymentType')?.valueChanges.subscribe(value => {
      if (value === 'Cash') {
        this.form.patchValue({
          bankCode: '',
          bankName: '',
          bankAccount: '',
          bankTransactionId: ''
        }, { emitEvent: false });
      }
    });
  }

  loadDetail() {
    if (!this.id) return;
    
    this.loading = true;
    this.isSubmit = true;
    this.api.getPurchaseOrderDetail(this.id).pipe(
      finalize(() => {
        this.loading = false;
        this.isSubmit = false;
      })
    ).subscribe({
      next: (res) => {
        const hasBankInfo = res.bankCode || res.bankName || res.bankAccount || res.bankTransactionId;
        const paymentType = hasBankInfo ? 'Bank' : 'Cash';

        const amountValue = res.amount ? res.amount.toLocaleString('en-US') : '';

        if (res.stockId) {
          this.loadStockDetail(res.stockId).then(() => {
            this.patchFormValues(res, paymentType, amountValue);
          });
        } else {
          this.patchFormValues(res, paymentType, amountValue);
        }
      },
      error: (e) => {
        this.snack.open(e?.error?.errorMessage || this.translate.translate('system.purchaseOrder.failedToLoadOrderDetail'), '', {
          duration: 2200,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  get isBankPayment(): boolean {
    return this.form.get('paymentType')?.value === 'Bank';
  }

  amountValidator(control: any) {
    if (!control.value) {
      return null;
    }
    const value = control.value.toString().replace(/,/g, '');
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 1000) {
      return { min: true };
    }
    return null;
  }

  loadStockDetail(stockId: string): Promise<void> {
    return new Promise((resolve) => {
      const partnerId = this.authService.getPartnerId();
      if (!partnerId) {
        this.initialStockOptions = [{
          value: stockId,
          displayName: stockId
        }];
        resolve();
        return;
      }

      this.stockApi.getStockPage({ partnerId: partnerId }).subscribe({
        next: (response: any) => {
          const stocks = Array.isArray(response) ? response : (response?.content || response?.result || []);
          const stock = stocks.find((s: any) => s.id === stockId || s.id?.toString() === stockId);
          
          if (stock) {
            this.initialStockOptions = [{
              value: stock.id?.toString() || stockId,
              displayName: stock.stockType || ''
            }];
          } else {
            this.initialStockOptions = [{
              value: stockId,
              displayName: stockId
            }];
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading stock list:', error);
          this.initialStockOptions = [{
            value: stockId,
            displayName: stockId
          }];
          resolve();
        }
      });
    });
  }

  patchFormValues(res: any, paymentType: string, amountValue: string): void {
    this.form.patchValue({
      requestType: res.requestType || 'DEPOSIT',
      paymentType: paymentType,
      amount: amountValue,
      stockId: res.stockId || '',
      bankCode: res.bankCode || '',
      bankName: res.bankName || '',
      bankAccount: res.bankAccount || '',
      bankTransactionId: res.bankTransactionId || '',
      note: res.note || ''
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const maxSize = 25 * 1024 * 1024; // 25MB
      
      if (file.size > maxSize) {
        this.snack.open(this.translate.translate('system.purchaseOrder.fileSizeExceeds25MB'), '', {
          duration: 2200,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        return;
      }

      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validImageTypes.includes(file.type)) {
        this.snack.open(this.translate.translate('system.purchaseOrder.onlyImageFilesAllowed'), '', {
          duration: 2200,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        return;
      }

      this.form.patchValue({ file });
      this.selectedFileName = file.name;
    }
  }

  onCloseDialog() {
    this.form.reset();
    this.id = undefined;
    this.selectedFileName = null;
    this.dialogRef.close();
    this.onClose.emit();
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading = true;
    this.isSubmit = true;
    const formVal = this.form.getRawValue();

    const partnerId = this.authService.getPartnerId() || '';
    const partnerName = this.authService.getPartnerName() || '';
    const rawAmount = (formVal.amount ?? '').toString().replace(/,/g, '').trim();

    const payload: any = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0',
      paymentMethod: {
        bankCode: formVal.bankCode || '',
        bankName: formVal.bankName || '',
        bankAccount: formVal.bankAccount || '',
        bankTransactionId: formVal.bankTransactionId || ''
      },
      partnerId: partnerId,
      partnerName: partnerName,
      amount: rawAmount ? Number(rawAmount) : 0,
      stockId: formVal.stockId || '',
      requestType: formVal.requestType || 'DEPOSIT',
      attachmentId: formVal.attachmentIds
        ? String(formVal.attachmentIds)
            .split(',')
            .map((x: string) => x.trim())
            .filter((x: string) => !!x)
        : []
    };

    if (this.id) {
      // Update logic
      this.api.updatePurchaseOrder(this.id, payload).pipe(
        finalize(() => {
          this.loading = false;
          this.isSubmit = false;
        })
      ).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('system.purchaseOrder.orderUpdatedSuccessfully'), '', {
            duration: 2200,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.onCloseDialog();
          this.loadData.emit();
        },
        error: (e) => {
          this.snack.open(e?.error?.errorMessage || this.translate.translate('system.purchaseOrder.failedToUpdateOrder'), '', {
            duration: 2200,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Create logic
      this.api.createPurchaseOrder(payload).pipe(
        finalize(() => {
          this.loading = false;
          this.isSubmit = false;
        })
      ).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('system.purchaseOrder.orderCreatedSuccessfully'), '', {
            duration: 2200,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.onCloseDialog();
          this.loadData.emit();
        },
        error: (e) => {
          this.snack.open(e?.error?.errorMessage || this.translate.translate('system.purchaseOrder.failedToCreateOrder'), '', {
            duration: 2200,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }
  }
}

