import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-ac-board',
    imports: [CommonModule, MatCardModule, MatButtonModule, MatMenuModule, MatCheckboxModule, MatTooltip],
    templateUrl: './ac-board.component.html',
    styleUrls: ['./ac-board.component.scss']
})
export class AcBoardComponent {
    @Input() data:any;
    topCourses: any[] = [];
    topCoursesEnrollmentCount: number = 0;
    topLearningPaths: any[] = [];
    topLearningPathsEnrollmentCount: number = 0;
    topLecturers: any[] = [];
    topLecturersEnrollmentCount: number = 0;
    topEmployees: any[] = [];
    topEmployeesCount: number = 0;

    constructor() {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['data']) {
            console.log(this.data);
            this.getTopCourses();
            this.getTopLearningPaths();
            this.getTopLecturers();
            this.getTopEmployees();
        }
    }

    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    getTopCourses() {
        this.data.topCoursesByEnrollment.forEach((course: any) => {
            this.topCoursesEnrollmentCount += course.totalEnrollments;
            this.topCourses.push({
                ...course,
            });
        });
    }

    getTopLearningPaths() {
        this.data.topLearningPathsByEnrollment.forEach((learningPath: any) => {
            this.topLearningPathsEnrollmentCount += learningPath.totalEnrollments;
            this.topLearningPaths.push({
                ...learningPath,
            });
        });
    }

    getTopLecturers() {
        this.data.topLecturersByCourses.forEach((lecturer: any) => {
            this.topLecturersEnrollmentCount += lecturer.totalCourses;
            this.topLecturers.push({
                ...lecturer,
            });
        });
    }   

    getTopEmployees() {
        this.data.topEmployeesByProgress.forEach((employee: any) => {
            this.topEmployeesCount += employee.overallCourseProgress;
            this.topEmployees.push({
                ...employee,
            });
        });
    }
}