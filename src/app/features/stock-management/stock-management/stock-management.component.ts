import { AfterViewInit, Component, inject, OnInit, signal, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDrawerContainer, MatDrawer, MatDrawerContent } from "@angular/material/sidenav";
import { Router } from '@angular/router';
import { GenericFilterComponent } from '../../../shared/components/generic-filter/generic-filter.component';
import { GenericTableComponent } from '../../../shared/components/generic-table/generic-table.component';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { ProductCreateUpdateComponent } from '../../product-management/product-create-update/product-create-update.component';
import { ApiProductServices } from '../../../services/system-product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../../services/dialog.service';
import { Product } from '../../../models/product.model';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { TableConfig } from '../../../shared/components/generic-table/generic-table.model';
import { ActionWithHandler } from '../../../shared/components/generic-table/generic-table.model';
import { FilterConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { ProductFilterCriteria, ProductPagePayload } from '../../../models/product.model';
import { finalize, map } from 'rxjs/operators';
import { DataSourceFunction, SearchParams, SelectableItem } from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import { Partner } from '../../../models/partner.model';
import { ApiPartnerServices } from '../../../services/partner.service';
import { Stock, StockFilterCriteria, StockPagePayload } from '../../../models/stock.model';
import { ApiStockServices } from '../../../services/stock.service';
import { CreateUpdateStockComponent } from "../create-update-stock/create-update-stock.component";
import { MatDialog } from '@angular/material/dialog';
import { ApiAuthServices } from '../../../services/auth.service';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-stock-management',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    GenericFilterComponent,
    GenericTableComponent,
    TranslatePipe,  
],
  templateUrl: './stock-management.component.html',
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent {
  private stockApi = inject(ApiStockServices);
  private snack = inject(MatSnackBar);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private partnerApi = inject(ApiPartnerServices);
  private dialog = inject(MatDialog);
  private authService = inject(ApiAuthServices);
  private translate = inject(LanguageService);
  products: Product[] = [];
  stocks: Stock[] = [];
  total = 0;
  drawerOpen = false;

  stockId?: string | number;
  page = 1;
  size = 1000;
  totalPages = 1;
  currentPage = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;

  private criteria = signal<StockFilterCriteria>({});
  loading = false;
  isLoadingFilter = false;

  stockTableConfig: TableConfig = {
    columns: [
      { 
        key: 'partnerName', 
        header: 'system.stock.partnerName', 
        align: 'center',
      },
      { 
        key: 'stockType', 
        header: 'system.stock.stockType', 
        align: 'center',
      },
      { 
        key: 'createdAt', 
        header: 'system.stock.createdAt', 
        align: 'center' 
      },
      { 
        key: 'lastUpdatedAt', 
        header: 'system.stock.lastUpdatedAt', 
        align: 'center' 
      },
      { 
        key: 'balance', 
        header: 'system.stock.balance', 
        align: 'center' 
      },
      { 
        key: 'holdingBalance', 
        header: 'system.stock.holdingBalance', 
        align: 'center' 
      },
      {
        key: 'status', 
        header: 'system.stock.status', 
        template: 'pill',
        align: 'center',
        customColor: [
          { code: 'common.active', color: '#137333' },
          { code: 'common.inactive', color: '#d41900' },
          { code: 'common.deleted', color: '#e97712' },
        ],
        isTranslate: true
      }
    ],
    actions: [
      // {
      //   type: 'view',
      //   tooltip: 'common.view',
      //   icon: 'visibility',
      //   color: '#000',
      //   handler: (item: Product) => this.onViewProduct(item)
      // } as ActionWithHandler,
    ],
    showSequenceNumber: true,
    enablePagination: false,
    enableStatusToggle: false,
    emptyMessage: 'common.noData'
  } 

  stockFilterConfig: FilterConfig = {
    fields: [
      // {
      //   type: 'text',
      //   key: 'keyword',
      //   label: 'system.stock.placeholderSearch',
      //   class: 'col-md-3',
      //   placeholder: 'system.stock.placeholderSearch',
      //   icon: 'search'
      // },
      {
        type: 'select-searchable',
        key: 'partnerId',
        class: 'col-md-3',
        defaultValue: 'all',
        searchableConfig: {
          dataSource: this.getPartnersDataSource(),
          config: {
            placeholder: 'system.stock.selectPartner',
          }
        },
        visible: () => this.authService.isAdminHub(),
      }
    ],
    showApplyButton: true,
    showClearButton: true,
    applyButtonText: 'common.apply',
    clearButtonText: 'common.clear',
    applyButtonIcon: 'filter_list',
    classButton: 'col-md-9'
  };

  ngOnInit() {
    this.onApplyFilters({});  
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/system/product-management', product.productId]);
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
        map((res: any) =>
          (res?.content as Partner[] || []).map((item: Partner) => ({
            value: item.id,
            displayName: item.partnerName,
          } as SelectableItem))
        )
      );
    };
  }
  
  onCreateStock() {
    this.dialog.open(CreateUpdateStockComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { loadData: () => this.load() },
      disableClose: true,
      autoFocus: false
    });
  }

  private buildPayload(): StockPagePayload {
    const c = this.criteria();

    const payload: StockPagePayload = {};

    if (c.keyword) payload.keyword = c.keyword.trim();
    if (c.partnerId && c.partnerId != 'all') payload.partnerId = c.partnerId;

    return payload;
  }

  load(): void {
    const payload = this.buildPayload();
    this.loading = true;
    this.isLoadingFilter = true;
    this.stockApi.getStockPage(payload)
    .pipe(
      finalize(() => {
        this.loading = false;
        this.isLoadingFilter = false;
      })
    ).subscribe((response: any) => {
      this.stocks = response?.map((item: any) => ({
        ...item,
        status: item.status === 'ACTIVE' ? 'common.active' : item.status === 'INACTIVE' ? 'common.inactive' : 'common.deleted',
        createdAt: this.dateFormat(item.createdAt),
        lastUpdatedAt: this.dateFormat(item.lastUpdatedAt),
      }));
    }, (error: any) => {
      this.stocks = [];
      this.snack.open(error.error.errorMessage || this.translate.translate('system.stock.failedToLoadStocks'), '', {
        duration: 3000,
        panelClass: ['error-snackbar', 'custom-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    });
  }

  dateFormat(date: string): string {
    return date.split('T')[0];
  }

  onApplyFilters(c: StockFilterCriteria) {
    this.criteria.set(c);
    this.page = 1;
    this.load();
  }

  onClearFilters() {}

}


