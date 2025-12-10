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

@Component({
    selector: 'app-admin-course-list',
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
],
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
})
export class AdminCourseList implements AfterViewInit {
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

    constructor(private router: Router, private courseService: ApiCourseServices) {}

    ngAfterViewInit() {
        this.data.paginator = this.paginator;

        this.data.filterPredicate = (data, filter) =>
            data.name.toLowerCase().includes(filter) || data.email.toLowerCase().includes(filter);

        this.loadCourses();
    }

    loadCourses() {
        this.courseService.getCourseListManager(this.currentPage, this.pageSize, this.searchTerm).subscribe({
            next: (response: any) => {
                this.data.data = response.items || [];
                this.totalItems = response.total || 0;
                this.currentPage = response.page || 1;
                this.pageSize = response.pageSize || 10;
            },
            error: (error: any) => {
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
        this.router.navigate(['/admin/courses', course.courseId]);
    }

    onPageChange(p: number) {
        if (p < 1) return;
        this.currentPage = p;
        this.loadCourses();
      }
    
      onPageSizeChange(s: number) {
        this.pageSize = s;
        this.currentPage = 1;
        this.loadCourses();
      }
    
    onPaginatorChange(event: PageEvent) {
        if (event.pageSize !== this.pageSize) {
            this.onPageSizeChange(event.pageSize);
          } else {
            this.onPageChange(event.pageIndex + 1);
          }
    }

}
