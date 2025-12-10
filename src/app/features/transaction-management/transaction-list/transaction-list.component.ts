import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {ActionWithHandler, TableConfig} from '../../../shared/components/generic-table/generic-table.model';
import {DEFAULT_PAGE_SIZE} from '../../../utils/shared/constants/pagination.constants';
import {GenericTableComponent} from "../../../shared/components/generic-table/generic-table.component";
import {GenericFilterComponent} from "../../../shared/components/generic-filter/generic-filter.component";
import {FilterConfig} from '../../../shared/components/generic-filter/generic-filter.model';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {Transaction, TransactionFilterCriteria, TransactionPagePayload} from '../../../models/transaction.model';
import {ApiTransactionServices} from '../../../services/transaction.service';
import {ApiPartnerServices} from '../../../services/partner.service';
import {ApiProductServices} from '../../../services/system-product.service';
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
import {generateUUID} from '../../../utils/uuid.util';

@Component({
    selector: 'app-transaction-list',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        GenericFilterComponent,
        GenericTableComponent,
        TranslatePipe
    ],
    templateUrl: './transaction-list.component.html',
    styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent implements OnInit {

    // Role-based visibility
    isPartnerAdmin = false;
    isHubAdmin = false;
    showPartnerFilter = false;

    constructor(
        private api: ApiTransactionServices,
        private partnerApi: ApiPartnerServices,
        private productApi: ApiProductServices,
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

        this.productDataSource = (params: SearchParams): Observable<SelectableItem[]> => {
            const payload: any = {
                page: params.page,
                size: params.size || 20,
            };

            if (params.keyword && params.keyword.trim() !== '') {
                payload.keyword = params.keyword.trim();
            }

            return this.productApi.getProductPage(payload).pipe(
                map((response: any) => {
                    const products = response?.content || [];
                    return products.map((product: any) => ({
                        value: product.productId?.toString() || product.productCode,
                        displayName: `${product.productCode} - ${product.productName}`,
                        productId: product.productId,
                        productCode: product.productCode
                    }));
                })
            );
        };
    }

    transactions: Transaction[] = [];
    total = 0;
    page = 1;
    size = DEFAULT_PAGE_SIZE;
    totalPages = 1;
    loading = false;
    isLoadingFilter = false;

    transactionFilterConfig!: FilterConfig;
    transactionTableConfig!: TableConfig;
    partnerDataSource!: DataSourceFunction;
    productDataSource!: DataSourceFunction;

    initialFilterValues: any = {
        dateRange: null,
        status: '',
        productId: undefined,
        keyword: '',
        partnerId: null
    };

    ngOnInit(): void {
        this.checkUserRoles();
        this.initializeFilterConfig();
        this.initializeTableConfig();
        this.loadDefaultValues();
    }

    checkUserRoles(): void {
        this.isPartnerAdmin = this.authService.isPartnerAdmin();
        this.isHubAdmin = this.authService.isHubAdmin();
        this.showPartnerFilter = this.isHubAdmin;
    }

    initializeFilterConfig(): void {
        const fields: any[] = [
            {
                type: 'dateRange',
                key: 'dateRange',
                label: 'system.transaction.dateRange',
                class: 'col-md-3',
                placeholder: 'system.transaction.dateRange',
                icon: 'calendar_today'
            }
        ];

        if (this.showPartnerFilter) {
            fields.push({
                type: 'select-searchable',
                key: 'partnerId',
                label: 'system.transaction.partner',
                class: 'col-md-3',
                placeholder: 'system.transaction.partner',
                searchableConfig: {
                    dataSource: this.partnerDataSource,
                    config: {
                        placeholder: 'system.transaction.partner',
                        searchPlaceholder: 'system.transaction.searchPartner',
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
                label: 'system.transaction.status',
                class: 'col-md-3',
                placeholder: 'system.transaction.status',
                options: [
                    {value: '', displayName: 'common.all'},
                    {value: '0', displayName: 'system.transaction.status.pending'},
                    {value: '1', displayName: 'system.transaction.status.success'},
                    {value: '2', displayName: 'system.transaction.status.failed'},
                    {value: '3', displayName: 'system.transaction.status.cancelled'}
                ],
                isTranslate: true
            },
            {
                type: 'select-searchable',
                key: 'productId',
                label: 'system.transaction.product',
                class: 'col-md-3',
                placeholder: 'system.transaction.product',
                searchableConfig: {
                    dataSource: this.productDataSource,
                    config: {
                        placeholder: 'system.transaction.product',
                        searchPlaceholder: 'system.transaction.searchProduct',
                        noResultsMessage: 'common.noData',
                        loadingMessage: 'common.loading',
                        pageSize: 20,
                        debounceTime: 500,
                    }
                }
            },
            {
                type: 'text',
                key: 'keyword',
                label: 'system.transaction.search',
                class: 'col-md-3',
                placeholder: 'system.transaction.searchPlaceholder',
                icon: 'search'
            }
        );

        const visibleFieldsCount = fields.length;
        const totalCols = 12;
        const fieldsCols = visibleFieldsCount * 3;
        const buttonClass = this.isHubAdmin ? 'col-md-9' : 'col-md-12';

        this.transactionFilterConfig = {
            fields: fields,
            showApplyButton: true,
            showClearButton: true,
            applyButtonText: 'common.apply',
            clearButtonText: 'common.clear',
            applyButtonIcon: 'filter_list',
            classButton: buttonClass,
            customButtons: [
                {
                    key: 'export',
                    label: 'common.export',
                    icon: '',
                    backgroundColor: '#137333',
                    textColor: '#ffffff',
                    buttonType: 'flat'
                }
            ]
        };
    }

    initializeTableConfig(): void {
        this.transactionTableConfig = {
            columns: [
                {key: 'transId', header: 'system.transaction.transId', align: 'center'},
                {key: 'refPartnerTransId', header: 'system.transaction.refPartnerTransId', align: 'center'},
                {key: 'receiver', header: 'system.transaction.receiver', align: 'center'},
                {key: 'amountStr', header: 'system.transaction.amount', align: 'center'},
                {key: 'productName', header: 'system.transaction.product', align: 'center'},
                {key: 'date', header: 'system.transaction.date', align: 'center'},
                {
                    key: 'statusStr',
                    header: 'system.transaction.status',
                    align: 'center',
                    template: 'pill',
                    customColor: [
                        {code: 'system.transaction.status.pending', color: '#fbbc04'},
                        {code: 'system.transaction.status.success', color: '#137333'},
                        {code: 'system.transaction.status.failed', color: '#d41900'},
                        {code: 'system.transaction.status.cancelled', color: '#5f6368'}
                    ],
                    isTranslate: true
                }
            ],
            actions: [
                {
                    type: 'view',
                    label: 'common.view',
                    icon: 'visibility',
                    tooltip: 'common.view',
                    handler: (item: Transaction) => this.onViewTransaction(item)
                } as ActionWithHandler
            ],
            showSequenceNumber: true,
            enablePagination: true,
            emptyMessage: 'common.noData'
        };
    }

    loadDefaultValues(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        if (this.isPartnerAdmin) {
            const partnerId = this.authService.getPartnerId();
            this.initialFilterValues = {
                dateRange: {
                    start: thirtyDaysAgo,
                    end: today
                },
                status: '',
                productId: undefined,
                keyword: '',
                partnerId: partnerId || undefined
            };
            this.initializeFilterConfig();
            this.loadTransactions();
            return;
        }

        if (this.isHubAdmin) {
            this.loadFirstPartner();
        } else {
            this.initialFilterValues = {
                dateRange: {
                    start: thirtyDaysAgo,
                    end: today
                },
                status: '',
                productId: undefined,
                keyword: '',
                partnerId: undefined
            };
            this.initializeFilterConfig();
            this.loadTransactions();
        }
    }

    loadFirstPartner(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.partnerApi.getPartnerPage({page: 0, size: 1}).subscribe({
            next: (response: any) => {
                const partners = response?.content || [];
                const firstPartner = partners.length > 0 ? partners[0] : null;

                this.initialFilterValues = {
                    dateRange: {
                        start: thirtyDaysAgo,
                        end: today
                    },
                    status: '',
                    productId: undefined,
                    keyword: '',
                    partnerId: firstPartner?.id || undefined
                };
                this.initializeFilterConfig();
                this.loadTransactions();
            },
            error: (error: any) => {
                console.error('Error loading first partner:', error);
                this.initialFilterValues = {
                    dateRange: {
                        start: thirtyDaysAgo,
                        end: today
                    },
                    status: '',
                    productId: undefined,
                    keyword: '',
                    partnerId: undefined
                };
                this.initializeFilterConfig();
                this.loadTransactions();
            }
        });
    }

    loadTransactions(): void {
        this.loading = true;

        const dateRange = this.initialFilterValues.dateRange;
        const fromDate = dateRange?.start ? this.formatDateForApi(dateRange.start) : null;
        const toDate = dateRange?.end ? this.formatDateForApi(dateRange.end) : null;

        const filterCriteria: TransactionFilterCriteria = {
            partnerId: this.initialFilterValues.partnerId || null,
            status: this.initialFilterValues.status === '' ? null : (this.initialFilterValues.status ? parseInt(this.initialFilterValues.status) : null),
            productId: this.initialFilterValues.productId || null,
            keyword: this.initialFilterValues.keyword || null,
            fromDate: fromDate,
            toDate: toDate
        };

        const payload: TransactionPagePayload = {
            requestId: generateUUID(),
            client: 'WEB',
            version: '1.0',
            ...filterCriteria,
            page: this.page - 1,
            size: this.size,
            sort: 'createdAt,desc'
        };

        this.api.getTransactionPage(payload)
            .pipe(finalize(() => this.loading = false))
            .subscribe({
                next: (response: any) => {
                    this.transactions = (response.content || []).map((transaction: Transaction, index: number) => ({
                        ...transaction,
                        amountStr: transaction.amount ? this.formatAmount(transaction.amount) : '-',
                        statusStr: this.getStatusKey(transaction.status),
                        date: transaction.createdAt ? this.formatDate(transaction.createdAt) : '-',
                        productName: transaction.product || transaction.productName || '-'
                    }));
                    this.total = response.totalElements || 0;
                    this.totalPages = response.totalPages || 1;
                },
                error: (error: any) => {
                    console.error('Error loading transactions:', error);
                    this.snack.open(
                        error?.error?.errorMessage || 'Error loading data',
                        'Close',
                        {
                            duration: 3000,
                            panelClass: ['error-snackbar', 'custom-snackbar'],
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        }
                    );
                }
            });
    }

    onApplyFilters(filters: any): void {
        this.initialFilterValues = {...filters};
        this.page = 1;
        this.loadTransactions();
    }

    onClearFilters(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        if (this.isPartnerAdmin) {
            const partnerId = this.authService.getPartnerId();
            this.initialFilterValues = {
                dateRange: {
                    start: thirtyDaysAgo,
                    end: today
                },
                status: '',
                productId: undefined,
                keyword: '',
                partnerId: partnerId || undefined
            };
        } else if (this.isHubAdmin) {
            this.initialFilterValues = {
                dateRange: {
                    start: thirtyDaysAgo,
                    end: today
                },
                status: '',
                productId: undefined,
                keyword: '',
                partnerId: this.initialFilterValues.partnerId
            };
        } else {
            this.initialFilterValues = {
                dateRange: {
                    start: thirtyDaysAgo,
                    end: today
                },
                status: '',
                productId: undefined,
                keyword: '',
                partnerId: undefined
            };
        }

        this.page = 1;
        this.loadTransactions();
    }

    onViewTransaction(transaction: Transaction): void {
        console.log('View transaction:', transaction);
        // TODO: Open transaction detail dialog
    }

    onPageChange(page: number): void {
        this.page = page;
        this.loadTransactions();
    }

    onPageSizeChange(size: number): void {
        this.size = size;
        this.page = 1;
        this.loadTransactions();
    }

    onCustomButtonClick(buttonKey: string): void {
        if (buttonKey === 'export') {
            this.onExport();
        }
    }

    onExport(): void {
        const dateRange = this.initialFilterValues.dateRange;
        const fromDate = dateRange?.start ? this.formatDateForApi(dateRange.start) : null;
        const toDate = dateRange?.end ? this.formatDateForApi(dateRange.end) : null;

        const filterCriteria: TransactionFilterCriteria = {
            partnerId: this.initialFilterValues.partnerId || null,
            status: this.initialFilterValues.status === '' ? null : (this.initialFilterValues.status ? parseInt(this.initialFilterValues.status) : null),
            productId: this.initialFilterValues.productId || null,
            keyword: this.initialFilterValues.keyword || null,
            fromDate: fromDate,
            toDate: toDate
        };

        const payload: TransactionPagePayload = {
            requestId: generateUUID(),
            client: 'WEB',
            version: '1.0',
            ...filterCriteria
        };

        this.api.exportTransactions(payload).subscribe({
            next: (blob: Blob) => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `transactions_${new Date().getTime()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                this.snack.open(
                    'Export successful',
                    'Close',
                    {
                        duration: 3000,
                        panelClass: ['success-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    }
                );
            },
            error: (error: any) => {
                console.error('Error exporting transactions:', error);
                this.snack.open(
                    error?.error?.errorMessage || 'Export failed',
                    'Close',
                    {
                        duration: 3000,
                        panelClass: ['error-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    }
                );
            }
        });
    }

    private formatAmount(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    private formatDateForApi(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private getStatusKey(status: number | string | undefined): string {
        if (status === undefined || status === null) return '';
        const statusNum = typeof status === 'string' ? parseInt(status) : status;

        switch (statusNum) {
            case 0:
                return 'system.transaction.status.pending';
            case 1:
                return 'system.transaction.status.success';
            case 2:
                return 'system.transaction.status.failed';
            case 3:
                return 'system.transaction.status.cancelled';
            default:
                return '';
        }
    }
}

