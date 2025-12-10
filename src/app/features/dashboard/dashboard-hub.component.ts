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
    ApexStroke,
    ApexTooltip,
    ApexXAxis,
    ApexYAxis,
    NgApexchartsModule
} from 'ng-apexcharts';
import {ApiDashboardHubServices} from '../../services/dashboard-hub.service';
import {DashboardSummary, InventoryItem, ProfitData} from '../../models/dashboard-hub.model';
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

@Component({
    selector: 'app-dashboard-hub',
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
    templateUrl: './dashboard-hub.component.html',
    styleUrl: './dashboard-hub.component.scss'
})
export class DashboardHubComponent implements OnInit {
    summary: DashboardSummary = {
        totalProfit: 0,
        totalProfitChange: 0,
        totalProfitChangePercent: 0,
        activeProducts: 0,
        lowStockCount: 0
    };

    profitChartOptions: Partial<ChartOptions> = {};
    inventoryItems: InventoryItem[] = [];
    filterDays: number = 7;
    loading = false;

    constructor(private api: ApiDashboardHubServices) {
    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData(): void {
        this.loading = true;
        // TODO: Replace with actual API call

        // Mock data
        setTimeout(() => {
            this.loadMockData();
            this.loading = false;
        }, 500);
    }

    loadMockData(): void {
        this.summary = {
            totalProfit: 450000,
            totalProfitChange: 18.2,
            totalProfitChangePercent: 18.2,
            activeProducts: 24,
            lowStockCount: 3
        };

        const fixedExpectedEarnings = 3500;
        const today = new Date();
        const mockProfitData: ProfitData[] = [];

        const earningsData = [1500, 2500, 6200, 4800, 1200, 2800, 3500];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            mockProfitData.push({
                date: dateStr,
                earnings: earningsData[6 - i] || 2000,
                expectedEarnings: fixedExpectedEarnings
            });
        }

        this.inventoryItems = [
            {
                id: '1',
                sku: 'PROD-001',
                name: 'Mobile Topup Cards',
                currentStock: 200000000,
                maxStock: 1000000000,
                dailySales: 100000000,
                daysRemaining: 2,
                stockPercent: 20.0,
                status: 'critical',
                supplierName: 'Telecom Supplier Co., Ltd.',
                supplierContact: 'Mr. John Smith',
                supplierPhone: '+95 9 123 456 789'
            },
            {
                id: '2',
                sku: 'PROD-002',
                name: 'Game Vouchers',
                currentStock: 200000000,
                maxStock: 500000000,
                dailySales: 50000000,
                daysRemaining: 4,
                stockPercent: 40.0,
                status: 'low',
                supplierName: 'Gaming Solutions Inc.',
                supplierContact: 'Ms. Sarah Johnson',
                supplierPhone: '+95 9 234 567 890'
            },
            {
                id: '3',
                sku: 'PROD-003',
                name: 'Internet Packages',
                currentStock: 160000000,
                maxStock: 800000000,
                dailySales: 40000000,
                daysRemaining: 4,
                stockPercent: 20.0,
                status: 'low',
                supplierName: 'Internet Provider Ltd.',
                supplierContact: 'Mr. David Lee',
                supplierPhone: '+95 9 345 678 901'
            }
        ];

        this.initProfitChart(mockProfitData);
    }

    initProfitChart(data: ProfitData[]): void {
        const dates = data.map(d => {
            const date = new Date(d.date);
            return date.toLocaleDateString('vi-VN', {day: '2-digit', month: 'short'});
        });

        const earnings = data.map(d => d.earnings);

        const today = new Date().toISOString().split('T')[0];
        const todayIndex = data.findIndex(d => d.date === today);
        const todayExpected = todayIndex >= 0 ? data[todayIndex].expectedEarnings : null;
        const lastIndex = data.length - 1;
        const lastExpected = data[lastIndex]?.expectedEarnings || null;

        const expectedValue = todayExpected !== null ? todayExpected : lastExpected;
        const expectedIndex = todayIndex >= 0 ? todayIndex : lastIndex;

        this.profitChartOptions = {
            series: [
                {
                    name: 'Earnings',
                    data: earnings
                }
            ],
            chart: {
                type: 'area',
                height: 350,
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
            annotations: expectedValue !== null && expectedValue !== undefined ? {
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

    onFilterChange(): void {
        this.loadData();
    }

    formatCurrency(amount: number): string {
        return amount.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    formatStock(stock: number): string {
        return `${(stock / 1000000).toFixed(0)}M`;
    }

    getStatusClass(status: string): string {
        return `status-${status}`;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'critical':
                return 'Critical';
            case 'low':
                return 'Low Stock';
            default:
                return 'Normal';
        }
    }

    getUrgentMessageParams(days: number): { [key: string]: string } {
        return {days: days.toString()};
    }
}

