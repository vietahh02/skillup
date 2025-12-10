import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  responsive?: ApexResponsive[];
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  legend?: ApexLegend;
  fill?: ApexFill;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  title?: ApexTitleSubtitle;
  labels?: string[];
  colors?: string[];
  markers?: any;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Current Balance Chart
  currentBalanceChartOptions: Partial<ChartOptions> = {};

  // Product Distribution Chart
  productDistributionChartOptions: Partial<ChartOptions> = {};

  // Amount Chart
  amountChartOptions: Partial<ChartOptions> = {};

  // Transaction Chart
  transactionChartOptions: Partial<ChartOptions> = {};

  // Data
  currentBalance = 'Ks 107,846.00';
  totalTransactions = 1876;
  reconciliationData = {
    transactions: 1325,
    amount: 'Ks 5,436,783.00',
    success: 1312,
    failure: 12,
    missed: 1
  };
  purchaseOrderData = {
    deposit: { waiting: 1, today: 9 },
    withdraw: { waiting: 0, today: 8 }
  };

  ngOnInit(): void {
    this.initCurrentBalanceChart();
    this.initProductDistributionChart();
    this.initAmountChart();
    this.initTransactionChart();
  }

  initCurrentBalanceChart(): void {
    this.currentBalanceChartOptions = {
      series: [
        {
          name: 'Deposit',
          data: [80000, 60000, 90000, 85000, 50000, 40000, 95000]
        },
        {
          name: 'Withdraw',
          data: [-50000, -70000, -40000, -30000, -80000, -90000, -20000]
        }
      ],
      chart: {
        type: 'bar',
        height: 400,
        stacked: true,
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '25%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        labels: {
          style: {
            fontSize: '12px'
          }
        }
      },
      yaxis: {
        min: -100000,
        max: 100000,
        labels: {
          formatter: (val: number) => {
            return val >= 0 ? `${val / 1000}K` : `${val / 1000}K`;
          },
          style: {
            fontSize: '12px'
          }
        }
      },
      fill: {
        opacity: 1,
        colors: ['#9d6cef', '#10B981']
      },
      colors: ['#7C3AED', '#31efb1'],
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px'
      },
      tooltip: {
        y: {
          formatter: (val: number) => {
            return `Ks ${val.toLocaleString()}`;
          }
        }
      }
    };
  }

  initProductDistributionChart(): void {
    this.productDistributionChartOptions = {
      series: [45, 30, 25],
      chart: {
        type: 'pie',
        height: 400
      },
      labels: ['TOPUP', 'FTTH', 'PACK'],
      colors: ['#3B82F6', '#10B981', '#F59E0B'],


      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px',
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => {
          return `${val}%`;
        },
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#fff']
        }
      }
    };
  }

  initAmountChart(): void {
    const dates = ['23/12', '24/12', '25/12', '26/12', '27/12', '28/12', '29/12', '30/12', '31/12', '01/01', '02/01', '03/01', '04/01', '05/01', '06/01'];

    this.amountChartOptions = {
      series: [
        {
          name: 'Total',
          type: 'column',
          data: [75000, 80000, 70000, 85000, 90000, 75000, 80000, 70000, 85000, 90000, 75000, 80000, 70000, 85000, 60000]
        },
        {
          name: 'Current',
          type: 'line',
          data: [30000, 35000, 32000, 38000, 40000, 35000, 38000, 32000, 38000, 40000, 35000, 38000, 32000, 38000, 30000]
        } as any
      ],
      chart: {
        height: 300,
        type: 'line',
        toolbar: {
          show: false
        }
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth'
      },
      markers: {
        size: [0, 5],
        colors: ['#F59E0B', '#ffffff'],
        strokeColors: ['#F59E0B', '#10B981'],
        strokeWidth: [0, 2],
        hover: {
          size: [0, 6]
        }
      },
      plotOptions: {
        bar: {
          columnWidth: '25%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: [0.85, 1],
        colors: ['#F59E0B', '#10B981']
      },
      colors: ['#F59E0B', '#10B981'],
      xaxis: {
        categories: dates,
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        min: 0,
        max: 100000,
        labels: {
          formatter: (val: number) => {
            return `${val / 1000}K`;
          },
          style: {
            fontSize: '12px'
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px'
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => {
            return `Ks ${val.toLocaleString()}`;
          }
        }
      }
    };
  }

  initTransactionChart(): void {
    const dates = ['23/12', '24/12', '25/12', '26/12', '27/12', '28/12', '29/12', '30/12', '31/12', '01/01', '02/01', '03/01', '04/01', '05/01', '06/01'];

    this.transactionChartOptions = {
      series: [
        {
          name: 'Total',
          type: 'column',
          data: [650, 700, 600, 750, 800, 650, 700, 600, 750, 800, 650, 700, 600, 750, 550]
        },
        {
          name: 'Current',
          type: 'line',
          data: [300, 350, 320, 380, 400, 350, 380, 320, 380, 400, 350, 380, 320, 380, 300]
        } as any
      ],
      chart: {
        height: 300,
        type: 'line',
        toolbar: {
          show: false
        }
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth'
      },
      markers: {
        size: [0, 5],
        colors: ['#F59E0B', '#ffffff'],
        strokeColors: ['#F59E0B', '#10B981'],
        strokeWidth: [0, 2],
        hover: {
          size: [0, 6]
        }
      },
      plotOptions: {
        bar: {
          columnWidth: '25%',
          borderRadius: 4
        }
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        opacity: [0.85, 1],
        colors: ['#F59E0B', '#10B981']
      },
      colors: ['#F59E0B', '#10B981'],
      xaxis: {
        categories: dates,
        labels: {
          style: {
            fontSize: '11px'
          }
        }
      },
      yaxis: {
        min: 0,
        max: 1000,
        labels: {
          formatter: (val: number) => {
            return val.toString();
          },
          style: {
            fontSize: '12px'
          }
        }
      },
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
        fontSize: '12px'
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number) => {
            return val.toString();
          }
        }
      }
    };
  }
}

