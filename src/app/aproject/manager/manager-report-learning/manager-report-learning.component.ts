import { Component, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface LearningPathReport {
    userId: number;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
    level: string;
    status: boolean;
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    averageProgress: number;
    totalLearningTime: number; // in hours
    lastActiveDate: string;
    enrollmentDate: string;
    completionRate: number;
    quizScore: number;
    certificates: number;
}

@Component({
    selector: 'app-manager-report-learning',
    imports: [
        CommonModule,
        FormsModule,
        MatCardModule,
        MatButtonModule,
        MatMenuModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatIconModule,
        MatTooltipModule
    ],
    templateUrl: './manager-report-learning.component.html',
    styleUrls: ['./manager-report-learning.component.scss']
})
export class ManagerReportLearningComponent {
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    displayedColumns: string[] = ['user', 'level', 'courses', 'progress', 'completionRate', 'learningTime', 'quizScore', 'lastActive', 'status'];
    dataSource = new MatTableDataSource<LearningPathReport>([]);
    searchTerm = '';
    
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;
    isLoading = false;

    constructor() {
        this.loadFakeData();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    loadFakeData() {
        const fakeLearningPaths: LearningPathReport[] = [
            {
                userId: 1,
                name: 'Nguyễn Văn An',
                email: 'nguyenvanan@example.com',
                avatarUrl: 'img/user/user1.jpg',
                role: 'Employee',
                level: 'Junior',
                status: true,
                totalCourses: 12,
                completedCourses: 8,
                inProgressCourses: 4,
                averageProgress: 85,
                totalLearningTime: 156,
                lastActiveDate: '2024-01-15',
                enrollmentDate: '2023-06-10',
                completionRate: 67,
                quizScore: 92,
                certificates: 5
            },
            {
                userId: 2,
                name: 'Trần Thị Bình',
                email: 'tranthibinh@example.com',
                avatarUrl: 'img/user/user2.jpg',
                role: 'Lecturer',
                level: 'Senior',
                status: true,
                totalCourses: 20,
                completedCourses: 18,
                inProgressCourses: 2,
                averageProgress: 95,
                totalLearningTime: 342,
                lastActiveDate: '2024-01-14',
                enrollmentDate: '2022-03-15',
                completionRate: 90,
                quizScore: 98,
                certificates: 12
            },
            {
                userId: 3,
                name: 'Lê Văn Cường',
                email: 'levancuong@example.com',
                avatarUrl: 'img/user/user3.jpg',
                role: 'Employee',
                level: 'Middle',
                status: true,
                totalCourses: 15,
                completedCourses: 10,
                inProgressCourses: 5,
                averageProgress: 72,
                totalLearningTime: 198,
                lastActiveDate: '2024-01-13',
                enrollmentDate: '2023-02-20',
                completionRate: 67,
                quizScore: 85,
                certificates: 7
            },
            {
                userId: 4,
                name: 'Phạm Thị Dung',
                email: 'phamthidung@example.com',
                avatarUrl: 'img/user/user4.jpg',
                role: 'Manager',
                level: 'Senior',
                status: true,
                totalCourses: 18,
                completedCourses: 15,
                inProgressCourses: 3,
                averageProgress: 88,
                totalLearningTime: 267,
                lastActiveDate: '2024-01-15',
                enrollmentDate: '2022-11-05',
                completionRate: 83,
                quizScore: 90,
                certificates: 10
            },
            {
                userId: 5,
                name: 'Hoàng Văn Em',
                email: 'hoangvanem@example.com',
                avatarUrl: 'img/user/user5.jpg',
                role: 'Employee',
                level: 'Junior',
                status: true,
                totalCourses: 8,
                completedCourses: 5,
                inProgressCourses: 3,
                averageProgress: 65,
                totalLearningTime: 98,
                lastActiveDate: '2024-01-12',
                enrollmentDate: '2023-08-15',
                completionRate: 63,
                quizScore: 78,
                certificates: 3
            },
            {
                userId: 6,
                name: 'Vũ Thị Phương',
                email: 'vuthiphuong@example.com',
                avatarUrl: 'img/user/user6.jpg',
                role: 'Lecturer',
                level: 'Middle',
                status: true,
                totalCourses: 22,
                completedCourses: 20,
                inProgressCourses: 2,
                averageProgress: 92,
                totalLearningTime: 389,
                lastActiveDate: '2024-01-15',
                enrollmentDate: '2021-09-20',
                completionRate: 91,
                quizScore: 95,
                certificates: 15
            },
            {
                userId: 7,
                name: 'Đỗ Văn Giang',
                email: 'dovangiang@example.com',
                avatarUrl: 'img/user/user7.jpg',
                role: 'Employee',
                level: 'Middle',
                status: false,
                totalCourses: 10,
                completedCourses: 6,
                inProgressCourses: 4,
                averageProgress: 58,
                totalLearningTime: 124,
                lastActiveDate: '2024-01-05',
                enrollmentDate: '2023-04-10',
                completionRate: 60,
                quizScore: 72,
                certificates: 4
            },
            {
                userId: 8,
                name: 'Bùi Thị Hoa',
                email: 'buithihoa@example.com',
                avatarUrl: 'img/user/user8.jpg',
                role: 'Employee',
                level: 'Junior',
                status: true,
                totalCourses: 9,
                completedCourses: 7,
                inProgressCourses: 2,
                averageProgress: 78,
                totalLearningTime: 112,
                lastActiveDate: '2024-01-14',
                enrollmentDate: '2023-07-22',
                completionRate: 78,
                quizScore: 82,
                certificates: 5
            },
            {
                userId: 9,
                name: 'Ngô Văn Ích',
                email: 'ngovanich@example.com',
                avatarUrl: 'img/user/user9.jpg',
                role: 'Admin',
                level: 'Senior',
                status: true,
                totalCourses: 25,
                completedCourses: 24,
                inProgressCourses: 1,
                averageProgress: 98,
                totalLearningTime: 456,
                lastActiveDate: '2024-01-15',
                enrollmentDate: '2020-01-10',
                completionRate: 96,
                quizScore: 99,
                certificates: 20
            },
            {
                userId: 10,
                name: 'Đinh Thị Khoa',
                email: 'dinhthikhoa@example.com',
                avatarUrl: 'img/user/user10.jpg',
                role: 'Employee',
                level: 'Middle',
                status: true,
                totalCourses: 14,
                completedCourses: 11,
                inProgressCourses: 3,
                averageProgress: 80,
                totalLearningTime: 201,
                lastActiveDate: '2024-01-15',
                enrollmentDate: '2023-01-18',
                completionRate: 79,
                quizScore: 87,
                certificates: 8
            },
            {
                userId: 11,
                name: 'Lý Văn Long',
                email: 'lyvanlong@example.com',
                avatarUrl: 'img/user/user11.jpg',
                role: 'Employee',
                level: 'Junior',
                status: true,
                totalCourses: 7,
                completedCourses: 4,
                inProgressCourses: 3,
                averageProgress: 55,
                totalLearningTime: 87,
                lastActiveDate: '2024-01-11',
                enrollmentDate: '2023-09-05',
                completionRate: 57,
                quizScore: 68,
                certificates: 2
            },
            {
                userId: 12,
                name: 'Mai Thị Mai',
                email: 'maithimai@example.com',
                avatarUrl: 'img/user/user12.jpg',
                role: 'Lecturer',
                level: 'Senior',
                status: true,
                totalCourses: 19,
                completedCourses: 17,
                inProgressCourses: 2,
                averageProgress: 90,
                totalLearningTime: 312,
                lastActiveDate: '2024-01-15',
                enrollmentDate: '2022-05-12',
                completionRate: 89,
                quizScore: 93,
                certificates: 13
            },
            {
                userId: 13,
                name: 'Phan Văn Nam',
                email: 'phanvannam@example.com',
                avatarUrl: 'img/user/user13.jpg',
                role: 'Employee',
                level: 'Middle',
                status: true,
                totalCourses: 13,
                completedCourses: 9,
                inProgressCourses: 4,
                averageProgress: 70,
                totalLearningTime: 178,
                lastActiveDate: '2024-01-13',
                enrollmentDate: '2023-03-25',
                completionRate: 69,
                quizScore: 80,
                certificates: 6
            },
            {
                userId: 14,
                name: 'Võ Thị Oanh',
                email: 'vothioanh@example.com',
                avatarUrl: 'img/user/user14.jpg',
                role: 'Manager',
                level: 'Middle',
                status: true,
                totalCourses: 16,
                completedCourses: 13,
                inProgressCourses: 3,
                averageProgress: 82,
                totalLearningTime: 234,
                lastActiveDate: '2024-01-14',
                enrollmentDate: '2022-12-08',
                completionRate: 81,
                quizScore: 88,
                certificates: 9
            },
            {
                userId: 15,
                name: 'Trương Văn Phúc',
                email: 'truongvanphuc@example.com',
                avatarUrl: 'img/user/user15.jpg',
                role: 'Employee',
                level: 'Junior',
                status: false,
                totalCourses: 6,
                completedCourses: 3,
                inProgressCourses: 3,
                averageProgress: 48,
                totalLearningTime: 76,
                lastActiveDate: '2023-12-28',
                enrollmentDate: '2023-10-15',
                completionRate: 50,
                quizScore: 65,
                certificates: 1
            }
        ];

        this.dataSource.data = fakeLearningPaths;
        this.totalItems = fakeLearningPaths.length;
    }

    search() {
        this.currentPage = 1;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.applyFilter();
    }

    applyFilter() {
        const filterValue = this.searchTerm.toLowerCase();
        this.dataSource.filter = filterValue;
        this.totalItems = this.dataSource.filteredData.length;
    }

    onPaginatorChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    formatTime(hours: number): string {
        if (hours < 1) {
            return Math.round(hours * 60) + ' phút';
        }
        return Math.round(hours) + ' giờ';
    }

    maxLengthText(text: string): boolean {
        return text.length > 20;
    }

    formatText(text: string): string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    exportToPDF() {
        // In real implementation, this would export to PDF
        console.log('Exporting to PDF...');
    }

    exportToExcel() {
        // In real implementation, this would export to Excel
        console.log('Exporting to Excel...');
    }
}
