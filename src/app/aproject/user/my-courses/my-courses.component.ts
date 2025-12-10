import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCard, MatCardContent } from "@angular/material/card";
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiCourseServices } from '../../../services/course.service';
import { CourseEnrollment } from '../../../models/course.models';
import { MatTooltip } from "@angular/material/tooltip";
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-my-courses',
    imports: [MatTableModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatCard, MatCardContent, FormsModule, MatTooltip, NgClass],
    templateUrl: './my-courses.component.html',
    styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent implements OnInit {
    constructor(private router: Router, private courseService: ApiCourseServices) {}

    displayedColumns: string[] = ['course', 'instructor', 'result', 'status', 'startTime', 'endTime'];
    dataSource = new MatTableDataSource<CourseEnrollment>([]);
    searchTerm = ''
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnInit() {
        this.getCourseEnrollment();
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'Completed':
                return 'text-soft-success';
            case 'InProgress':
                return 'text-soft-warning';
            case 'Failed':
                return 'text-soft-danger';
            default:
                return '';
        }
    }
    
    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    getDate(date: string) {
        return date ? date.split('T')[0] : 'N/A';
    }

    search() {
        this.currentPage = 1;
        this.getCourseEnrollment();
    }

    ngAfterViewInit() {
        this.dataSource.paginator = this.paginator;
    }

    detailCourse(course: CourseEnrollment) {
        this.router.navigate([`/course-detail/${course.courseId}`])
    }

    getCourseEnrollment() {
        this.courseService.getCourseEnrollment(1, 1000, this.searchTerm).subscribe((res: any) => {
            this.dataSource.data = res.items;
            this.totalItems = res.total;
            this.currentPage = res.page;
            this.pageSize = res.pageSize;

        });
    }

    onPaginatorChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        if (event.pageSize !== this.pageSize) {
          this.onPageSizeChange(event.pageSize);
        } else {
          this.onPageChange(event.pageIndex + 1);
        }
        // this.getCourseEnrollment();
    }
  
    onPageSizeChange(s: number) {
      this.pageSize = s;
      this.currentPage = 1;
      this.getCourseEnrollment();
    }
  
    onPageChange(p: number) {
      this.currentPage = p;
      this.getCourseEnrollment();
    }

    passed = true; 
    failed = true;
    percentage = true;

}
