import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialog} from '@angular/material/dialog';
import {GenericTableComponent} from '../../../shared/components/generic-table/generic-table.component';
import {GenericFilterComponent} from '../../../shared/components/generic-filter/generic-filter.component';
import {FilterConfig} from '../../../shared/components/generic-filter/generic-filter.model';
import {ActionWithHandler, TableConfig} from '../../../shared/components/generic-table/generic-table.model';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {
    Reconciliation,
    ReconciliationFilterCriteria,
    ReconciliationPagePayload
} from '../../../models/reconciliation.model';
import {ApiReconciliationServices} from '../../../services/reconciliation.service';
import {ApiPartnerServices} from '../../../services/partner.service';
import {ApiAuthServices} from '../../../services/auth.service';
import {map} from 'rxjs/operators';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../../utils/shared/constants/pagination.constants';
import {generateUUID} from '../../../utils/uuid.util';
import {
    DataSourceFunction,
    SearchParams,
    SelectableItem
} from '../../../shared/components/generic-searchable-select/generic-searchable-select.model';
import {Observable} from 'rxjs';

@Component({
    selector: 'app-reconciliation-list',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        GenericFilterComponent,
        GenericTableComponent,
        TranslatePipe
    ],
    templateUrl: './reconciliation-list.component.html',
    styleUrl: './reconciliation-list.component.scss'
})
export class ReconciliationListComponent implements OnInit {

    // Role-based visibility
    isPartnerAdmin = false;
    isHubAdmin = false;
    showPartnerFilter = false;

    reconciliations: Reconciliation[] = [];
    total = 0;
    page = 1;
    size = DEFAULT_PAGE_SIZE;
    totalPages = 1;
    currentPage = 1;
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
    loading = false;
    isLoadingFilter = false;
    initialFilterValues: ReconciliationFilterCriteria = {};

    reconciliationFilterConfig!: FilterConfig;
    reconciliationTableConfig!: TableConfig;

    partnerDataSource!: DataSourceFunction;
    firstPartnerOption: SelectableItem | null = null;

    constructor(
        private api: ApiReconciliationServices,
        private partnerApi: ApiPartnerServices,
        private authService: ApiAuthServices,
        private snack: MatSnackBar,
        private dialog: MatDialog
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
        this.isPartnerAdmin = this.authService.isPartnerAdmin();
        this.isHubAdmin = this.authService.isHubAdmin();
        this.showPartnerFilter = this.isHubAdmin;

        this.loadDefaultValues();
        this.initializeTableConfig();
    }

    loadDefaultValues(): void {
        const today = new Date();

        if (this.isPartnerAdmin) {
            const partnerId = this.authService.getPartnerId();
            this.initialFilterValues = {
                date: today,
                partnerId: partnerId || undefined,
                keyword: ''
            };
            this.initializeFilterConfig();
            this.loadReconciliations();
            return;
        }

        // If hub_admin, load first partner
        if (this.isHubAdmin) {
            this.partnerApi.getPartnerPage({page: 0, size: 1}).subscribe({
                next: (response: any) => {
                    try {
                        const partners = response?.content || [];
                        const firstPartner = partners.length > 0 ? partners[0] : null;

                        if (firstPartner) {
                            this.firstPartnerOption = {
                                value: firstPartner.id?.toString() || firstPartner.partnerCode,
                                displayName: `${firstPartner.partnerCode} - ${firstPartner.partnerName}`,
                                partnerId: firstPartner.id,
                                partnerCode: firstPartner.partnerCode
                            };
                        }

                        this.initialFilterValues = {
                            date: today,
                            partnerId: firstPartner?.id || undefined,
                            keyword: ''
                        };
                        this.initializeFilterConfig();
                        this.loadReconciliations();
                    } catch (error) {
                        console.error('Error processing partner data:', error);
                        this.initialFilterValues = {
                            date: today,
                            keyword: ''
                        };
                        this.initializeFilterConfig();
                        this.loadReconciliations();
                    }
                },
                error: (err) => {
                    console.error('Error loading partners:', err);
                    this.initialFilterValues = {
                        date: today,
                        keyword: ''
                    };
                    this.initializeFilterConfig();
                    this.loadReconciliations();
                }
            });
        } else {
            this.initialFilterValues = {
                date: today,
                keyword: ''
            };
            this.initializeFilterConfig();
            this.loadReconciliations();
        }
    }

    initializeFilterConfig(): void {
        const fields: any[] = [
            {
                type: 'date',
                key: 'date',
                label: 'system.reconciliation.date',
                class: 'col-md-3',
                placeholder: 'system.reconciliation.date',
                icon: 'calendar_today'
            }
        ];

        // Only add partner filter for hub_admin
        if (this.showPartnerFilter) {
            fields.push({
                type: 'select-searchable',
                key: 'partnerId',
                label: 'system.reconciliation.partner',
                class: 'col-md-3',
                placeholder: 'system.reconciliation.selectPartner',
                options: this.firstPartnerOption ? [this.firstPartnerOption] : [],
                searchableConfig: {
                    dataSource: this.partnerDataSource,
                    config: {
                        placeholder: 'system.reconciliation.selectPartner',
                        searchPlaceholder: 'system.reconciliation.searchPartner',
                        noResultsMessage: 'common.noData',
                        loadingMessage: 'common.loading',
                        pageSize: 20,
                        debounceTime: 500,
                    }
                }
            });
        }

        const buttonClass = this.isHubAdmin ? 'col-md-12' : 'col-md-9';

        this.reconciliationFilterConfig = {
            fields: fields,
            showApplyButton: true,
            showClearButton: true,
            applyButtonText: 'common.apply',
            clearButtonText: 'common.clear',
            applyButtonIcon: 'filter_list',
            classButton: buttonClass
        };
    }

    initializeTableConfig(): void {
        this.reconciliationTableConfig = {
            columns: [
                {key: 'partnerCode', header: 'system.reconciliation.partner', align: 'center'},
                {key: 'filename', header: 'system.reconciliation.filename', align: 'left'},
                {key: 'date', header: 'system.reconciliation.date', align: 'center'},
                {key: 'transCount', header: 'system.reconciliation.transCount', align: 'center'},
                {key: 'totalAmountStr', header: 'system.reconciliation.totalAmount', align: 'right'},
                {
                    key: 'statusStr',
                    header: 'system.reconciliation.status_header',
                    align: 'center',
                    template: 'pill',
                    customColor: [
                        {code: 'system.reconciliation.status.done', color: '#137333'},
                        {code: 'system.reconciliation.status.processing', color: '#fbbc04'},
                        {code: 'system.reconciliation.status.failed', color: '#d41900'}
                    ],
                    isTranslate: true
                },
                {key: 'result', header: 'system.reconciliation.result', align: 'center'}
            ],
            actions: [
                {
                    type: 'view',
                    label: 'common.view',
                    icon: 'visibility',
                    color: '#000',
                    tooltip: 'common.view',
                    handler: (item: Reconciliation) => this.onView(item)
                } as ActionWithHandler,
                {
                    type: 'refresh',
                    label: 'common.refresh',
                    icon: 'refresh',
                    color: 'green',
                    tooltip: 'common.refresh',
                    handler: (item: Reconciliation) => this.onReprocess(item)
                } as ActionWithHandler,
                {
                    type: 'download',
                    label: 'common.download',
                    icon: 'download',
                    color: '#FF9800',
                    tooltip: 'common.download',
                    handler: (item: Reconciliation) => this.onDownload(item)
                } as ActionWithHandler,
            ],
            showSequenceNumber: true,
            enablePagination: true,
            emptyMessage: 'common.noData'
        };
    }

    onApplyFilters(filters: ReconciliationFilterCriteria): void {
        this.initialFilterValues = {...filters};
        this.page = 1;
        this.loadReconciliations();
    }

    onClearFilters(): void {
        this.loadDefaultValues();
    }

    loadReconciliations(): void {
        this.loading = true;
        const date = this.initialFilterValues.date;
        const dateStr = date ? this.formatDateForApi(date) : null;

        const payload: ReconciliationPagePayload = {
            requestId: generateUUID(),
            client: 'WEB',
            version: '1.0',
            partnerId: this.initialFilterValues.partnerId || null,
            date: dateStr,
            keyword: this.initialFilterValues.keyword || null,
            page: this.page - 1,
            size: this.size,
            sort: 'date,desc'
        };

        this.isLoadingFilter = true;
        // TODO: Replace with actual API call when backend is ready
        // this.api.getReconciliationPage(payload)
        //   .pipe(
        //     finalize(() => {
        //       this.loading = false;
        //       this.isLoadingFilter = false;
        //     })
        //   )
        //   .subscribe({...})

        // Mock data - Remove when API is ready
        setTimeout(() => {
            const rawMockData = [
                {
                    id: '1',
                    partnerCode: 'P1585',
                    filename: 'reconciliation_2024121313.csv',
                    date: new Date('2024-12-13T13:00:00'),
                    transCount: 187,
                    totalAmount: 2262147.00,
                    status: 1,
                    passedCount: 186,
                    failCount: 1,
                    missedCount: 0
                },
                {
                    id: '2',
                    partnerCode: 'P1939',
                    filename: 'reconciliation_2024122823.csv',
                    date: new Date('2024-12-28T23:00:00'),
                    transCount: 199,
                    totalAmount: 2423113.00,
                    status: 1,
                    passedCount: 199,
                    failCount: 0,
                    missedCount: 0
                },
                {
                    id: '3',
                    partnerCode: 'P3963',
                    filename: 'reconciliation_2024122901.csv',
                    date: new Date('2024-12-29T01:00:00'),
                    transCount: 213,
                    totalAmount: 2587456.00,
                    status: 1,
                    passedCount: 212,
                    failCount: 1,
                    missedCount: 0
                },
                {
                    id: '4',
                    partnerCode: 'P1585',
                    filename: 'reconciliation_2024123005.csv',
                    date: new Date('2024-12-30T05:00:00'),
                    transCount: 165,
                    totalAmount: 1987654.00,
                    status: 1,
                    passedCount: 165,
                    failCount: 0,
                    missedCount: 0
                },
                {
                    id: '5',
                    partnerCode: 'P1939',
                    filename: 'reconciliation_2024123012.csv',
                    date: new Date('2024-12-30T12:00:00'),
                    transCount: 178,
                    totalAmount: 2154321.00,
                    status: 1,
                    passedCount: 177,
                    failCount: 1,
                    missedCount: 0
                },
                {
                    id: '6',
                    partnerCode: 'P3963',
                    filename: 'reconciliation_2025010108.csv',
                    date: new Date('2025-01-01T08:00:00'),
                    transCount: 201,
                    totalAmount: 2456789.00,
                    status: 1,
                    passedCount: 200,
                    failCount: 1,
                    missedCount: 0
                },
                {
                    id: '7',
                    partnerCode: 'P1585',
                    filename: 'reconciliation_2025010115.csv',
                    date: new Date('2025-01-01T15:00:00'),
                    transCount: 192,
                    totalAmount: 2345678.00,
                    status: 1,
                    passedCount: 192,
                    failCount: 0,
                    missedCount: 0
                },
                {
                    id: '8',
                    partnerCode: 'P1939',
                    filename: 'reconciliation_2025010120.csv',
                    date: new Date('2025-01-01T20:00:00'),
                    transCount: 156,
                    totalAmount: 1897654.00,
                    status: 1,
                    passedCount: 155,
                    failCount: 1,
                    missedCount: 0
                },
                {
                    id: '9',
                    partnerCode: 'P3963',
                    filename: 'reconciliation_2025010203.csv',
                    date: new Date('2025-01-02T03:00:00'),
                    transCount: 189,
                    totalAmount: 2298765.00,
                    status: 1,
                    passedCount: 188,
                    failCount: 1,
                    missedCount: 0
                },
                {
                    id: '10',
                    partnerCode: 'P1585',
                    filename: 'reconciliation_2025010210.csv',
                    date: new Date('2025-01-02T10:00:00'),
                    transCount: 174,
                    totalAmount: 2123456.00,
                    status: 1,
                    passedCount: 174,
                    failCount: 0,
                    missedCount: 0
                }
            ];

            const mockData: Reconciliation[] = rawMockData.map((item) => {
                const dateStr = item.date.toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                }).replace(',', '');

                return {
                    ...item,
                    date: dateStr,
                    totalAmountStr: `${item.totalAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })} KS`,
                    statusStr: 'system.reconciliation.status.done',
                    result: `Passed: ${item.passedCount}, Fail: ${item.failCount}, Missed: ${item.missedCount}`
                };
            });

            // Apply pagination to mock data
            const startIndex = (this.page - 1) * this.size;
            const endIndex = startIndex + this.size;
            this.reconciliations = mockData.slice(startIndex, endIndex);
            this.total = mockData.length;
            this.totalPages = Math.ceil(mockData.length / this.size);
            this.currentPage = this.page;

            this.loading = false;
            this.isLoadingFilter = false;
        }, 500);
    }

    onPageChange(p: number): void {
        if (p < 1) return;
        this.page = p;
        this.loadReconciliations();
    }

    onPageSizeChange(s: number): void {
        this.size = s;
        this.page = 1;
        this.loadReconciliations();
    }

    formatDateForApi(date: Date | string): string {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    }

    onDownload(item: Reconciliation): void {
        if (!item.id) return;

        // TODO: Replace with actual API call when backend is ready
        // this.api.downloadReconciliationFile(item.id).subscribe({
        //   next: (blob: Blob) => {
        //     const url = window.URL.createObjectURL(blob);
        //     const a = document.createElement('a');
        //     a.href = url;
        //     a.download = item.filename || 'reconciliation.csv';
        //     a.click();
        //     window.URL.revokeObjectURL(url);
        //   },
        //   error: (err) => {
        //     this.snack.open('Download failed', '', {
        //       duration: 2000,
        //       panelClass: ['error-snackbar']
        //     });
        //   }
        // });

        this.snack.open('Download functionality will be available when API is ready', '', {
            duration: 2000,
            panelClass: ['info-snackbar']
        });
    }

    onView(item: Reconciliation): void {
        // TODO: Open detail dialog when ready
        this.snack.open('View detail functionality will be available when API is ready', '', {
            duration: 2000,
            panelClass: ['info-snackbar']
        });
    }

    onReprocess(item: Reconciliation): void {
        if (!item.id) return;

        // TODO: Replace with actual API call when backend is ready
        // this.api.reprocessReconciliation(item.id).subscribe({
        //   next: () => {
        //     this.snack.open('Reconciliation reprocessed successfully', '', {
        //       duration: 2000,
        //       panelClass: ['success-snackbar']
        //     });
        //     this.loadReconciliations();
        //   },
        //   error: (err) => {
        //     this.snack.open('Reprocess failed', '', {
        //       duration: 2000,
        //       panelClass: ['error-snackbar']
        //     });
        //   }
        // });

        this.snack.open('Reprocess functionality will be available when API is ready', '', {
            duration: 2000,
            panelClass: ['info-snackbar']
        });
    }
}

