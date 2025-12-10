import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TableConfig, PaginationInfo, ActionWithHandler } from '../../../shared/components/generic-table/generic-table.model';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS } from '../../../utils/shared/constants/pagination.constants';
import { GenericTableComponent } from "../../../shared/components/generic-table/generic-table.component";
import { GenericFilterComponent } from "../../../shared/components/generic-filter/generic-filter.component";
import { Product, ProductFilterCriteria, ProductPagePayload } from '../../../models/product.model';
import { FilterConfig } from '../../../shared/components/generic-filter/generic-filter.model';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { ProductCreateUpdateComponent } from "../product-create-update/product-create-update.component";
import { finalize } from 'rxjs/operators';
import { ApiProductServices } from '../../../services/system-product.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../../services/dialog.service';
import { Router } from '@angular/router';
import { ApiAuthServices } from '../../../services/auth.service';
import { PAGES } from '../../../utils/shared/constants/auth.constants';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from '../../../services/language.service';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    GenericFilterComponent,
    GenericTableComponent,
    TranslatePipe,
],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent {
  private api = inject(ApiProductServices);
  private snack = inject(MatSnackBar);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  private authService = inject(ApiAuthServices);
  private dialog = inject(MatDialog);
  private translate = inject(LanguageService);
  products: Product[] = [];
  total = 0;
  page = 1;
  size = DEFAULT_PAGE_SIZE;
  totalPages = 1;
  currentPage = 1;
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
  productTableConfig: TableConfig = {
    columns: []
  }

  private criteria = signal<ProductFilterCriteria>({});
  loading = false;
  isLoadingFilter = false;

  

  productFilterConfig: FilterConfig = {
    fields: [
      {
        type: 'text',
        key: 'keyword',
        label: 'system.product.placeholderSearch',
        class: 'col-md-3',
        placeholder: 'system.product.placeholderSearch',
        icon: 'search'
      },
      {
        type: 'select',
        key: 'status',
        label: 'system.product.productType',
        class: 'col-md-3',
        options: [
          { value: 'all', displayName: 'system.product.allProductTypes' },
          { value: '-1', displayName: 'system.product.productTypeDeleted' },
          { value: '0', displayName: 'system.product.productTypeInactive' },
          { value: '1', displayName: 'system.product.productTypeActive' },
        ],
        isTranslate: true
      }
    ],
    showApplyButton: true,
    showClearButton: true,
    applyButtonText: 'common.apply',
    clearButtonText: 'common.clear',
    applyButtonIcon: 'filter_list',
    classButton: 'col-md-6'
  };

  ngOnInit() {
    this.onApplyFilters({});

    this.productTableConfig = {
      columns: [
        { 
          key: 'productCode', 
          header: 'system.product.productCode', 
          align: 'center',
        },
        { 
          key: 'productName', 
          header: 'system.product.name', 
          align: 'center',
        },
        { 
          key: 'productDescription', 
          header: 'system.product.description', 
          align: 'center' 
        },
        { 
          key: 'statusName', 
          header: 'system.product.status', 
          template: 'pill',
          align: 'center',
          customColor: [
            { code: 'common.active', color: '#137333' },
            { code: 'common.inactive', color: '#d41900' },
            { code: 'common.deleted', color: '#e97712' },
          ],
          isTranslate: true
        },
      ],
      actions: this.setupTableActions(),
      showSequenceNumber: true,
      enablePagination: true,
      enableStatusToggle: true,
      emptyMessage: 'common.noData'
    } 
  }
  
  setupTableActions(): ActionWithHandler[] {
    const actions: ActionWithHandler[] = [];
    if (this.authService.isPageGranted(PAGES.PRODUCT_DETAIL)) {
      actions.push({
        type: 'view',
        tooltip: 'common.view',
        icon: 'visibility',
        color: '#000',
        handler: (item: Product) => this.onViewProduct(item)
      } as ActionWithHandler);
    }
    actions.push({
      type: 'delete',
      tooltip: 'common.delete',
      icon: 'delete',
      color: '#ff0404',
      handler: (item: Product, event: Event) => this.onDeleteProduct(item, event)
    } as ActionWithHandler);
    return actions;
  }

  onCreateProduct() {
    this.dialog.open(ProductCreateUpdateComponent, {
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { loadData: () => this.load() },
      disableClose: true,
      autoFocus: false
    });
  }

  onViewProduct(product: Product): void {
    this.router.navigate(['/system/product-management', product.productId]);
  }

  onDeleteProduct(product: Product, event: Event): void {
    const button = event?.currentTarget as HTMLButtonElement;
    if (button) {
      button.disabled = true;
    }
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.product.confirmDeleteProduct', { productName: product.productName }),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) {
        button.disabled = false;
        return;
      }
      this.loading = true;
      this.api.deleteProduct(product.productId).pipe(finalize(() => {
        this.loading = false;
        button.disabled = false;
      })).subscribe((response: any) => {
        this.load();
        this.snack.open(this.translate.translate('system.product.deletedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      }, (error: any) => {
        this.snack.open(error?.error?.errorMessage || this.translate.translate('system.product.failedToDeleteProduct'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      });
    });
  }

  onStatusToggle(product: Product, event: any): void {
    this.dialogService.confirm({
      type: 'confirm',
      title: this.translate.translate('common.confirmation'),
      message: this.translate.translate('system.product.confirmChangeStatus', { status: product.status === 1 ? this.translate.translate('common.disable') : this.translate.translate('common.enable'), productName: product.productName }),
      confirmText: this.translate.translate('common.yes'),
      cancelText: this.translate.translate('common.no')
    }).subscribe((ok: boolean) => {
      if (!ok) return;
      product._disabled = true;
      this.loading = true;
      this.api[product.status === 1 ? 'disableProduct' : 'enableProduct'](product.productId).pipe(finalize(() => {
        this.loading = false;
        product._disabled = false;
      })).subscribe((response: any) => {
        this.load();
        this.snack.open(this.translate.translate('system.product.enabledSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      }, (error: any) => {
        this.snack.open(error?.error?.errorMessage || this.translate.translate('system.product.failedToEnableProduct'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
      });
    });
  }

  private buildPayload(): ProductPagePayload {
    const c = this.criteria();

    const payload: ProductPagePayload = {
      page: this.page - 1,
      size: this.size,
    };

    if (c.keyword) payload.keyword = c.keyword.trim();
    if (c.status && c.status != 'all') payload.status = c.status;

    return payload;
  }

  load(): void {
    this.loading = true;
    this.isLoadingFilter = true;
    this.api.getProductPage(this.buildPayload())
    .pipe(
      finalize(() => {
        this.loading = false;
        this.isLoadingFilter = false;
      })
    ).subscribe((response: any) => {
      this.products = response?.content.map((item: any) => ({
        ...item,
        statusName: item.status === 1 ? 'common.active' : item.status === 0 ? 'common.inactive' : 'common.deleted',
        _enabled: item.status === 1,
      }));
      this.total = response?.totalElements || 0;
      this.totalPages = response?.totalPages || 1;
      this.currentPage = response?.number + 1 || 1;
    });
  }

  onApplyFilters(c: ProductFilterCriteria) {
    this.criteria.set(c);
    this.page = 1;
    this.load();
  }

  onClearFilters() {}

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

}


