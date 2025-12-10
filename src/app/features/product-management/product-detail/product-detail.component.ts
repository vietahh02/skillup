import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { LanguageService } from '../../../services/language.service';
import { ApiProductServices } from '../../../services/system-product.service';
import { ApiPartnerServices } from '../../../services/partner.service';
import { DialogService } from '../../../services/dialog.service';
import { ProductDetail, ProductPolicy } from '../../../models/product.model';
import { DEFAULT_PAGE_SIZE } from '../../../utils/shared/constants/pagination.constants';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { GenericFilterComponent } from '../../../shared/components/generic-filter/generic-filter.component';
import { TableConfig, ActionWithHandler } from '../../../shared/components/generic-table/generic-table.model';
import { FilterConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { DataSourceFunction, SearchParams } from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import { map } from 'rxjs';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from "@angular/material/sidenav";
import { PolicyCreateUpdateComponent } from "../policy-create-update/policy-create-update.component";
import { ApiAuthServices } from '../../../services/auth.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBar,
    TranslatePipe,
    GenericTableComponent,
    GenericFilterComponent,
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    PolicyCreateUpdateComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit {
  constructor(
    private snack: MatSnackBar,
    private translate: LanguageService,
    public authService: ApiAuthServices
  ) {
    // Initialize partner dataSource for lazy loading
    this.partnerDataSource = (params: SearchParams) => {
      const payload: any = {
        page: params.page,
        size: params.size || 20,
      };
      
      // Only add keyword if it exists and is not empty
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

    // Initialize filter configs after dataSource is ready
    this.policyFilterConfig = {
      fields: [
        {
          type: 'select-searchable',
          key: 'partnerId',
          label: 'system.product.selectPartner',
          class: 'col-md-3',
          placeholder: 'system.product.selectPartner',
          searchableConfig: {
            dataSource: this.partnerDataSource,
            config: {
              placeholder: 'system.product.selectPartner',
              searchPlaceholder: 'system.product.searchPartner',
              pageSize: 20,
              scrollThreshold: 60
            }
          },
          visible: () => this.authService.isAdminHub(),
          isTranslate: false
        }
      ],
      showApplyButton: true,
      showClearButton: true,
      applyButtonText: 'common.apply',
      clearButtonText: 'common.clear',
      applyButtonIcon: 'filter_list',
      classButton: 'col-md-6'
    };
  }

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiProductServices);
  private partnerApi = inject(ApiPartnerServices);
  private dialogService = inject(DialogService);

  id!: string;
  loading = false;
  error: string | null = null;
  detail: ProductDetail | null = null;
  
  // Policy drawer
  policyDrawerOpen = false;
  policyId?: string | number;

  // Partner dataSource for lazy loading
  partnerDataSource!: DataSourceFunction;

  // Policy Data
  policyData: ProductPolicy[] = [];
  policyLoading = false;
  policyCurrentPage = 1;
  policyPageSize = DEFAULT_PAGE_SIZE;
  policyTotalPages = 1;
  policyTotal = 0;
  selectedPartnerPolicy = '';

  policyTableConfig: TableConfig = {
    columns: [
      { 
        key: 'name', 
        header: 'system.product.name', 
        align: 'center',
      },
      { 
        key: 'partner', 
        header: 'system.product.partner', 
        align: 'center',
      },
      { 
        key: 'price', 
        header: 'system.product.price', 
        align: 'center',
        customValue: (item: ProductPolicy) => item.price?.toFixed(2) || '0.00'
      },
      { 
        key: 'transactionFee', 
        header: 'system.product.transactionFee', 
        align: 'center',
        customValue: (item: ProductPolicy) => item.transactionFee?.toFixed(2) || '0.00'
      },
      { 
        key: 'discount', 
        header: 'system.product.discount', 
        align: 'center',
        customValue: (item: ProductPolicy) => item.discount?.toFixed(2) || '0.00'
      },
      { 
        key: 'commission', 
        header: 'system.product.commission', 
        align: 'center',
        customValue: (item: ProductPolicy) => item.commission?.toFixed(2) || '0.00'
      },
      { 
        key: 'effectedDate', 
        header: 'system.product.effectedDate', 
        align: 'center',
        customValue: (item: ProductPolicy) => {
          return this.formatDateRange(item.effectedDate || '', item.endDate || '');
        }
      },
      { 
        key: 'status', 
        header: 'system.product.status', 
        template: 'pill',
        align: 'center',
        customColor: [
          { code: 'common.active', color: '#137333' },
          { code: 'common.inactive', color: '#d41900' },
        ],
        isTranslate: true,
        customValue: (item: ProductPolicy) => {
          return item.status === 1 ? 'common.active' : 'common.inactive';
        }
      },
    ],
    actions: [
      {
        type: 'edit',
        tooltip: 'common.edit',
        icon: 'edit',
        color: '#000',
        handler: (item: ProductPolicy) => this.onEditPolicy(item)
      } as ActionWithHandler,
      {
        type: 'view',
        tooltip: 'common.view',
        icon: 'visibility',
        color: '#000',
        handler: (item: ProductPolicy) => this.onViewPolicy(item)
      } as ActionWithHandler,
      { 
        type: 'delete', 
        tooltip: 'common.delete',
        icon: 'delete',
        color: '#ff0404',
        handler: (item: ProductPolicy) => this.onDeletePolicy(item)
      } as ActionWithHandler
    ],
    showSequenceNumber: true,
    enablePagination: true,
    enableStatusToggle: true,
    emptyMessage: 'common.noData'
  };

  policyFilterConfig!: FilterConfig;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.fetchDetail();
    this.loadPolicy();
  }
  setupActionButtons(): ActionWithHandler[] {


    return []
  }

  back() {
    this.router.navigate(['/system/product-management']);
  }

  fetchDetail() {
    this.loading = true;
    this.error = null;

    this.api
      .getProductById(this.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res: ProductDetail) => {
          this.detail = {
            ...res,
          };
        },
        error: () => {
          this.snack.open(
            this.translate.translate('system.product.loadProductDetailFailed'),
            '',
            {
              duration: 2200,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
        },
      });
  }


  loadPolicy() {
    this.policyLoading = true;
    
    const payload: any = {
      page: this.policyCurrentPage - 1,
      size: this.policyPageSize,
    };

    // Add productId filter if available
    if (this.id) {
      payload.productId = this.id;
    }

    // Add partnerId filter if selected (only if value is not empty, null, or undefined)
    if (this.selectedPartnerPolicy && this.selectedPartnerPolicy !== '' && this.selectedPartnerPolicy !== null && this.selectedPartnerPolicy !== undefined) {
      payload.partnerId = this.selectedPartnerPolicy;
    }

    this.api.getPolicyPage(payload)
      .pipe(finalize(() => (this.policyLoading = false)))
      .subscribe({
        next: (response: any) => {
          const policies = response?.content || [];
          // Map API response to component format
          this.policyData = policies.map((policy: ProductPolicy) => ({
            ...policy,
            id: policy.policyId,
            name: policy.policyName,
            partner: policy.partnerId,
            effectedDate: policy.validFrom,
            endDate: policy.validTo,
            transactionFee: 0, 
            discount: 0, 
            commission: 0, 
            _enabled: policy.status === 1, 
          }));
          this.policyTotal = response?.totalElements || 0;
          this.policyTotalPages = response?.totalPages || 1;
        },
        error: (error) => {
          this.snack.open(
            this.translate.translate('system.product.loadPolicyFailed') || 'Failed to load policies',
            '',
            {
              duration: 2200,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
          this.policyData = [];
          this.policyTotal = 0;
          this.policyTotalPages = 1;
        },
      });
  }

  onApplyPolicyFilter(criteria: any) {
    // Filter returns partnerId (from value field which is now partnerId)
    const partnerId = criteria.partnerId;
    this.selectedPartnerPolicy = (partnerId !== undefined && partnerId !== null && partnerId !== '') ? partnerId : '';
    this.policyCurrentPage = 1;
    this.loadPolicy();
  }

  onClearPolicyFilter() {
    this.selectedPartnerPolicy = '';
    this.policyCurrentPage = 1;
    this.loadPolicy();
  }

  onPolicyPageChange(page: number) {
    if (page < 1) return;
    this.policyCurrentPage = page;
    this.loadPolicy();
  }

  onPolicyPageSizeChange(size: number) {
    this.policyPageSize = size;
    this.policyCurrentPage = 1;
    this.loadPolicy();
  }

  onAddPolicy() {
    this.policyId = undefined;
    this.policyDrawerOpen = true;
  }

  onEditPolicy(policy: ProductPolicy) {
    this.policyId = policy.policyId;
    this.policyDrawerOpen = true;
  }

  onViewPolicy(policy: ProductPolicy) {
    // TODO: Implement view Policy
    console.log('View Policy:', policy);
  }

  onPolicyDrawerClosed() {
    this.policyDrawerOpen = false;
    this.policyId = undefined;
  }

  onPolicyLoadData() {
    this.loadPolicy();
  }

  onDeletePolicy(policy: ProductPolicy) {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirm') || 'Confirmation',
      message: `${this.translate.translate('common.confirmDelete') || 'Are you sure you want to delete this policy'}: ${policy.policyName || policy.name || ''}?`,
      confirmText: this.translate.translate('common.yes') || 'Yes',
      cancelText: this.translate.translate('common.no') || 'No'
    }).subscribe((ok: boolean) => {
      if (!ok) return;
      
      policy._disabled = true;
      this.policyLoading = true;
      
      this.api.deletePolicy(policy.policyId)
        .pipe(finalize(() => {
          this.policyLoading = false;
          policy._disabled = false;
        }))
        .subscribe({
          next: () => {
            this.loadPolicy();
            this.snack.open(
              this.translate.translate('system.product.deletePolicySuccess') || 'Policy deleted successfully',
              '',
              {
                duration: 2200,
                panelClass: ['success-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top',
              }
            );
          },
          error: (error: any) => {
            this.snack.open(
              error?.error?.message || this.translate.translate('system.product.deletePolicyFailed') || 'Failed to delete policy',
              '',
              {
                duration: 2200,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top',
              }
            );
          }
        });
    });
  }

  onStatusToggle(policy: ProductPolicy, event: any): void {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirm') || 'Confirmation',
      message: `${this.translate.translate('common.confirmChangeStatus') || 'Are you sure you want to'} ${policy.status === 1 ? (this.translate.translate('common.disable') || 'disable') : (this.translate.translate('common.enable') || 'enable')} ${this.translate.translate('system.product.thisPolicy') || 'this policy'}: ${policy.policyName || policy.name || ''}?`,
      confirmText: this.translate.translate('common.yes') || 'Yes',
      cancelText: this.translate.translate('common.no') || 'No'
    }).subscribe((ok: boolean) => {
      if (!ok) {
        // Generic table already reverted the toggle, so we don't need to do anything
        return;
      }
      
      policy._disabled = true;
      this.policyLoading = true;
      
      const apiCall = policy.status === 1 
        ? this.api.disablePolicy(policy.policyId)
        : this.api.enablePolicy(policy.policyId);
      
      apiCall.pipe(finalize(() => {
        this.policyLoading = false;
        policy._disabled = false;
      })).subscribe({
        next: () => {
          this.loadPolicy();
          this.snack.open(
            this.translate.translate('system.product.updatePolicyStatusSuccess') || 'Policy status updated successfully',
            '',
            {
              duration: 2200,
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
        },
        error: (error: any) => {
          // Revert toggle on error - generic table already reverted, so we need to toggle again
          event.source.checked = !event.source.checked;
          this.snack.open(
            error?.error?.message || this.translate.translate('system.product.updatePolicyStatusFailed') || 'Failed to update policy status',
            '',
            {
              duration: 2200,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top',
            }
          );
        }
      });
    });
  }

  formatDateRange(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return '-';
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
    return `${startFormatted} - ${endFormatted}`;
  }
}
