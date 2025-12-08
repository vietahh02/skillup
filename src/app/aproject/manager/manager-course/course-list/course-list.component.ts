import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ApiCourseServices } from '../../../../services/course.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-manager-course-list',
    imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTooltip
],
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
})
export class ManagerCourseList implements AfterViewInit {
    displayedColumns: string[] = [
        'id',
        'name',
        'type',
        'createdBy',
        'createdAt',
        'status',
        'action',
    ];

    data = new MatTableDataSource<any>();
    searchTerm = '';
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;
    @ViewChild(MatPaginator) paginator!: MatPaginator;

    constructor(private router: Router, private courseService: ApiCourseServices, private snack: MatSnackBar) {}

    ngAfterViewInit() {
        // Don't assign paginator to dataSource since we're using server-side pagination
        // Sync paginator with current page
        if (this.paginator) {
            this.paginator.pageIndex = this.currentPage - 1;
            this.paginator.pageSize = this.pageSize;
        }

        this.loadCourses();
    }

    
    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    loadCourses() {
        this.courseService.getCourseListManager(this.currentPage, this.pageSize, this.searchTerm).subscribe({
            next: (response: any) => {
                this.data.data = response.items || [];
                this.totalItems = response.total || 0;
                this.currentPage = response.page || this.currentPage;
                this.pageSize = response.pageSize || this.pageSize;

                // Sync paginator after data is loaded
                if (this.paginator) {
                    this.paginator.length = this.totalItems;
                    this.paginator.pageSize = this.pageSize;
                    this.paginator.pageIndex = this.currentPage - 1;
                }
            },
            error: (error: any) => {
                console.error('Error loading courses:', error);
                this.snack.open(error.error?.message || error.error || 'Failed to load courses', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
                this.data.data = [];
                this.totalItems = 0;
            }
        });
    }

    getDate(date: string) {
        return date.split('T')[0];
    }

    search() {
        this.currentPage = 1;
        if (this.paginator) {
            this.paginator.pageIndex = 0;
        }
        this.loadCourses();
    }

    viewCourseDetail(course: any) {
        this.router.navigate(['/manager/courses', course.courseId]);
    }

    onPaginatorChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.loadCourses();
    }

}
