import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {GenericTableComponent} from '../../../shared/components/generic-table/generic-table.component';
import {GenericFilterComponent} from '../../../shared/components/generic-filter/generic-filter.component';
import {FilterConfig} from '../../../shared/components/generic-filter/generic-filter.model';
import {TableConfig} from '../../../shared/components/generic-table/generic-table.model';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {Balance, BalanceFilterCriteria, BalanceSummary} from '../../../models/balance.model';
import {ApiBalanceServices} from '../../../services/balance.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE_OPTIONS} from '../../../utils/shared/constants/pagination.constants';

@Component({
    selector: 'app-balance-list',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        GenericFilterComponent,
        GenericTableComponent,
        TranslatePipe
    ],
    templateUrl: './balance-list.component.html',
    styleUrl: './balance-list.component.scss'
})
export class BalanceListComponent implements OnInit {

    balances: Balance[] = [];
    total = 0;
    page = 1;
    size = DEFAULT_PAGE_SIZE;
    totalPages = 1;
    currentPage = 1;
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS;
    loading = false;
    isLoadingFilter = false;
    initialFilterValues: BalanceFilterCriteria = {};

    balanceSummary: BalanceSummary = {
        totalDeposit: 0,
        totalConsumption: 0,
        totalWithdraw: 0,
        totalRefund: 0,
        overallBalanceChange: 0
    };

    balanceFilterConfig!: FilterConfig;
    balanceTableConfig!: TableConfig;

    constructor(
        private api: ApiBalanceServices,
        private snack: MatSnackBar
    ) {
    }

    ngOnInit() {
        this.loadDefaultValues();
        this.initializeTableConfig();
    }

    loadDefaultValues(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.initialFilterValues = {
            dateRange: {
                start: thirtyDaysAgo,
                end: today
            },
            keyword: ''
        };
        this.initializeFilterConfig();
        this.loadBalances();
        this.loadSummary();
    }

    initializeFilterConfig(): void {
        const fields: any[] = [
            {
                type: 'dateRange',
                key: 'dateRange',
                label: 'balance.dateRange',
                class: 'col-md-6',
                placeholder: 'balance.dateRange',
                icon: 'calendar_today'
            },
            {
                type: 'text',
                key: 'keyword',
                label: 'system.balance.search',
                class: 'col-md-6',
                placeholder: 'system.balance.searchPlaceholder',
                icon: 'search'
            }
        ];

        this.balanceFilterConfig = {
            fields: fields,
            showApplyButton: true,
            showClearButton: true,
            applyButtonText: 'common.apply',
            clearButtonText: 'common.clear',
            applyButtonIcon: 'filter_list',
            classButton: 'col-md-12'
        };
    }

    initializeTableConfig(): void {
        this.balanceTableConfig = {
            columns: [
                {key: 'date', header: 'system.balance.date', align: 'center'},
                {key: 'openBalanceStr', header: 'system.balance.openBalance', align: 'right'},
                {
                    key: 'depositStr',
                    header: 'system.balance.deposit',
                    align: 'right',
                    cellClass: 'positive-amount',
                    customValue: (item: Balance) => item.depositStr
                },
                {
                    key: 'withdrawStr',
                    header: 'system.balance.withdraw',
                    align: 'right',
                    cellClass: 'negative-amount',
                    customValue: (item: Balance) => item.withdrawStr
                },
                {
                    key: 'consumptionStr',
                    header: 'system.balance.consumption',
                    align: 'right',
                    cellClass: 'negative-amount',
                    customValue: (item: Balance) => item.consumptionStr
                },
                {
                    key: 'refundStr',
                    header: 'system.balance.refund',
                    align: 'right',
                    cellClass: 'positive-amount',
                    customValue: (item: Balance) => item.refundStr
                },
                {key: 'closeBalanceStr', header: 'system.balance.closeBalance', align: 'right'}
            ],
            showSequenceNumber: true,
            enablePagination: true,
            emptyMessage: 'common.noData',
            rowClass: (item: Balance) => this.getRowClass(item)
        };
    }

    onApplyFilters(filters: BalanceFilterCriteria): void {
        this.initialFilterValues = {...filters};
        this.page = 1;
        this.loadBalances();
        this.loadSummary();
    }

    onClearFilters(): void {
        this.loadDefaultValues();
    }

    loadBalances(): void {
        this.loading = true;
        this.isLoadingFilter = true;

        // TODO: Replace with actual API call when backend is ready
        // const dateRange = this.initialFilterValues.dateRange;
        // const fromDate = dateRange?.start ? this.formatDateForApi(dateRange.start) : null;
        // const toDate = dateRange?.end ? this.formatDateForApi(dateRange.end) : null;
        // const payload: BalancePagePayload = {
        //   requestId: generateUUID(),
        //   client: 'WEB',
        //   version: '1.0',
        //   fromDate: fromDate,
        //   toDate: toDate,
        //   keyword: this.initialFilterValues.keyword || null,
        //   page: this.page - 1,
        //   size: this.size,
        //   sort: 'date,desc'
        // };
        // this.api.getBalancePage(payload).pipe(...)

        // Mock data - Remove when API is ready
        setTimeout(() => {
            // Mock data với format đúng và test conditional formatting
            const rawMockData = [
                {
                    date: new Date('2025-12-08'),
                    openBalance: 1000000,
                    deposit: 22667.10,
                    withdraw: 720.94,
                    consumption: 446126.48,
                    refund: 748.25,
                    closeBalance: 576567.93
                },
                {
                    date: new Date('2025-12-07'),
                    openBalance: 576567.93,
                    deposit: 17613.19,
                    withdraw: 3125.53,
                    consumption: 431014.00,
                    refund: 1772.45,
                    closeBalance: 161814.04
                },
                {
                    date: new Date('2025-12-06'),
                    openBalance: 161814.04,
                    deposit: 15000.00,
                    withdraw: 500.00,
                    consumption: 11825.10,
                    refund: 500.00,
                    closeBalance: 164988.94
                },
                {
                    date: new Date('2025-12-05'),
                    openBalance: 164988.94,
                    deposit: 12000.00,
                    withdraw: 800.00,
                    consumption: 8500.00,
                    refund: 300.00,
                    closeBalance: 167988.94
                },
                {
                    date: new Date('2025-12-04'),
                    openBalance: 167988.94,
                    deposit: 10000.00,
                    withdraw: 1200.00,
                    consumption: 25000.00,
                    refund: 200.00,
                    closeBalance: 151988.94
                },
                {
                    date: new Date('2025-12-03'),
                    openBalance: 151988.94,
                    deposit: 8000.00,
                    withdraw: 600.00,
                    consumption: 15000.00,
                    refund: 150.00,
                    closeBalance: 144538.94
                },
                {
                    date: new Date('2025-12-02'),
                    openBalance: 144538.94,
                    deposit: 5000.00,
                    withdraw: 400.00,
                    consumption: 12000.00,
                    refund: 100.00,
                    closeBalance: 137238.94
                },
                {
                    date: new Date('2025-12-01'),
                    openBalance: 137238.94,
                    deposit: 3000.00,
                    withdraw: 300.00,
                    consumption: 10000.00,
                    refund: 50.00,
                    closeBalance: 129988.94
                },
                {
                    date: new Date('2025-11-30'),
                    openBalance: 129988.94,
                    deposit: 2000.00,
                    withdraw: 200.00,
                    consumption: 8000.00,
                    refund: 30.00,
                    closeBalance: 123818.94
                },
                {
                    date: new Date('2025-11-29'),
                    openBalance: 123818.94,
                    deposit: 1000.00,
                    withdraw: 100.00,
                    consumption: 5000.00,
                    refund: 20.00,
                    closeBalance: 119738.94
                },
                // Thêm một số hàng có balance thấp để test highlight
                {
                    date: new Date('2025-11-28'),
                    openBalance: 119738.94,
                    deposit: 500.00,
                    withdraw: 50.00,
                    consumption: 100000.00,
                    refund: 10.00,
                    closeBalance: 20198.94
                },
                {
                    date: new Date('2025-11-27'),
                    openBalance: 20198.94,
                    deposit: 300.00,
                    withdraw: 30.00,
                    consumption: 5000.00,
                    refund: 5.00,
                    closeBalance: 15473.94
                }
            ];

            const mockData: Balance[] = rawMockData.map((item, index) => ({
                id: `${index + 1}`,
                date: item.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric'
                }),
                openBalance: item.openBalance,
                deposit: item.deposit,
                withdraw: item.withdraw,
                consumption: item.consumption,
                refund: item.refund,
                closeBalance: item.closeBalance,
                openBalanceStr: `${item.openBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} KS`,
                depositStr: `${item.deposit.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} KS`,
                withdrawStr: `${item.withdraw.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} KS`,
                consumptionStr: `${item.consumption.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} KS`,
                refundStr: `${item.refund.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} KS`,
                closeBalanceStr: `${item.closeBalance.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })} KS`
            }));

            // Apply pagination to mock data
            const startIndex = (this.page - 1) * this.size;
            const endIndex = startIndex + this.size;
            this.balances = mockData.slice(startIndex, endIndex);
            this.total = mockData.length;
            this.totalPages = Math.ceil(mockData.length / this.size);
            this.currentPage = this.page;

            this.loading = false;
            this.isLoadingFilter = false;
        }, 500);
    }

    loadSummary(): void {
        // TODO: Replace with actual API call when backend is ready
        // const dateRange = this.initialFilterValues.dateRange;
        // const fromDate = dateRange?.start ? this.formatDateForApi(dateRange.start) : null;
        // const toDate = dateRange?.end ? this.formatDateForApi(dateRange.end) : null;
        // const payload: BalancePagePayload = {
        //   requestId: generateUUID(),
        //   client: 'WEB',
        //   version: '1.0',
        //   fromDate: fromDate,
        //   toDate: toDate,
        //   keyword: this.initialFilterValues.keyword || null,
        //   page: 0,
        //   size: 1000,
        //   sort: 'date,desc'
        // };
        // this.api.getBalanceSummary(payload).subscribe(...)

        // Mock summary data - Remove when API is ready
        // Tính toán từ mock data (tổng hợp từ tất cả các records)
        this.balanceSummary = {
            totalDeposit: 172028.29,
            totalConsumption: 1127586.58,
            totalWithdraw: 25385.47,
            totalRefund: 5893.00,
            overallBalanceChange: -981098.06, // 18901.94 - 1000000
            startBalance: 1000000.00,
            endBalance: 18901.94
        };
    }

    onPageChange(p: number): void {
        if (p < 1) return;
        this.page = p;
        this.loadBalances();
    }

    onPageSizeChange(s: number): void {
        this.size = s;
        this.page = 1;
        this.loadBalances();
    }

    formatDateForApi(date: Date | string): string {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
    }

    getRowClass(balance: Balance): string {
        const classes: string[] = [];

        // Highlight balance thấp
        if (balance.closeBalance && balance.closeBalance < 50000) {
            classes.push('low-balance-warning');
        }

        // Bold consumption cao
        if (balance.consumption && balance.consumption > 100000) {
            classes.push('high-consumption');
        }

        return classes.join(' ');
    }

    getCellClass(columnKey: string): string {
        const classMap: { [key: string]: string } = {
            'depositStr': 'positive-amount',
            'refundStr': 'positive-amount',
            'withdrawStr': 'negative-amount',
            'consumptionStr': 'negative-amount'
        };
        return classMap[columnKey] || '';
    }
}

