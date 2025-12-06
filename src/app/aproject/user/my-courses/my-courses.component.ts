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

@Component({
    selector: 'app-my-courses',
    imports: [MatTableModule, MatButtonModule, MatMenuModule, MatPaginatorModule, MatCard, MatCardContent, FormsModule, MatTooltip],
    templateUrl: './my-courses.component.html',
    styleUrls: ['./my-courses.component.scss']
})
export class MyCoursesComponent implements OnInit {
    constructor(private router: Router, private courseService: ApiCourseServices) {}

    displayedColumns: string[] = ['course', 'instructor', 'status', 'startTime', 'endTime'];
    dataSource = new MatTableDataSource<CourseEnrollment>([]);
    searchTerm = ''
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngOnInit() {
        this.getCourseEnrollment();
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
        this.courseService.getCourseEnrollment().subscribe((res: any) => {
            this.dataSource.data = res.items || [];
            this.totalItems = res.total || 0;
            this.currentPage = res.page || 1;
            this.pageSize = res.pageSize || 10;
        });
    }

    onPaginatorChange(event: PageEvent) {
        this.currentPage = event.pageIndex + 1;
        this.pageSize = event.pageSize;
        this.getCourseEnrollment();
    }

    passed = true; 
    failed = true;
    percentage = true;

}
