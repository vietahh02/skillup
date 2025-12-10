import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { GenericPaginationComponent } from '../../../shared/components/generic-pagination/generic-pagination.component';
import { GenericFilterComponent } from '../../../shared/components/generic-filter/generic-filter.component';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { NotificationDetailDialogComponent } from '../notification-detail-dialog/notification-detail-dialog.component';
import { ApiPurchaseOrderServices } from '../../../services/purchase-order.service';
import { ApiPartnerServices } from '../../../services/partner.service';
import { ApiAuthServices } from '../../../services/auth.service';
import { PurchaseOrder, PurchaseOrderPagePayload } from '../../../models/purchase-order.model';
import { FilterConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { DataSourceFunction, SelectableItem, SearchParams } from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import { Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { generateUUID } from '../../../utils/uuid.util';

export interface Notification {
  id: string;
  channel: string;
  amount: number;
  orderId: string;
  description: string;
  timestamp: Date;
  daysAgo: number;
  requestType?: 'DEPOSIT' | 'WITHDRAW';
  createdBy?: string;
}

@Component({
  selector: 'app-notification-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    TranslatePipe,
    GenericPaginationComponent,
    GenericFilterComponent
  ],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  selectedTab = signal<number>(0);
  
  // Role-based visibility
  isPartnerAdmin = false;
  isHubAdmin = false;
  showPartnerFilter = false;
  
  // Pagination
  page = 1;
  size = DEFAULT_PAGE_SIZE;
  total = 0;
  totalPages = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
  loading = false;
  isLoadingFilter = false;
  
  // Filter
  partnerFilterConfig: FilterConfig | null = null;
  initialFilterValues: any = {};
  firstPartnerOption: SelectableItem | null = null;
  partnerDataSource!: DataSourceFunction;
  
  // All notifications data (full list)
  allPurchaseOrderNotifications: Notification[] = [];
  allApprovalRequestNotifications: Notification[] = [];
  allSystemNotifications: Notification[] = [];
  
  // Paginated notifications (displayed)
  purchaseOrderNotifications: Notification[] = [];
  approvalRequestNotifications: Notification[] = [];
  systemNotifications: Notification[] = [];
  

  constructor(
    private dialog: MatDialog,
    private purchaseOrderService: ApiPurchaseOrderServices,
    private partnerApi: ApiPartnerServices,
    private authService: ApiAuthServices,
    private snackBar: MatSnackBar
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

  ngOnInit() {
    this.checkUserRoles();
    this.initializeFilterConfig();
    this.loadDefaultValues();
    // loadNotifications will be called from loadDefaultValues after partner is loaded
  }

  checkUserRoles(): void {
    const roles = this.authService.getUserRoles();
    this.isPartnerAdmin = this.authService.isPartnerAdmin();
    this.isHubAdmin = this.authService.isHubAdmin();
    this.showPartnerFilter = this.isHubAdmin;
  }

  initializeFilterConfig(): void {
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

    const visibleFieldsCount = fields.length;
    const totalCols = 12;
    const fieldsCols = visibleFieldsCount * 3;
    const buttonCols = totalCols - fieldsCols;
    const buttonClass = buttonCols > 0 ? `col-md-${buttonCols} ms-auto` : 'ms-auto';

    this.partnerFilterConfig = {
      fields: fields,
      showApplyButton: true,
      showClearButton: true,
      applyButtonText: 'common.apply',
      clearButtonText: 'common.clear',
      applyButtonIcon: 'filter_list',
      classButton: buttonClass
    };
  }

  loadDefaultValues(): void {
    // Set default date range (30 days from today)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Format dates for API (YYYY-MM-DD)
    const formatDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    this.initialFilterValues = {
      dateRange: {
        start: thirtyDaysAgo,
        end: today
      },
      dateRangeStart: formatDate(thirtyDaysAgo),
      dateRangeEnd: formatDate(today)
    };

    if (this.isHubAdmin) {
      // Load first partner for hub_admin
      this.partnerApi.getPartnerPage({ page: 0, size: 1 }).pipe(
        finalize(() => {})
      ).subscribe({
        next: (response: any) => {
          const partners = response?.content || [];
          if (partners.length > 0) {
            const firstPartner = partners[0];
            this.firstPartnerOption = {
              value: firstPartner.id?.toString() || firstPartner.partnerCode,
              displayName: `${firstPartner.partnerCode} - ${firstPartner.partnerName}`,
              partnerId: firstPartner.id,
              partnerCode: firstPartner.partnerCode
            };
            this.initialFilterValues = {
              ...this.initialFilterValues,
              partnerId: this.firstPartnerOption.value
            };
            this.initializeFilterConfig();
            this.loadNotifications();
          }
        },
        error: (error) => {
          console.error('Error loading partners:', error);
          this.loadFirstPartnerFromDataSource();
        }
      });
    } else if (this.isPartnerAdmin) {
      const partnerId = this.authService.getPartnerId();
      if (partnerId) {
        this.initialFilterValues = {
          ...this.initialFilterValues,
          partnerId: partnerId
        };
      }
      this.loadNotifications();
    } else {
      this.loadNotifications();
    }
  }

  loadFirstPartnerFromDataSource(): void {
    this.partnerDataSource({ page: 0, size: 1 }).subscribe({
      next: (partners: SelectableItem[]) => {
        if (partners.length > 0) {
          const firstPartner = partners[0];
          this.firstPartnerOption = firstPartner;
          this.initialFilterValues = {
            ...this.initialFilterValues,
            partnerId: firstPartner.value
          };
          this.initializeFilterConfig();
          this.loadNotifications();
        }
      },
      error: (error) => {
        console.error('Error loading first partner from dataSource:', error);
        this.loadNotifications();
      }
    });
  }


  onTabChange(index: number) {
    this.selectedTab.set(index);
    this.page = 1; 
    if (index === 0) {
      this.initializeFilterConfig();
    }
    this.loadNotifications();
  }

  loadNotifications() {
    const tab = this.selectedTab();
    
    if (tab === 0) {
      this.loadPurchaseOrderNotifications();
    } else {
      this.loading = true;
      setTimeout(() => {
        let allNotifications: Notification[] = [];
        
        switch (tab) {
          case 1:
            allNotifications = this.allApprovalRequestNotifications;
            break;
          case 2:
            allNotifications = this.allSystemNotifications;
            break;
          default:
            allNotifications = [];
        }

      
        this.total = allNotifications.length;
        this.totalPages = Math.ceil(this.total / this.size);
        
        
        const startIndex = (this.page - 1) * this.size;
        const endIndex = startIndex + this.size;
        const paginatedData = allNotifications.slice(startIndex, endIndex);
        
       
        switch (tab) {
          case 1:
            this.approvalRequestNotifications = paginatedData;
            break;
          case 2:
            this.systemNotifications = paginatedData;
            break;
        }
        
        this.loading = false;
      }, 300);
    }
  }

  loadPurchaseOrderNotifications(): void {
    this.loading = true;

   
    const partnerId = this.isHubAdmin 
      ? (this.initialFilterValues?.partnerId || null)
      : (this.isPartnerAdmin ? this.authService.getPartnerId() : null);

    
    let fromDate: string | null = null;
    let toDate: string | null = null;

    if (this.initialFilterValues?.dateRange) {
      const dateRange = this.initialFilterValues.dateRange;
      if (dateRange.start) {
        const startDate = dateRange.start instanceof Date ? dateRange.start : new Date(dateRange.start);
        fromDate = this.formatDateForAPI(startDate);
      }
      if (dateRange.end) {
        const endDate = dateRange.end instanceof Date ? dateRange.end : new Date(dateRange.end);
        toDate = this.formatDateForAPI(endDate);
      }
    } else if (this.initialFilterValues?.dateRangeStart && this.initialFilterValues?.dateRangeEnd) {
      fromDate = this.initialFilterValues.dateRangeStart;
      toDate = this.initialFilterValues.dateRangeEnd;
    }

    
    if (!fromDate || !toDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      fromDate = this.formatDateForAPI(thirtyDaysAgo);
      toDate = this.formatDateForAPI(today);
    }

    const payload: PurchaseOrderPagePayload = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0',
      status: 0, 
      partnerId: partnerId || null,
      fromDate: fromDate,
      toDate: toDate,
      page: this.page - 1, 
      size: this.size
    };

    this.purchaseOrderService.getPurchaseOrderPage(payload).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (response: any) => {
        const content = response?.content || [];
        
        // Map purchase orders to notifications
        this.allPurchaseOrderNotifications = content.map((order: PurchaseOrder) => {
          const createdAt = order.createdAt ? new Date(order.createdAt) : new Date();
          const daysAgo = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            id: order.id || '',
            channel: order.partnerName || 'MYTELPAY-CHANNEL',
            amount: order.amount || 0,
            orderId: order.id || order.orderId || '',
            description: `New order #${order.id || order.orderId || ''}, need to be approve`,
            timestamp: createdAt,
            daysAgo: daysAgo,
            requestType: (order.requestType as 'DEPOSIT' | 'WITHDRAW') || 'DEPOSIT',
            createdBy: order.createdBy || 'admin'
          };
        });

        this.total = response?.totalElements || 0;
        this.totalPages = response?.totalPages || 1;
        
        // Update displayed notifications
        this.purchaseOrderNotifications = this.allPurchaseOrderNotifications;
      },
      error: (error) => {
        console.error('Error loading purchase order notifications:', error);
        this.snackBar.open('Failed to load notifications', '', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.allPurchaseOrderNotifications = [];
        this.purchaseOrderNotifications = [];
        this.total = 0;
        this.totalPages = 1;
      }
    });
  }

  onApplyFilters(filters: any): void {
    // Handle date range format
    if (filters.dateRange) {
      const dateRange = filters.dateRange;
      if (dateRange.start) {
        filters.dateRangeStart = dateRange.start instanceof Date 
          ? this.formatDateForAPI(dateRange.start) 
          : dateRange.start;
      }
      if (dateRange.end) {
        filters.dateRangeEnd = dateRange.end instanceof Date 
          ? this.formatDateForAPI(dateRange.end) 
          : dateRange.end;
      }
    }
    
    this.initialFilterValues = { ...filters };
    this.page = 1;
    this.loadNotifications();
  }

  formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClearFilters(): void {
    // Reset to default values
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    this.initialFilterValues = {
      dateRange: {
        start: thirtyDaysAgo,
        end: today
      },
      dateRangeStart: this.formatDateForAPI(thirtyDaysAgo),
      dateRangeEnd: this.formatDateForAPI(today)
    };

    if (this.isHubAdmin && this.firstPartnerOption) {
      this.initialFilterValues = {
        ...this.initialFilterValues,
        partnerId: this.firstPartnerOption.value
      };
    } else if (this.isPartnerAdmin) {
      const partnerId = this.authService.getPartnerId();
      if (partnerId) {
        this.initialFilterValues = {
          ...this.initialFilterValues,
          partnerId: partnerId
        };
      }
    }
    this.page = 1;
    this.loadNotifications();
  }

  onPageChange(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.page = page;
    this.loadNotifications();
  }

  onPageSizeChange(size: number) {
    this.size = size;
    this.page = 1; // Reset to first page when changing page size
    this.loadNotifications();
  }

  getNotificationsForCurrentTab(): Notification[] {
    const tab = this.selectedTab();
    switch (tab) {
      case 0:
        return this.purchaseOrderNotifications;
      case 1:
        return this.approvalRequestNotifications;
      case 2:
        return this.systemNotifications;
      default:
        return [];
    }
  }

  formatAmount(amount: number): string {
    return `Ks ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getDaysAgoText(days: number): string {
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  }

  getRequestTypeLabel(requestType?: 'DEPOSIT' | 'WITHDRAW'): string {
    if (!requestType) return '';
    return requestType === 'DEPOSIT' 
      ? 'system.purchaseOrder.typeDeposit' 
      : 'system.purchaseOrder.typeWithdrawal';
  }

  isDeposit(requestType?: 'DEPOSIT' | 'WITHDRAW'): boolean {
    return requestType === 'DEPOSIT';
  }

  getDescriptionText(notification: Notification): { before: string; after: string } {
    const parts = notification.description.split(`#${notification.orderId}`);
    const before = parts[0] || '';
    const after = parts[1] || '';
    return { before, after };
  }

  onNotificationClick(notification: Notification): void {
    this.dialog.open(NotificationDetailDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '90vh',
      data: { notification },
      disableClose: false,
      autoFocus: false
    });
  }
}

