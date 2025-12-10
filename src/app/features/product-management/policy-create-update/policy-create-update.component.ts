import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { CommonModule } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize } from "rxjs/operators";
import { TranslatePipe } from '../../../utils/translate.pipe';
import { GenericSearchableSelectComponent } from "../../../shared/components/generic-searchable-select/generic-searchable-select.component";
import { DataSourceFunction, SearchParams, SelectableItem } from "../../../shared/components/generic-searchable-select/generic-searchable-select.model";
import { Observable, map } from "rxjs";
import { ApiProductServices } from "../../../services/system-product.service";
import { ApiPartnerServices } from "../../../services/partner.service";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ProductPolicy } from "../../../models/product.model";
import { MatProgressBar } from "@angular/material/progress-bar";
import { generateUUID } from '../../../utils/uuid.util';

@Component({
    selector: 'policy-create-update',
    standalone: true,
    imports: [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatButtonModule,
      MatIconModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatProgressBar,
      TranslatePipe,
      GenericSearchableSelectComponent
    ],
    templateUrl: './policy-create-update.component.html',
    styleUrl: './policy-create-update.component.scss'
  })
  export class PolicyCreateUpdateComponent implements OnChanges {
    private fb = inject(FormBuilder);
    private api = inject(ApiProductServices);
    private snack = inject(MatSnackBar);
    private partnerApi = inject(ApiPartnerServices);

    @Input() id?: string | number;
    @Input() productId?: string;
    @Output() onClose = new EventEmitter<void>();
    @Output() loadData = new EventEmitter<void>();

    partnerDataSource: DataSourceFunction;
    partnerConfig = {
      placeholder: 'system.product.selectPartner',
      searchPlaceholder: 'system.product.searchPartner',
      displayProperty: 'displayName',
      noResultsMessage: 'common.noData',
      loadingMessage: 'common.loading',
      pageSize: 20,
      debounceTime: 500,
      scrollThreshold: 60
    };

    constructor() {
      // Initialize partner dataSource for lazy loading
      this.partnerDataSource = (params: SearchParams) => {
        const payload: any = {
          page: params.page,
          size: params.size || 20,
        };
        
        if (params.keyword && params.keyword.trim() !== '') {
          payload.keyword = params.keyword.trim();
        }
        
        return this.partnerApi.getPartnerPage(payload).pipe(
          map((response: any) => {
            const partners = response?.content || [];
            return partners.map((partner: any) => ({
              value: partner.id?.toString() || partner.partnerCode,
              displayName: partner.partnerCode,
              partnerId: partner.id,
              partnerCode: partner.partnerCode
            }));
          })
        );
      };
    }

    onCloseDrawer() {
      this.form.reset();
      this.id = undefined;
      this.onClose.emit();
    }

    form = this.fb.group({
        policyName: ['', [Validators.required, Validators.maxLength(255)]],
        policyDescription: ['', [Validators.maxLength(5000)]],
        partnerId: ['', [Validators.required]],
        price: [0, [Validators.required, Validators.min(0)]],
        transactionFee: [0, [Validators.required, Validators.min(0)]],
        discount: [0, [Validators.required, Validators.min(0)]],
        commission: [0, [Validators.required, Validators.min(0)]],
        validFrom: ['', [Validators.required]],
        validTo: ['', [Validators.required]]
    });

    loading = false;
    isSubmit = false;

    ngOnChanges(changes: SimpleChanges) {
      if (changes['id'] && changes['id'].currentValue && changes['id'].currentValue !== changes['id'].previousValue) {
        this.loadDetail();
      } else {
        this.id = undefined;
        this.form.reset();
      }
    }

    loadDetail() {
      this.loading = true;  
      this.isSubmit = true;
      if (this.id) {
        this.api.getPolicyById(this.id).pipe(
          finalize(() => {
            this.loading = false;
            this.isSubmit = false;
          })
        ).subscribe({
          next: (policy: ProductPolicy) => {
            this.form.patchValue({
              policyName: policy.policyName || '',
              policyDescription: policy.policyDescription || '',
              partnerId: policy.partnerId || '',
              price: policy.price || 0,
              transactionFee: policy.transactionFee || 0,
              discount: policy.discount || 0,
              commission: policy.commission || 0,
              validFrom: policy.validFrom ? new Date(policy.validFrom) : '' as any,
              validTo: policy.validTo ? new Date(policy.validTo) : '' as any
            });
          },
          error: (e) => {
            this.snack.open(e?.error?.message || 'Failed to load policy detail', '', { 
              duration: 2200, 
              panelClass: ['error-snackbar', 'custom-snackbar'], 
              horizontalPosition: 'right', 
              verticalPosition: 'top' 
            });
          }
        });
      } else {
        this.loading = false;
        this.isSubmit = false;
      }
    }

    onSubmit() {
      this.form.markAllAsTouched();
      if (this.form.invalid) return;
      
      // Validate date range
      const validFrom = this.form.get('validFrom')?.value;
      const validTo = this.form.get('validTo')?.value;
      if (validFrom && validTo && new Date(validFrom) > new Date(validTo)) {
        this.snack.open('End date must be after start date', '', { 
          duration: 2200, 
          panelClass: ['error-snackbar', 'custom-snackbar'], 
          horizontalPosition: 'right', 
          verticalPosition: 'top' 
        });
        return;
      }
      
      this.loading = true;
      this.isSubmit = true;
      const formVal = this.form.getRawValue();
      
      const payload: any = {
        policyName: formVal.policyName || '',
        policyDescription: formVal.policyDescription || '',
        partnerId: formVal.partnerId || '',
        price: formVal.price || 0,
        transactionFee: formVal.transactionFee || 0,
        discount: formVal.discount || 0,
        commission: formVal.commission || 0,
        validFrom: this.formatDate(formVal.validFrom),
        validTo: this.formatDate(formVal.validTo),
        productId: this.productId || '',
        requestId: 'string'
      };

      if (this.id) {
        const updatePayload: any = {
          requestId: generateUUID(),
          client: 'CMS',
          version: '2.0',
          policyName: formVal.policyName || '',
          policyDescription: formVal.policyDescription || '',
          partnerId: formVal.partnerId || '',
          productId: this.productId || '',
          price: formVal.price || 0,
          fee: formVal.transactionFee || 0,
          discount: formVal.discount || 0,
          commission: formVal.commission || 0,
          currency: '106',
          unit: 'ITEM'
        };

        this.api.updatePolicy(this.id, updatePayload).pipe(
          finalize(() => {
            this.loading = false;
            this.isSubmit = false;
          })
        ).subscribe({
          next: () => {
            this.snack.open('Policy updated successfully', '', { 
              duration: 2200, 
              panelClass: ['success-snackbar', 'custom-snackbar'], 
              horizontalPosition: 'right', 
              verticalPosition: 'top' 
            });
            this.onCloseDrawer();
            this.loadData.emit();
          },
          error: (e) => {
            this.snack.open(e?.error?.message || 'Failed to update policy', '', { 
              duration: 2200, 
              panelClass: ['error-snackbar', 'custom-snackbar'], 
              horizontalPosition: 'right', 
              verticalPosition: 'top' 
            });
          }
        });
      } else {
        const createPayload: any = {
          requestId: generateUUID(),
          client: 'CMS',
          version: '2.0',
          policyName: formVal.policyName || '',
          policyDescription: formVal.policyDescription || '',
          partnerId: formVal.partnerId || '',
          productId: this.productId || '',
          price: formVal.price || 0,
          fee: formVal.transactionFee || 0,
          discount: formVal.discount || 0,
          commission: formVal.commission || 0,
          currency: '106',
          unit: 'ITEM'
        };

        this.api.createPolicy(createPayload).pipe(
          finalize(() => {
            this.loading = false;
            this.isSubmit = false;
          })
        ).subscribe({
          next: () => {
            this.snack.open('Policy created successfully', '', { 
              duration: 2200, 
              panelClass: ['success-snackbar', 'custom-snackbar'], 
              horizontalPosition: 'right', 
              verticalPosition: 'top' 
            });
            this.onCloseDrawer();
            this.loadData.emit();
          },
          error: (e) => {
            this.snack.open(e?.error?.message || 'Failed to create policy', '', { 
              duration: 2200, 
              panelClass: ['error-snackbar', 'custom-snackbar'], 
              horizontalPosition: 'right', 
              verticalPosition: 'top' 
            });
          }
        });
      }
    }

    private formatDate(date: any): string {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

