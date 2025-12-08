import { Component, inject, ViewChild, AfterViewInit } from '@angular/core';
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
import { ReportService } from '../../../services/report.service';
import { UserReport } from '../../../models/report.models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-manager-report-user',
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
        MatTooltipModule,
        MatSnackBarModule
    ],
    templateUrl: './manager-report-user.component.html',
    styleUrls: ['./manager-report-user.component.scss']
})
export class ManagerReportUserComponent implements AfterViewInit {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    private reportService = inject(ReportService);
    private snack = inject(MatSnackBar);

    displayedColumns: string[] = ['user', 'level', 'courses', 'progress', 'completionRate', 'learningTime', 'quizScore', 'lastActive', 'status'];
    dataSource = new MatTableDataSource<UserReport>([]);
    searchTerm = '';
    
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;
    isLoading = false;

    constructor() {
        this.loadData();
    }

    ngAfterViewInit() {
        // Don't assign paginator to dataSource since we're using server-side pagination
        // Sync paginator with current page
        if (this.paginator) {
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
        }
    }

    loadData() {
        this.isLoading = true;
        this.reportService.getUserReport(this.currentPage, this.pageSize, this.searchTerm).subscribe({
            next: (data: any) => {
                this.dataSource.data = data.items || [];
                this.totalItems = data.total || 0;
                this.currentPage = data.page || this.currentPage;
                this.pageSize = data.pageSize || this.pageSize;
                
                // Sync paginator after data is loaded
                if (this.paginator) {
                    this.paginator.pageIndex = this.currentPage - 1;
                    this.paginator.pageSize = this.pageSize;
                }
                
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error loading user report:', error);
                this.isLoading = false;
            }
        });
    }

    search() {
        this.currentPage = 1;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadData();
    }

    onPaginatorChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadData();
    }

    formatDate(dateString: string): string {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    formatDuration(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
      
        let result = '';
      
        if (h > 0) {
          result += `${h}h`;
        }
        if (m > 0) {
          result += `${m}m`;
        }
        if (s > 0 && h === 0) { 
          result += `${s}s`;
        } else if (s > 0 && h > 0 && m === 0) {
          result += `${s}s`;
        }
        
        if (result === '') {
          return '0s';
        }
        
        return result;
    }
    
    maxLengthText(text: string): boolean {
        return text.length > 20;
    }

    formatText(text: string): string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    exportToExcel() {
        this.isLoading = true;
        this.reportService.exportUserReportExcel(this.searchTerm).subscribe({
            next: (blob: Blob) => {
                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Generate filename with current date
                const date = new Date();
                const dateStr = date.toISOString().split('T')[0];
                link.download = `user-report-${dateStr}.xlsx`;
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                
                // Cleanup
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                this.isLoading = false;
                this.snack.open('Export thành công', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            },
            error: (error) => {
                console.error('Error exporting user report:', error);
                this.isLoading = false;
                this.snack.open('Không thể xuất file Excel', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }
}
