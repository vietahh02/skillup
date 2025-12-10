import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {ActionWithHandler, TableConfig} from '../../../shared/components/generic-table/generic-table.model';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../../utils/shared/constants/pagination.constants';
import {GenericTableComponent} from "../../../shared/components/generic-table/generic-table.component";
import {GenericFilterComponent} from "../../../shared/components/generic-filter/generic-filter.component";
import {FilterConfig} from '../../../shared/components/generic-filter/generic-filter.model';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {
    PurchaseOrder,
    PurchaseOrderFilterCriteria,
    PurchaseOrderPagePayload
} from '../../../models/purchase-order.model';
import {ApiPurchaseOrderServices} from '../../../services/purchase-order.service';
import {ApiPartnerServices} from '../../../services/partner.service';
import {ApiAuthServices} from '../../../services/auth.service';
import {finalize, map} from 'rxjs/operators';
import {Router} from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DialogService} from '../../../services/dialog.service';
import {LanguageService} from '../../../services/language.service';
import {
    DataSourceFunction,
    SearchParams,
    SelectableItem
} from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import {Observable} from 'rxjs';
import {
    PurchaseOrderDetailDialogComponent
} from '../purchase-order-detail-dialog/purchase-order-detail-dialog.component';
import {
    CreateUpdatePurchaseOrderComponent
} from '../create-update-purchase-order/create-update-purchase-order.component';
import {generateUUID} from '../../../utils/uuid.util';

@Component({
  selector: 'app-purchase-order-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    GenericFilterComponent,
    GenericTableComponent,
    TranslatePipe
  ],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss'
})
export class PurchaseOrderListComponent implements OnInit {

  // Role-based visibility
  isPartnerAdmin = false;
  isHubAdmin = false;
    isHubUser = false;
  showPartnerFilter = false;
  showCreateButton = false;

    private readonly viewAction: ActionWithHandler = {
        type: 'view',
        tooltip: 'common.view',
        icon: 'visibility',
        color: '#000',
        handler: (item: PurchaseOrder) => this.onViewPurchaseOrder(item)
    } as ActionWithHandler;

    private readonly editAction: ActionWithHandler = {
        type: 'edit',
        tooltip: 'common.edit',
        icon: 'edit',
        color: '#137333',
        visible: (item: PurchaseOrder) => item.status === 0,
        handler: (item: PurchaseOrder) => this.onEditPurchaseOrder(item)
    } as ActionWithHandler;

    private readonly deleteAction: ActionWithHandler = {
        type: 'delete',
        tooltip: 'common.delete',
        icon: 'delete',
        color: '#d41900',
        visible: (item: PurchaseOrder) => item.status === 0,
        handler: (item: PurchaseOrder, event?: Event) => this.onDeletePurchaseOrder(item, event)
    } as ActionWithHandler;

    private readonly defaultActions: ActionWithHandler[] = [
        this.viewAction,
        this.editAction,
        this.deleteAction,
    ];

  constructor(
    private api: ApiPurchaseOrderServices,
    private partnerApi: ApiPartnerServices,
    private router: Router,
    private snack: MatSnackBar,
    private translate: LanguageService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private authService: ApiAuthServices
  ) {
    this.partnerDataSource = (params: SearchParams): Observable<SelectableItem[]> => {
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
            displayName: `${partner.partnerCode} - ${partner.partnerName}`,
            partnerId: partner.id,
            partnerCode: partner.partnerCode
          }));
        })
      );
    };
  }

  purchaseOrders: PurchaseOrder[] = [];
  total = 0;
  page = 1;
  size = DEFAULT_PAGE_SIZE;
  totalPages = 1;
  currentPage = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private criteria = signal<PurchaseOrderFilterCriteria>({});
  loading = false;
  isLoadingFilter = false;
  initialFilterValues: PurchaseOrderFilterCriteria = {};
  firstPartnerOption: SelectableItem | null = null;

  partnerDataSource!: DataSourceFunction;

  purchaseOrderTableConfig: TableConfig = {
    columns: [
      {
        key: 'orderId',
        header: 'system.purchaseOrder.orderId',
        align: 'center',
      },
      {
        key: 'partnerName',
        header: 'system.purchaseOrder.partner',
        align: 'center',
      },
      {
        key: 'transactionTypeStr',
        header: 'system.purchaseOrder.transactionType',
        align: 'center',
        template: 'pill',
        isTranslate: true,
        customColor: [
          { code: 'system.purchaseOrder.typeDeposit', color: '#137333' },
          { code: 'system.purchaseOrder.typeWithdrawal', color: '#d41900' },
        ],
      },
      {
        key: 'date',
        header: 'system.purchaseOrder.date',
        align: 'center',
      },
      {
        key: 'amountStr',
        header: 'system.purchaseOrder.amount',
        align: 'center',
      },
      {
        key: 'statusStr',
        header: 'system.purchaseOrder.status',
        template: 'pill',
        align: 'center',
        customColor: [
          { code: 'system.purchaseOrder.statusPending', color: '#bb8c01' },
          { code: 'system.purchaseOrder.statusApproved', color: '#137333' },
          { code: 'system.purchaseOrder.statusRejected', color: '#d41900' },
        ],
        isTranslate: true
      },
    ],
      actions: [],
    showSequenceNumber: true,
    enablePagination: true,
    enableStatusToggle: false,
    emptyMessage: 'common.noData'
  }

  purchaseOrderFilterConfig!: FilterConfig;

  ngOnInit() {
      this.isPartnerAdmin = this.authService.isPartnerAdmin() || this.authService.isAdminPartner?.() || false;
      this.isHubAdmin = this.authService.isHubAdmin() || this.authService.isAdminHub?.() || false;

      const userRoles = this.authService.getUserRoles();
      this.isHubUser = userRoles.includes('hub_user');

      this.showPartnerFilter = this.isHubAdmin || this.isHubUser;
      this.showCreateButton = this.isPartnerAdmin;

      if (this.isHubAdmin || this.isHubUser) {
          this.purchaseOrderTableConfig = {
              ...this.purchaseOrderTableConfig,
              actions: [this.viewAction]
          };
      } else {
          this.purchaseOrderTableConfig = {
              ...this.purchaseOrderTableConfig,
              actions: this.defaultActions
          };
      }

      this.loadDefaultValues();
  }

  private loadDefaultValues() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    // If partner_admin, use their partnerId directly
    if (this.isPartnerAdmin) {
      const partnerId = this.authService.getPartnerId();
      const defaultCriteria: PurchaseOrderFilterCriteria = {
        partnerId: partnerId || undefined,
        dateRange: {
          start: thirtyDaysAgo,
          end: today
        }
      };

      this.initialFilterValues = { ...defaultCriteria };
      this.initializeFilterConfig();
      this.criteria.set(defaultCriteria);
      this.onApplyFilters(defaultCriteria);
      return;
    }

      if (this.isHubAdmin || this.isHubUser) {
          // Render filters immediately with base criteria
          const baseCriteria: PurchaseOrderFilterCriteria = {
              partnerId: undefined,
              dateRange: {
                  start: thirtyDaysAgo,
                  end: today
              }
          };
          this.initialFilterValues = {...baseCriteria};
          this.initializeFilterConfig();
          this.criteria.set(baseCriteria);

          // Then load first partner and apply with that partnerId
      this.partnerApi.getPartnerPage({ page: 0, size: 1 }).subscribe({
        next: (response: any) => {
            const partners = response?.content || [];
            const firstPartner = partners.length > 0 ? partners[0] : null;

            if (firstPartner) {
                this.firstPartnerOption = {
                    value: firstPartner.id?.toString() || firstPartner.partnerCode,
                    displayName: `${firstPartner.partnerCode} - ${firstPartner.partnerName}`,
                    partnerId: firstPartner.id,
                    partnerCode: firstPartner.partnerCode
                };

            const defaultCriteria: PurchaseOrderFilterCriteria = {
                partnerId: firstPartner.id || undefined,
              dateRange: {
                start: thirtyDaysAgo,
                end: today
              }
            };

            this.initialFilterValues = { ...defaultCriteria };
            this.initializeFilterConfig();
            this.criteria.set(defaultCriteria);
            this.onApplyFilters(defaultCriteria);
            } else {
                // No partner found, apply base criteria
                this.onApplyFilters(baseCriteria);
          }
        },
        error: (err) => {
            console.error('Error loading first partner:', err);
            // Fallback: apply base criteria
            this.onApplyFilters(baseCriteria);
        }
      });
          return;
      }

      const defaultCriteria: PurchaseOrderFilterCriteria = {
          partnerId: undefined,
          dateRange: {
              start: thirtyDaysAgo,
              end: today
          }
      };
      this.initialFilterValues = {...defaultCriteria};
      this.initializeFilterConfig();
      this.criteria.set(defaultCriteria);
  }

  private initializeFilterConfig() {
    const fields: any[] = [
      {
        type: 'dateRange',
        key: 'dateRange',
        label: 'system.purchaseOrder.dateRange',
        class: 'col-md-3',
        placeholder: 'system.purchaseOrder.dateRange',
        icon: 'calendar_today'
      }
    ];

    // Only add partner filter for hub_admin
    if (this.showPartnerFilter) {
      fields.push({
        type: 'select-searchable',
        key: 'partnerId',
        label: 'system.purchaseOrder.selectPartner',
        class: 'col-md-3',
        placeholder: 'system.purchaseOrder.selectPartner',
        options: this.firstPartnerOption ? [this.firstPartnerOption] : [],
        searchableConfig: {
          dataSource: this.partnerDataSource,
          config: {
            placeholder: 'system.purchaseOrder.selectPartner',
            searchPlaceholder: 'system.purchaseOrder.searchPartner',
            noResultsMessage: 'common.noData',
            loadingMessage: 'common.loading',
            pageSize: 20,
            debounceTime: 500,
          }
        }
      });
    }

    fields.push(
      {
        type: 'select',
        key: 'status',
        label: 'system.purchaseOrder.selectStatus',
        class: 'col-md-3',
        placeholder: 'system.purchaseOrder.selectStatus',
        options: [
          { value: '', displayName: 'system.purchaseOrder.selectAllStatus' },
          { value: '0', displayName: 'system.purchaseOrder.statusPending' },
          { value: '1', displayName: 'system.purchaseOrder.statusApproved' },
          { value: '-1', displayName: 'system.purchaseOrder.statusRejected' },
        ],
        isTranslate: true
      },
      {
        type: 'select',
        key: 'transactionType',
        label: 'system.purchaseOrder.selectType',
        class: 'col-md-3',
        placeholder: 'system.purchaseOrder.selectType',
        options: [
          { value: '', displayName: 'system.purchaseOrder.selectAllType' },
          { value: 'DEPOSIT', displayName: 'system.purchaseOrder.typeDeposit' },
          { value: 'WITHDRAW', displayName: 'system.purchaseOrder.typeWithdrawal' },
          { value: 'INCREASE', displayName: 'system.purchaseOrder.typeIncrease' },
          { value: 'DECREASE', displayName: 'system.purchaseOrder.typeDecrease' },
        ],
        isTranslate: true
      },
      {
        type: 'text',
        key: 'keyword',
        label: 'system.purchaseOrder.placeholderSearch',
        class: 'col-md-3',
        placeholder: 'system.purchaseOrder.placeholderSearch',
        icon: 'search'
      }
    );

    const visibleFieldsCount = fields.length;
    const totalCols = 12;
      const fieldsCols = visibleFieldsCount * 3;
      const buttonClass = (this.isHubAdmin || this.isHubUser) ? 'col-md-9' : 'col-md-12';

    this.purchaseOrderFilterConfig = {
      fields: fields,
      showApplyButton: true,
      showClearButton: true,
      applyButtonText: 'common.apply',
      clearButtonText: 'common.clear',
      applyButtonIcon: 'filter_list',
      classButton: buttonClass
    };
  }

  private buildPayload(): PurchaseOrderPagePayload {
    const c = this.criteria();

    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const partnerId = c.partnerId ? String(c.partnerId) : (this.initialFilterValues.partnerId ? String(this.initialFilterValues.partnerId) : null);

    let fromDate: string;
    let toDate: string;

    if (c.dateRange?.start || c.dateRange?.end) {
      fromDate = c.dateRange.start
        ? (c.dateRange.start instanceof Date ? c.dateRange.start.toISOString().split('T')[0] : new Date(c.dateRange.start).toISOString().split('T')[0])
        : (this.initialFilterValues.dateRange?.start instanceof Date ? this.initialFilterValues.dateRange.start.toISOString().split('T')[0] : thirtyDaysAgo.toISOString().split('T')[0]);
      toDate = c.dateRange.end
        ? (c.dateRange.end instanceof Date ? c.dateRange.end.toISOString().split('T')[0] : new Date(c.dateRange.end).toISOString().split('T')[0])
        : (this.initialFilterValues.dateRange?.end instanceof Date ? this.initialFilterValues.dateRange.end.toISOString().split('T')[0] : today.toISOString().split('T')[0]);
    } else {
      fromDate = c.startDate
        ? (c.startDate instanceof Date ? c.startDate.toISOString().split('T')[0] : new Date(c.startDate).toISOString().split('T')[0])
        : (this.initialFilterValues.startDate instanceof Date ? this.initialFilterValues.startDate.toISOString().split('T')[0] : thirtyDaysAgo.toISOString().split('T')[0]);
      toDate = c.endDate
        ? (c.endDate instanceof Date ? c.endDate.toISOString().split('T')[0] : new Date(c.endDate).toISOString().split('T')[0])
        : (this.initialFilterValues.endDate instanceof Date ? this.initialFilterValues.endDate.toISOString().split('T')[0] : today.toISOString().split('T')[0]);
    }

    if (!partnerId) {
      console.warn('Partner ID is required but not provided');
      this.snack.open(this.translate.translate('system.purchaseOrder.partnerIdRequired'), '', {
        duration: 2200,
        panelClass: ['warning-snackbar', 'custom-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }

    const payload: PurchaseOrderPagePayload = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0',
      partnerId: partnerId || null,
      signature: 'string',
      status: c.status && c.status !== '' ? Number(c.status) : null,
      requestType: c.transactionType && c.transactionType !== '' ? c.transactionType : null,
      fromDate: fromDate,
      toDate: toDate,
      id: c.keyword && c.keyword.trim() !== '' ? c.keyword.trim() : null,
      page: this.page - 1,
      size: this.size
    };
    return payload;
  }

  load(): void {
    this.loading = true;
    const payload = this.buildPayload();
    this.isLoadingFilter = true;
    this.api.getPurchaseOrderPage(payload)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.isLoadingFilter = false;
      })
    )
    .subscribe({
      next: (response: any) => {
        try {
          if (!response) {
            this.purchaseOrders = [];
            this.total = 0;
            this.totalPages = 1;
            this.currentPage = 1;
            return;
          }

          const content = response?.content || [];
          this.purchaseOrders = content.map((item: any) => {
            // Map status từ number sang string
            // 0 = pending, 1 = approved, -1 = rejected
            let statusStr = '';
            if (item.status === 0) {
              statusStr = 'system.purchaseOrder.statusPending';
            } else if (item.status === 1) {
              statusStr = 'system.purchaseOrder.statusApproved';
            } else if (item.status === -1) {
              statusStr = 'system.purchaseOrder.statusRejected';
            } else {
              statusStr = item.status?.toString() || '';
            }

            // Map transactionType từ requestType
            // DEPOSIT, WITHDRAW
            let transactionTypeStr = '';
            if (item.requestType === 'DEPOSIT') {
              transactionTypeStr = 'system.purchaseOrder.typeDeposit';
            } else if (item.requestType === 'WITHDRAW') {
              transactionTypeStr = 'system.purchaseOrder.typeWithdrawal';
            } else {
              transactionTypeStr = item.requestType || '';
            }

            return {
              ...item,
              orderId: item.id, // Dùng id làm orderId
              amountStr: item.amount ? `${item.amount.toLocaleString()} KS` : '-',
              date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '-',
              transactionTypeStr: transactionTypeStr,
              statusStr: statusStr
            };
          });
          this.total = response?.totalElements || 0;
          this.totalPages = response?.totalPages || 1;
          this.currentPage = response?.number !== undefined ? response.number + 1 : 1;
        } catch (error: any) {
          console.error('Error processing purchase order data:', error);
          this.purchaseOrders = [];
          this.total = 0;
          this.totalPages = 1;
          this.currentPage = 1;
          this.snack.open(error?.error?.errorMessage || 'Failed to load purchase orders', '', {
            duration: 2200,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      },
      error: (err) => {
        this.snack.open(err?.error?.errorMessage || this.translate.translate('system.purchaseOrder.failedToLoadPurchaseOrders'), '', {
          duration: 2200,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.purchaseOrders = [];
        this.total = 0;
        this.totalPages = 1;
        this.currentPage = 1;
        this.snack.open(err?.error?.errorMessage || 'Failed to load purchase orders', '', {
          duration: 2200,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  onApplyFilters(c: PurchaseOrderFilterCriteria) {
    this.criteria.set(c);
    this.page = 1;
    this.load();
  }

  onClearFilters() {
    const defaultCriteria: PurchaseOrderFilterCriteria = { ...this.initialFilterValues };
    this.criteria.set(defaultCriteria);
    this.page = 1;
    this.load();
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

  onCreatePurchaseOrder(): void {
    const dialogRef = this.dialog.open(CreateUpdatePurchaseOrderComponent, {
      width: '1000px',
      maxWidth: '90vw',
      data: {},
      disableClose: false
    });

    dialogRef.componentInstance.loadData.subscribe(() => {
      this.load();
    });
  }

  onViewPurchaseOrder(order: PurchaseOrder): void {
      const dialogRef = this.dialog.open(PurchaseOrderDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { id: order.id },
      disableClose: false
      });

      dialogRef.afterClosed().subscribe(result => {
          if (result?.action === 'approve' || result?.action === 'reject') {
              this.load();
          }
    });
  }

  onEditPurchaseOrder(order: PurchaseOrder): void {
    const dialogRef = this.dialog.open(CreateUpdatePurchaseOrderComponent, {
      width: '1000px',
      maxWidth: '90vw',
      data: { id: order.id },
      disableClose: false
    });

    dialogRef.componentInstance.loadData.subscribe(() => {
      this.load();
    });
  }

  onDeletePurchaseOrder(order: PurchaseOrder, event?: Event): void {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirm'),
      message: `${this.translate.translate('common.confirmDelete')} ${order.id}?`,
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no'),
      destructive: true
    }).subscribe((ok: boolean) => {
      if (!ok) {
        return;
      }

      this.loading = true;
      this.api.deletePurchaseOrder(order.id).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('common.delete') + ' success', '', {
            duration: 2200,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.load();
        },
        error: (err) => {
          this.loading = false;
          this.snack.open(err?.error?.errorMessage || 'Failed to delete purchase order', '', {
            duration: 2200,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    });
  }

}

