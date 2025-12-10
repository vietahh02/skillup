import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {
    ApexAnnotations,
    ApexAxisChartSeries,
    ApexChart,
    ApexDataLabels,
    ApexFill,
    ApexLegend,
    ApexMarkers,
    ApexNonAxisChartSeries,
    ApexStroke,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from 'ng-apexcharts';
import {ApiDashboardV2Services} from '../../services/dashboard-v2.service';
import {RevenueData, WalletBalance} from '../../models/dashboard-v2.model';
import {generateUUID} from '../../utils/uuid.util';
import {TranslatePipe} from '../../utils/translate.pipe';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels?: ApexDataLabels;
    stroke?: ApexStroke;
    xaxis?: ApexXAxis;
    yaxis?: ApexYAxis;
    legend?: ApexLegend;
    fill?: ApexFill;
    tooltip?: ApexTooltip;
    colors?: string[];
    markers?: ApexMarkers;
    annotations?: ApexAnnotations;
};

export type DonutOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels?: string[];
    dataLabels?: ApexDataLabels;
    legend?: ApexLegend;
    colors?: string[];
    stroke?: ApexStroke;
    tooltip?: ApexTooltip;
    plotOptions?: any;
};


@Component({
    selector: 'app-dashboard-v2',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatIconModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        NgApexchartsModule,
        TranslatePipe
    ],
    templateUrl: './dashboard-v2.component.html',
    styleUrl: './dashboard-v2.component.scss'
})
export class DashboardV2Component implements OnInit {
    revenueChartOptions: Partial<ChartOptions> = {};
    mainPieOptions: Partial<DonutOptions> = {};
    detailPieOptions: Partial<DonutOptions> = {};
    isDetailPie = false;
    selectedSliceLabel = '';
    selectedSliceValue = 0;
    currentDetailLabels: string[] = [];
    currentDetailValues: number[] = [];

    mainPieData = {
        labels: ['Staff A', 'Staff B', 'Staff C', 'Staff D'],
        values: [45000, 32000, 28000, 20000],
        colors: ['#1e88e5', '#ab47bc', '#26a69a', '#8bc34a']
    };

    detailPieDataMap: Record<string, { labels: string[]; values: number[]; colors: string[] }> = {
        'Staff A': {
            labels: ['Agent 1', 'Agent 2', 'Agent 3'],
            values: [20000, 15000, 10000],
            colors: ['#1e88e5', '#3949ab', '#00acc1']
        },
        'Staff B': {
            labels: ['Agent 1', 'Agent 2', 'Agent 3'],
            values: [12000, 11000, 9000],
            colors: ['#ba68c8', '#8e24aa', '#d81b60']
        },
        'Staff C': {
            labels: ['Agent 1', 'Agent 2', 'Agent 3'],
            values: [10000, 9000, 9000],
            colors: ['#26a69a', '#009688', '#00897b']
        },
        'Staff D': {
            labels: ['Agent 1', 'Agent 2', 'Agent 3'],
            values: [8000, 7000, 5000],
            colors: ['#8bc34a', '#7cb342', '#558b2f']
        }
    };
    walletBalance: WalletBalance = {
        currentBalance: 0,
        pendingRequests: [],
        totalPendingAmount: 0,
        status: 'normal'
    };

    filterType: 'day' | 'week' | 'month' = 'day';
    loading = false;

    constructor(private api: ApiDashboardV2Services) {
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loadRevenueChart();
        this.loadWalletBalance();
        this.loadMainPie();
    }

    onFilterChange(): void {
        this.loadRevenueChart();
    }

    loadRevenueChart(): void {
        this.loading = true;
        const payload = {
            requestId: generateUUID(),
            client: 'WEB',
            version: '1.0',
            filterType: this.filterType
        };

        // TODO: Replace with actual API call
        // this.api.getRevenueData(payload).subscribe({
        //   next: (response) => {
        //     const revenueData = response.result || [];
        //     this.initRevenueChart(revenueData);
        //     this.loading = false;
        //   },
        //   error: (err) => {
        //     console.error('Error loading revenue data:', err);
        //     this.loading = false;
        //   }
        // });

        // Mock data
        const mockData: RevenueData[] = this.generateMockRevenueData();
        setTimeout(() => {
            this.initRevenueChart(mockData);
            this.loading = false;
        }, 500);
    }

    generateMockRevenueData(): RevenueData[] {
        const data: RevenueData[] = [];
        const today = new Date();
        const days = this.filterType === 'day' ? 7 : this.filterType === 'week' ? 4 : 12;

        const fixedActualAmounts = [435698, 485000, 570000, 365000, 405000, 495000, 535000];
        const fixedExpectedAmount = 435698.90;

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            if (this.filterType === 'day') {
                date.setDate(date.getDate() - i);
            } else if (this.filterType === 'week') {
                date.setDate(date.getDate() - (i * 7));
            } else {
                date.setMonth(date.getMonth() - i);
            }

            // Use fixed data, cycle through if more days than data
            const actualAmount = fixedActualAmounts[i % fixedActualAmounts.length] || 300000;
            const expectedAmount = fixedExpectedAmount;

            data.push({
                date: date.toISOString().split('T')[0],
                actualAmount,
                expectedAmount
            });
        }

        return data;
    }

    initRevenueChart(data: RevenueData[]): void {
        const dates = data.map(d => {
            const date = new Date(d.date);
            if (this.filterType === 'day') {
                return date.toLocaleDateString('en-GB', {day: '2-digit', month: 'short'});
            } else if (this.filterType === 'week') {
                return `Week ${Math.ceil(date.getDate() / 7)}`;
            } else {
                return date.toLocaleDateString('en-GB', {month: 'short', year: 'numeric'});
            }
        });

        const actualSeries = data.map(d => d.actualAmount);

        const today = new Date().toISOString().split('T')[0];
        const todayIndex = data.findIndex(d => d.date === today);
        const todayExpected = todayIndex >= 0 ? data[todayIndex].expectedAmount : null;
        const lastIndex = data.length - 1;
        const lastExpected = data[lastIndex]?.expectedAmount || null;

        const expectedValue = todayExpected !== null ? todayExpected : lastExpected;
        const expectedIndex = todayIndex >= 0 ? todayIndex : lastIndex;

        this.revenueChartOptions = {
            series: [
                {
                    name: 'Actual Revenue',
                    data: actualSeries,
                    type: 'area'
                }
            ],
            chart: {
                type: 'area',
                height: 400,
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },
            stroke: {
                curve: 'smooth',
                width: 3,
                colors: ['#2196F3']
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.3,
                    opacityTo: 0.1,
                    stops: [0, 100],
                    colorStops: [
                        {
                            offset: 0,
                            color: '#2196F3',
                            opacity: 0.3
                        },
                        {
                            offset: 100,
                            color: '#2196F3',
                            opacity: 0.1
                        }
                    ]
                }
            },
            colors: ['#2196F3'],
            xaxis: {
                categories: dates,
                labels: {
                    style: {
                        colors: '#666',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: (val: number) => {
                        return `${(val / 1000).toFixed(0)}K KS`;
                    },
                    style: {
                        colors: '#666',
                        fontSize: '12px'
                    }
                }
            },
            legend: {
                show: false
            },
            tooltip: {
                y: {
                    formatter: (val: number) => {
                        return `${val.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} KS`;
                    }
                }
            },
            markers: {
                size: 5,
                colors: ['#2196F3'],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                    size: 7
                }
            },
            annotations: expectedValue !== null ? {
                yaxis: [{
                    y: expectedValue,
                    strokeDashArray: 5,
                    borderColor: '#FFC107',
                    borderWidth: 2,
                    opacity: 0.8,
                    label: {
                        borderColor: '#FFC107',
                        style: {
                            color: '#333',
                            background: '#FFC107',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            padding: {
                                left: 12,
                                right: 12,
                                top: 1,
                                bottom: 1
                            }
                        },
                        text: ` ${expectedValue.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })} KS`,
                        offsetX: -30,
                        offsetY: 0
                    }
                }]
            } : undefined,
            dataLabels: {
                enabled: false
            }
        };
    }

    loadWalletBalance(): void {
        this.loading = true;
        // TODO: Replace with actual API call
        // this.api.getWalletBalance().subscribe({
        //   next: (balance) => {
        //     this.walletBalance = this.calculateWalletStatus(balance);
        //     this.loading = false;
        //   },
        //   error: (err) => {
        //     console.error('Error loading wallet balance:', err);
        //     this.loading = false;
        //   }
        // });

        // Mock data - Test với trường hợp thiếu tiền
        const mockBalance: WalletBalance = {
            currentBalance: 900000,
            pendingRequests: [
                {
                    id: '1',
                    orderId: 'PO-001',
                    amount: 500000,
                    requestType: 'WITHDRAW',
                    createdAt: '2025-01-02T10:00:00',
                    status: 'PENDING'
                },
                {
                    id: '2',
                    orderId: 'PO-002',
                    amount: 300000,
                    requestType: 'WITHDRAW',
                    createdAt: '2025-01-02T11:00:00',
                    status: 'PENDING'
                },
                {
                    id: '3',
                    orderId: 'PO-003',
                    amount: 200000,
                    requestType: 'WITHDRAW',
                    createdAt: '2025-01-02T12:00:00',
                    status: 'PENDING'
                }
            ],
            totalPendingAmount: 0,
            status: 'normal'
        };

        mockBalance.totalPendingAmount = mockBalance.pendingRequests
            .filter(r => r.requestType === 'WITHDRAW')
            .reduce((sum, r) => sum + r.amount, 0);

        setTimeout(() => {
            this.walletBalance = this.calculateWalletStatus(mockBalance);
            this.loading = false;
        }, 500);
    }

    calculateWalletStatus(balance: WalletBalance): WalletBalance {
        const withdrawPending = balance.pendingRequests
            .filter(r => r.requestType === 'WITHDRAW')
            .reduce((sum, r) => sum + r.amount, 0);

        const remaining = balance.currentBalance - withdrawPending;

        if (remaining < 0) {
            balance.status = 'danger';
            balance.requiredTopUp = Math.abs(remaining);
        } else if (remaining < balance.currentBalance * 0.2) {
            balance.status = 'warning';
        } else {
            balance.status = 'normal';
        }

        balance.totalPendingAmount = withdrawPending;
        return balance;
    }

    formatCurrency(amount: number): string {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    loadMainPie(): void {
        this.buildMainPieOptions();
        this.buildDetailPieOptions(this.mainPieData.labels[0]);
    }

    onPieSelect(index: number): void {
        if (index === undefined || index === null || index < 0) {
            return;
        }
        const label = this.mainPieData.labels[index];
        this.selectedSliceLabel = label;
        this.selectedSliceValue = this.mainPieData.values[index];
        this.buildDetailPieOptions(label);
        this.isDetailPie = true;
    }

    onBackPie(): void {
        this.isDetailPie = false;
    }

    private buildMainPieOptions(): void {
        this.mainPieOptions = {
            series: [...this.mainPieData.values],
            labels: [...this.mainPieData.labels],
            chart: {
                type: 'donut',
                height: 360,
                events: {
                    dataPointSelection: (_event, _chart, opts) => this.onPieSelect(opts?.dataPointIndex)
                }
            },
            plotOptions: {
                pie: {
                    expandOnClick: true,
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Total Revenue',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#666',
                                formatter: () => {
                                    return `${this.mainTotal.toLocaleString('en-US')} USD`;
                                }
                            }
                        }
                    }
                }
            },
            legend: {
                show: false
            },
            dataLabels: {
                enabled: false
            },
            colors: [...this.mainPieData.colors],
            tooltip: {
                y: {
                    formatter: (val: number) => `${val.toLocaleString('en-US')} USD`
                }
            },
            stroke: {
                width: 2,
                colors: ['#fff']
            }
        };
    }

    private buildDetailPieOptions(label: string): void {
        const detail = this.detailPieDataMap[label];
        if (!detail) {
            return;
        }
        this.currentDetailLabels = [...detail.labels];
        this.currentDetailValues = [...detail.values];
        const detailTotal = this.currentDetailValues.reduce((a, b) => a + b, 0);
        this.detailPieOptions = {
            series: [...detail.values],
            labels: [...detail.labels],
            chart: {
                type: 'donut',
                height: 300
            },
            plotOptions: {
                pie: {
                    expandOnClick: true,
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            total: {
                                show: true,
                                showAlways: true,
                                label: 'Total Revenue',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#666',
                                formatter: () => {
                                    return `${detailTotal.toLocaleString('en-US')} USD`;
                                }
                            }
                        }
                    }
                }
            },
            legend: {
                show: false
            },
            dataLabels: {
                enabled: false
            },
            colors: [...detail.colors],
            tooltip: {
                y: {
                    formatter: (val: number) => `${val.toLocaleString('en-US')} USD`
                }
            },
            stroke: {
                width: 2,
                colors: ['#fff']
            }
        };
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    get mainTotal(): number {
        return this.mainPieData.values.reduce((a, b) => a + b, 0);
    }

    get detailTotal(): number {
        return this.currentDetailValues.reduce((a, b) => a + b, 0);
    }
}

