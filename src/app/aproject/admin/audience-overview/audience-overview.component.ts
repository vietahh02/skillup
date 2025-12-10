import { Component, Input, ViewChild, OnChanges, SimpleChanges } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatMenuModule } from "@angular/material/menu";
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexLegend,
    ApexStroke,
    ApexGrid,
    ApexXAxis,
    ApexFill,
    ApexTooltip,
    NgApexchartsModule
} from "ng-apexcharts";
import { DashBoardAdmin, DashBoardAdminChart } from "../../../models/user.models";

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    grid: ApexGrid;
    fill: ApexFill;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
    colors: any;
};

@Component({
    selector: 'app-audience-overview',
    imports: [MatButtonModule, MatCardModule, MatMenuModule, NgApexchartsModule],
    templateUrl: './audience-overview.component.html',
    styleUrls: ['./audience-overview.component.scss']
})
export class AudienceOverviewComponent implements OnChanges {

    @Input() data!: DashBoardAdmin;  
    @ViewChild("chart") chart!: ChartComponent;
    public chartOptions: Partial<ChartOptions> = {
        series: [
            {
                name: "Total Employees",
                data: [],
            },
            {
                name: "Total Managers",
                data: [],
            },
            {
                name: "Total Lecturers",
                data: [],
            }
        ],
        chart: {
            type: "bar",
            height: 350,
        },
        plotOptions: {
            bar: {
                borderRadius: 3,
                horizontal: false,
                columnWidth: "33%",
                borderRadiusApplication: 'end',
            }
        },
        dataLabels: {
            enabled: false
        },
        colors: ["#757fef", "#2db6f5", "#ee368c"],
        stroke: {
            width: 5,
            show: true,
            colors: ["transparent"]
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec"
            ],
            labels: {
                style: {
                    colors: "#a9a9c8",
                    fontSize: "14px"
                },
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#a9a9c8",
                    fontSize: "14px",
                },
            },
            axisBorder: {
                show: false,
            },
        },
        fill: {
            opacity: 1,
        },
        tooltip: {
            y: {
                formatter: function(val) {
                    return val + " users";
                }
            }
        },
        legend: {
            offsetY: 0,
            position: "top",
            fontSize: "14px",
            horizontalAlign: "left",
        },
        grid: {
            show: true,
            strokeDashArray: 5,
            borderColor: "#EDEFF5"
        }
    };;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data'] && this.data) {
            this.updateChart();
        }
    }

    private updateChart() {
        if (!this.data) return;
        
        this.chartOptions = {
            series: [
                {
                    name: "Total Employees",
                    data: this.data?.totalEmployeeChart.map(chart => chart.count),
                },
                {
                    name: "Total Managers",
                    data: this.data?.totalManagerChart.map(chart => chart.count),
                },
                {
                    name: "Total Lecturers",
                    data: this.data?.totalLecturerChart.map(chart => chart.count),
                }
            ],
            chart: {
                type: "bar",
                height: 350,
            },
            plotOptions: {
                bar: {
                    borderRadius: 3,
                    horizontal: false,
                    columnWidth: "33%",
                    borderRadiusApplication: 'end',
                }
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#757fef", "#2db6f5", "#ee368c"],
            stroke: {
                width: 5,
                show: true,
                colors: ["transparent"]
            },
            xaxis: {
                categories: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec"
                ],
                labels: {
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px"
                    },
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px",
                    },
                },
                axisBorder: {
                    show: false,
                },
            },
            fill: {
                opacity: 1,
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return val + " users";
                    }
                }
            },
            legend: {
                offsetY: 0,
                position: "top",
                fontSize: "14px",
                horizontalAlign: "left",
            },
            grid: {
                show: true,
                strokeDashArray: 5,
                borderColor: "#EDEFF5"
            }
        };
    }

}