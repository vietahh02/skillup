import { Component, ElementRef, Input, SimpleChanges, ViewChild } from "@angular/core";
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexAnnotations,
    ApexFill,
    ApexStroke,
    ApexGrid,
    NgApexchartsModule
} from "ng-apexcharts";
import { ApiDashboardServices } from "../../../../services/dashboard.service";
import { MatFormField } from "@angular/material/form-field";
import { MatLabel } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import { MatOption } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { finalize } from "rxjs";

export type ChartOptionsUsers = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: any; //ApexXAxis;
    annotations: ApexAnnotations;
    fill: ApexFill;
    stroke: ApexStroke;
    grid: ApexGrid;
};

export type ChartOptionsEnrollment = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    dataLabels: ApexDataLabels;
    grid: ApexGrid;
    colors: any;
    stroke: ApexStroke;
    title: ApexTitleSubtitle;
};

export type ChartOptionsCourseType = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    legend: ApexLegend;
    responsive: ApexResponsive[];
    labels: any;
    colors: any;
};


export type ChartOptionsStatusDistribution = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    colors: string[];
    legend: ApexLegend;
    plotOptions: ApexPlotOptions;
};


@Component({
    selector: 'app-ac-employee',
    imports: [NgApexchartsModule, MatFormField, MatLabel, MatIconModule, FormsModule, MatOption, MatSelect],
    templateUrl: './ac-employee.component.html',
    styleUrls: ['./ac-employee.component.scss']
})
export class AcEmployeeComponent {
    @ViewChild("chart") chart!: ChartComponent;
    selectedYear: string = '';
    years: string[] = [];
    dataEnrollment: any[] = [];
    dataUser: any[] = [];
    dataCourseType: any[] = [];
    dataCourseTypeLabels: string[] = [];
    dataStatusDistribution: any[] = [];
    dataStatusDistributionLabels: string[] = [];
    dataStatusDistributionCount: any[] = [];
    public chartOptionsUsers: Partial<ChartOptionsUsers>;
    public chartOptionsEnrollment: Partial<ChartOptionsEnrollment>;
    public chartOptionsCourseType: Partial<ChartOptionsCourseType>;
    public chartOptionsStatusDistribution: Partial<ChartOptionsStatusDistribution>;

    constructor(private dashboardService: ApiDashboardServices) {
        const currentYear = new Date().getFullYear();
        this.selectedYear = currentYear.toString();
        for (let year = 2024; year <= currentYear; year++) {
          this.years.push(year.toString());
        }

        this.chartOptionsUsers = {
            series: [],
            chart: {
                height: 350,
                type: "bar",
            },
        };

        this.chartOptionsEnrollment = {
            series: [],
            chart: {
                height: 350,
                type: "bar",
            },
        };

        this.chartOptionsCourseType = {
            series: [],
            chart: {
                height: 350,
                type: "pie",
            },
        };

        this.chartOptionsStatusDistribution = {
            series: [],
            chart: {
                height: 350,
                type: "radialBar",
            },
        };
    }

    onYearChange() {
        this.getMonthlyUserStats();
        this.getMonthlyEnrollmentStats();
    }

    ngOnInit() {
        this.getMonthlyEnrollmentStats();
        this.getMonthlyUserStats();
        this.getCourseTypeStats();
        this.getCourseStatusStats();
    }

    getMonthlyEnrollmentStats() {
        this.dashboardService.getManagerDashboardMonthlyEnrollmentStats(this.selectedYear).pipe(finalize(() => this.setupEnrollment())).subscribe((res: any) => {
            this.dataEnrollment = res.monthlyEnrollmentStats.map((item: any) => item.newEnrollments);
        });
    }

    getMonthlyUserStats() {
        this.dashboardService.getManagerDashboardMonthlyUserStats(this.selectedYear).pipe(finalize(() => this.setupUsers())).subscribe((res: any) => {
            this.dataUser = res.monthlyUserStats.map((item: any) => item.newUsers);
        });
    }

    getCourseTypeStats() {
        this.dashboardService.getManagerDashboardCourseTypeStats().pipe(finalize(() => this.setupCourseType())).subscribe((res: any) => {
            this.dataCourseType = res.courseTypeDistribution.map((item: any) => item.percentage);
            this.dataCourseTypeLabels = res.courseTypeDistribution.map((item: any) => item.courseType);
        });
    }

    getCourseStatusStats() {
        this.dashboardService.getManagerDashboardCourseStatusStats().pipe(finalize(() => this.setupStatusDistribution())).subscribe((res: any) => {
            this.dataStatusDistribution = res.courseStatusDistribution.map((item: any) => item.percentage);
            this.dataStatusDistributionLabels = res.courseStatusDistribution.map((item: any) => item.status);
            this.dataStatusDistributionCount = res.courseStatusDistribution.map((item: any) => item.count);
        });
    }

    setupCourseType() {
        this.chartOptionsCourseType = {
            series: this.dataCourseType,
            chart: {
                width: 380,
                type: "pie"
            },
            labels: this.dataCourseTypeLabels,
            legend: {
                offsetY: 0,
                fontSize: "14px",
                labels: {
                    colors: '#5B5B98'
                }
            },
            stroke: {
                width: 0,
                show: true
            },
            // colors: ["#757fef", "#ee368c", "#2db6f5"],
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '14px',
                },
                dropShadow: {
                    enabled: false
                }
            },
            tooltip: {
                style: {
                    fontSize: '14px',
                },
                y: {
                    formatter: function(val:any) {
                        return val + "%";
                    }
                }
            }
        };
    }

    setupStatusDistribution() {
        this.chartOptionsStatusDistribution = {
            series: this.dataStatusDistribution,
            chart: {
                height: 350,
                type: "radialBar"
            },
            plotOptions: {
                radialBar: {
                    offsetY: 0,
                    startAngle: 0,
                    endAngle: 270,
                    hollow: {
                        margin: 10,
                        size: "30%",
                        image: undefined,
                        background: "transparent"
                    },
                    dataLabels: {
                        name: {
                            show: false
                        },
                        value: {
                            show: false
                        }
                    }
                }
            },
            colors: [

            ],
            labels: this.dataStatusDistributionLabels,
            legend: {
                show: true,
                offsetY: 0,
                offsetX: -20,
                floating: true,
                position: "left",
                fontSize: "14px",
                labels: {
                    colors: '#5B5B98'
                },
                formatter: function(seriesName, opts) {
                    return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex] + "%";
                }
            }
        };
    }

    setupEnrollment() {
        this.chartOptionsEnrollment = {
            series: [
                {
                    name: "New Enrollments",
                    data: this.dataEnrollment
                }
            ],
            chart: {
                height: 350,
                type: "line",
                zoom: {
                    enabled: false
                },
                toolbar: {
                    show: true
                }
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#757fef"],
            stroke: {
                curve: "straight"
            },
            // title: {
            //     text: "New Enrollments by Month",
            //     align: "left"
            // },
            grid: {
                show: true,
                strokeDashArray: 5,
                borderColor: "#EDEFF5",
                row: {
                    colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
                    opacity: 0.5
                }
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
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px"
                    }
                },
                axisBorder: {
                    show: false
                }
            }
        };
    }

    setupUsers() {
        this.chartOptionsUsers = {
            series: [
                {
                    name: "Employee Count",
                    data: this.dataUser
                }
            ],
            chart: {
                height: 350,
                type: "bar",
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: "50%",
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: 2
            },
            grid: {
                row: {
                    colors: ["#ffffff", "#f2f2f2"]
                },
                show: true,
                strokeDashArray: 5,
                borderColor: "#EDEFF5"
            },
            xaxis: {
                labels: {
                    rotate: -45,
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px",
                    }
                },
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
                tickPlacement: "on"
            },
            yaxis: {
                // title: {
                //     text: "Employee Count"
                // },
                labels: {
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px",
                    }
                },
                axisBorder: {
                    show: false
                }
            },
            fill: {
                type: "gradient",
                gradient: {
                    shade: "light",
                    type: "horizontal",
                    shadeIntensity: 0.25,
                    gradientToColors: undefined,
                    inverseColors: true,
                    opacityFrom: 0.85,
                    opacityTo: 0.85
                }
            }
        };
    }


}