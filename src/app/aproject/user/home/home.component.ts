import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent } from "@angular/material/card";
import { Router } from '@angular/router';
import { ApiCourseServices } from '../../../services/course.service';
import { CourseUserView } from '../../../models/course.models';
import { CommonModule } from '@angular/common';
import { MatTooltip } from "@angular/material/tooltip";
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-home',
    imports: [CommonModule, MatCard, MatCardContent, MatButtonModule, MatTooltip, FormsModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class Home {
    courses: CourseUserView[] = [];
    allCourses: CourseUserView[] = []; // Store all courses from API
    displayedCourses: CourseUserView[] = []; // Courses to display on current page
    
    constructor(private router: Router, private courseService: ApiCourseServices) {}

    totalItems = 0;
    currentPage = 1;
    pageSize = 16;
    isLoading = false;
    searchTerm = '';

    ngOnInit() {
        this.loadCourses();
    }

    loadCourses() {
        this.isLoading = true;
        this.courseService.getCoursesUserView(this.currentPage, this.pageSize, this.searchTerm).pipe(
            finalize(() => {
                this.isLoading = false;
            })
        ).subscribe((courses: CourseUserView[] | any) => {
            // Handle both array response and paginated response
            if (Array.isArray(courses)) {
                // Response is simple array
                this.allCourses = courses;
                this.totalItems = courses.length;
            } else if (courses.items && Array.isArray(courses.items)) {
                // Response is paginated
                this.allCourses = courses.items as CourseUserView[];
                this.totalItems = courses.total || courses.items.length;
            } else {
                this.allCourses = [];
                this.totalItems = 0;
            }
            
            // Update displayed courses based on current page
            this.updateDisplayedCourses();
        });
    }

    updateDisplayedCourses() {
        const startIndex = 0;
        const endIndex = this.currentPage * this.pageSize;
        this.displayedCourses = this.allCourses.slice(startIndex, endIndex);
    }

    search() {
        this.currentPage = 1;
        this.allCourses = [];
        this.displayedCourses = [];
        this.loadCourses();
    }

    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    maxLengthTextName(text: string) : boolean {
        return text.length > 8;
    }

    formatName(name: string) : string {
        return this.maxLengthTextName(name) ? name.substring(0, 8) + '...' : name;
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

    loadMore() {
        this.isLoading = true;
        this.currentPage++;
        
        // If all courses are already loaded, just update displayed courses
        if (this.displayedCourses.length < this.allCourses.length) {
            this.updateDisplayedCourses();
            this.isLoading = false;
        } else {
            // Load more from API
            this.courseService.getCoursesUserView(this.currentPage, this.pageSize, this.searchTerm).pipe(
                finalize(() => {
                    this.isLoading = false;
                })
            ).subscribe((courses: CourseUserView[] | any) => {
                let newCourses: CourseUserView[] = [];
                
                if (Array.isArray(courses)) {
                    newCourses = courses;
                } else if (courses.items && Array.isArray(courses.items)) {
                    newCourses = courses.items as CourseUserView[];
                }
                
                // Append new courses to allCourses
                this.allCourses = [...this.allCourses, ...newCourses];
                this.totalItems = this.allCourses.length;
                
                // Update displayed courses
                this.updateDisplayedCourses();
            });
        }
    }

}

