import { Component, inject, ViewChild } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexLegend,
    ApexTooltip,
    ApexGrid,
    ApexTitleSubtitle,
    ApexXAxis,
    ApexFill,
} from "ng-apexcharts";
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatProgressBar } from "@angular/material/progress-bar";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ApiUserServices } from '../../../../services/user.service';
import { UserDetail } from '../../../../models/user.models';
import { CommonModule } from '@angular/common';
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AssignLearningPathDialogComponent } from '../assign-learning-path-dialog/assign-learning-path-dialog.component';
import { LearningPathService } from '../../../../services/learning-path.service';
import { LearningPathEnrollment, DetailedEnrollment } from '../../../../models/learning-path.models';
import { HttpParams } from '@angular/common/http';

export type ChartOptions = {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    tooltip: ApexTooltip;
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    grid: ApexGrid;
    legend: ApexLegend;
    colors: any;
    xaxis: ApexXAxis;
    fill: ApexFill;
    title: ApexTitleSubtitle;
};

@Component({
    selector: 'app-manager-user-detail',
    imports: [
        CommonModule, 
        MatCardModule, 
        MatButtonModule, 
        MatMenuModule, 
        MatCheckboxModule, 
        MatTableModule, 
        MatProgressBar, 
        MatPaginatorModule, 
        RouterLink, 
        MatTabsModule, 
        MatTooltipModule,
        MatIconModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatDialogModule
    ],
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss']
})
export class ManagerUserDetail {

    displayedColumnsEnrolled: string[] = ['name', 'startDate', 'deadline', 'progress'];
    displayedColumnsCreated: string[] = ['name', 'createdAt'];
    dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);

    @ViewChild("chart") chart!: ChartComponent;
    public chartOptions: Partial<ChartOptions>;
    private route = inject(ActivatedRoute);
    id!: string;
    detail: UserDetail | null = null;
    
    active = true;
    pending = true;
    completed = true;

    enrolledCourse: any[] = [];
    createdCourse: any[] = [];
    assignedLearningPaths: LearningPathEnrollment[] = [];
    selfEnrolledLearningPaths: LearningPathEnrollment[] = [];
    isLoadingAssignments = false;

    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }
  
    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    constructor(
        private api: ApiUserServices, 
        private apiUser: ApiUserServices,
        private dialog: MatDialog,
        private learningPathService: LearningPathService,
        private snackBar: MatSnackBar
    ) {
        this.chartOptions = {
            series: [
                {
                    name: "Total Revenue",
                    data: [16, 12, 18, 14, 11, 9, 17, 15, 10, 7, 10, 5]
                }
            ],
            chart: {
                height: 270,
                type: "bar",
                toolbar: {
                    show: false,
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: "18%",
                    distributed: true
                },
            },
            dataLabels: {
                enabled: false
            },
            colors: ["#90C6E0"],
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
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px"
                    },
                },
            },
            yaxis: {
                tickAmount: 4,
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    show: true,
                    style: {
                        colors: "#a9a9c8",
                        fontSize: "14px"
                    },
                }
            },
            grid: {
                show: true,
                borderColor: "#EDEFF5",
                strokeDashArray: 5,
            },
            legend: {
                offsetY: 5,
                show: false,
                position: "bottom",
                fontSize: "14px",
                horizontalAlign: "center",
                labels: {
                    colors: '#5B5B98'
                }
            },
            tooltip: {
                y: {
                    formatter: function(val) {
                        return "$" + val + "K";
                    }
                }
            }
        };
    }

    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id')!;
        this.fetchDetail();
    }

    private fetchDetail() {
        this.api.getUserDetail(this.id).subscribe({
            next: (res) => {
                this.detail = res;
                if (res.roles?.includes('Employee')) {
                    this.fetchEnrolledCourse();
                    this.fetchAssignedLearningPaths();
                }
                if (res.roles?.includes('Lecturer')) {
                    this.fetchCreatedCourse();
                }
            }
        })
    }

    private fetchEnrolledCourse() {
        this.apiUser.getCourseEmployee(this.id).subscribe({
            next: (res) => {
                this.enrolledCourse = res;
            }
        })
    }

    private fetchCreatedCourse() {
        this.apiUser.getCourseLecturers(this.id).subscribe({
            next: (res) => {
                this.createdCourse = res;
            }
        })
    }

    private fetchAssignedLearningPaths() {
        this.isLoadingAssignments = true;
        
        // Get all enrollments for this user
        this.learningPathService.getAllEnrollments(1, 100, '').subscribe({
            next: (response) => {
                // Filter by userId
                const userEnrollments = response.items.filter(item => item.userId === Number(this.id));
                
                // Separate assigned and self-enrolled
                // If enrollmentType is missing, treat all as assigned (workaround)
                const hasEnrollmentType = userEnrollments.some(item => item.enrollmentType !== undefined);
                
                if (hasEnrollmentType) {
                    this.assignedLearningPaths = userEnrollments
                        .filter(item => item.enrollmentType === 'assigned')
                        .map(item => this.mapToLearningPathEnrollment(item));
                    
                    this.selfEnrolledLearningPaths = userEnrollments
                        .filter(item => item.enrollmentType === 'self-enrolled')
                        .map(item => this.mapToLearningPathEnrollment(item));
                } else {
                    // If enrollmentType is missing, show all as assigned (temporary workaround)
                    this.assignedLearningPaths = userEnrollments
                        .map(item => this.mapToLearningPathEnrollment(item));
                    this.selfEnrolledLearningPaths = [];
                }
            },
            error: (error) => {
            },
            complete: () => {
                this.isLoadingAssignments = false;
            }
        });
    }

    private mapToLearningPathEnrollment(item: any): LearningPathEnrollment {
        return {
            learningPathEnrollmentId: item.learningPathEnrollmentId,
            userId: item.userId,
            learningPathId: item.learningPathId,
            learningPathName: item.learningPathName,
            userName: item.userName,
            status: item.status,
            progressPct: item.progressPct,
            startedAt: item.startedAt,
            completedAt: item.completedAt,
            createdAt: item.startedAt,
            updatedAt: item.completedAt || item.startedAt,
            enrollmentType: item.enrollmentType || 'assigned'
        };
    }

    openAssignLearningPathDialog() {
        if (!this.detail) return;

        const dialogRef = this.dialog.open(AssignLearningPathDialogComponent, {
            width: '600px',
            data: {
                userId: Number(this.id),
                userName: this.detail.fullName,
                onAssigned: () => {
                    this.fetchAssignedLearningPaths();
                    this.fetchEnrolledCourse(); // Refresh enrolled courses
                }
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                // Assignment successful, data already refreshed in onAssigned callback
            }
        });
    }

    getStatusClass(status: string): string {
        if (status === 'Completed') return 'text-soft-success';
        if (status === 'InProgress') return 'text-soft-primary';
        return 'text-soft-secondary';
    }

    formatDate(dateString: string): string {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

}

export interface PeriodicElement {
    deadline: string;
    name: string;
    startDate: string;
    progress: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {
    name: 'Public Beta Release',
    startDate: '10 Mar 2023',
    deadline: '14 Mar 2023',
    progress: 75
  },
  {
    name: 'Fix Platform Errors',
    startDate: '09 Feb 2023',
    deadline: '12 Feb 2023',
    progress: 100
  },
  {
    name: 'Launch our Mobile App',
    startDate: '03 Mar 2023',
    deadline: '10 Mar 2023',
    progress: 60
  },
  {
    name: 'Add the New Pricing Page',
    startDate: '02 Mar 2023',
    deadline: '08 Mar 2023',
    progress: 80
  },
  {
    name: 'Redesign New Online Shop',
    startDate: '25 Feb 2023',
    deadline: '01 Mar 2023',
    progress: 45
  },
  {
    name: 'Material Ui Design',
    startDate: '02 Apr 2023',
    deadline: '03 Apr 2023',
    progress: 30
  },
  {
    name: 'Add Progress Track',
    startDate: '01 Feb 2023',
    deadline: '12 Feb 2023',
    progress: 100
  },
  {
    name: 'Project for Client',
    startDate: '10 Mar 2023',
    deadline: '14 Mar 2023',
    progress: 70
  },
  {
    name: 'Opened New Showcase',
    startDate: '05 Feb 2023',
    deadline: '28 Feb 2023',
    progress: 100
  },
  {
    name: 'Updated the Status',
    startDate: '05 Mar 2023',
    deadline: '10 Mar 2023',
    progress: 95
  },
  {
    name: 'Product UI/UX Design',
    startDate: '05 Mar 2023',
    deadline: '08 Mar 2023',
    progress: 85
  },
  {
    name: 'Product Development',
    startDate: '20 Feb 2023',
    deadline: '28 Feb 2023',
    progress: 50
  },
  {
    name: 'New Office Building',
    startDate: '01 Apr 2023',
    deadline: '03 Apr 2023',
    progress: 65
  },
  {
    name: 'SEO Marketing',
    startDate: '27 Feb 2023',
    deadline: '01 Mar 2023',
    progress: 40
  },
  {
    name: 'Public Beta Release',
    startDate: '10 Mar 2023',
    deadline: '14 Mar 2023',
    progress: 75
  },
  {
    name: 'Fix Platform Errors',
    startDate: '09 Feb 2023',
    deadline: '12 Feb 2023',
    progress: 100
  }
];
