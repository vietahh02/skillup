import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiCourseServices } from '../services/course.service';

@Injectable({
    providedIn: 'root'
})
export class CourseCountService {

    private courseCount = new BehaviorSubject<number>(0);

    constructor(private courseService: ApiCourseServices) {
        // Tự động load course count khi service được khởi tạo
        this.refreshCourseCount();
    }

    get courseCount$() {
        return this.courseCount.asObservable();
    }

    setCourseCount(count: number) {
        this.courseCount.next(count);
    }

    getCurrentCount(): number {
        return this.courseCount.value;
    }

    refreshCourseCount() {
        // Sử dụng API chuyên dụng để đếm số lượng course
        this.courseService.getCoursePendingCount().subscribe({
            next: (response) => {
                // Xử lý response linh hoạt: có thể là số trực tiếp hoặc object
                let count = 0;
                if (typeof response === 'number') {
                    count = response;
                } else if (response && typeof response === 'object') {
                    count = response.count || response.total || response.pendingCount || 0;
                }
                this.courseCount.next(count);
            },
            error: (error) => {
                console.error('Failed to fetch course count:', error);
                // Giữ nguyên giá trị hiện tại nếu có lỗi
            }
        });
    }
}

