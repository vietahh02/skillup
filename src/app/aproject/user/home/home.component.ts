import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from "@angular/material/card";
import { Router } from '@angular/router';
import { ApiCourseServices } from '../../../services/course.service';
import { CourseUserView } from '../../../models/course.models';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    imports: [CommonModule,MatCard, MatCardContent, MatButtonModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class Home {
    courses: CourseUserView[] = [];
    constructor(private router: Router, private courseService: ApiCourseServices) {}

    ngOnInit() {
        this.courseService.getCoursesUserView().subscribe((courses) => {
            this.courses = courses;
        });
    }

    detailCourse(course: CourseUserView) {
        this.router.navigate([`/course-detail/${course.courseId}`])
    }

    formatDuration(duration: number) {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        return `${hours}h${minutes}m${seconds}s`;
    }

}

