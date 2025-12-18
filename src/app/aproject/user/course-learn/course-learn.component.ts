import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { CourseDetail, Lesson, SubLesson } from '../../../models/course.models';
import { ApiCourseServices } from '../../../services/course.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-course-learn',
    imports: [CommonModule, MatCardModule, MatButtonModule, MatMenuModule, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, RouterLink],
    templateUrl: './course-learn.component.html',
    styleUrls: ['./course-learn.component.scss']
})
export class CourseLearnComponent implements OnDestroy {

    panelOpenState = false;

    detail: CourseDetail | null = null;
    currentSubLesson: SubLesson | null = null;
    id!: string;
    
    @ViewChild('videoElement', { static: false }) videoElement!: ElementRef<HTMLVideoElement>;
    
    // Track completion status to avoid multiple API calls
    private completedSubLessons = new Set<number>();

    constructor(
        private courseService: ApiCourseServices, 
        private route: ActivatedRoute,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {
        this.id = this.route.snapshot.paramMap.get('id')!;
    }

    ngOnInit(): void {
        this.courseService.getCourseById(Number(this.id)).subscribe((course : any) => {
            this.checkLesson(course);
            this.detail = course;
            this.currentSubLesson = this.getNextSubLessonToLearn();
        });
    }

    checkLesson(courseDetail: CourseDetail | null): void {
        if (!courseDetail) {
            this.router.navigate(['/']);
            return;
        }

        // Allow access if:
        // 1. Course is Approved (anyone can access)
        // 2. Course is Rejected BUT user is enrolled (Out of Date logic - allow enrolled users to continue)
        if (courseDetail.status === 'Approved') {
            return; // Allow access
        }

        if (courseDetail.status === 'Rejected' && courseDetail.isEnrolled) {
            return; // Allow access for enrolled users (Out of Date logic)
        }

        // Otherwise, redirect to home
        this.router.navigate(['/']);
    }
    
    getSubLesson(lessonId: number, subLessonId: number) : SubLesson | null {
        return this.detail?.lessons.find(lesson => lesson.lessonId === lessonId)?.subLessons.find(subLesson => subLesson.id === subLessonId) || null;
    }

    getNextSubLessonToLearn() : SubLesson | null {
        // Lấy tất cả sub lessons từ tất cả các lessons và sắp xếp theo thứ tự
        const allSubLessons: SubLesson[] = [];
        this.detail?.lessons
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .forEach(lesson => {
                lesson.subLessons
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .forEach(sub => allSubLessons.push(sub));
            });

        // Tìm SubLesson tiếp theo có thể học được
        for (let i = 0; i < allSubLessons.length; i++) {
            const subLesson = allSubLessons[i];
            
            // Nếu chưa hoàn thành
            if (!subLesson.isCompleted) {
                // SubLesson đầu tiên luôn có thể học
                if (i === 0) {
                    return subLesson;
                }
                
                // Kiểm tra SubLesson trước đó đã hoàn thành chưa
                const previousSubLesson = allSubLessons[i - 1];
                if (previousSubLesson?.isCompleted === true) {
                    return subLesson;
                }
                
                // Nếu không có sub lesson nào trước đó chưa hoàn thành, break để tránh trả về sub lesson không thể học
                break;
            }
        }

        // Nếu tất cả đã hoàn thành, trả về SubLesson cuối cùng
        return allSubLessons.length > 0 ? allSubLessons[allSubLessons.length - 1] : null;
    }

    selectSubLesson(subLesson: SubLesson): void {
        // Chỉ cho phép chọn nếu có thể học được
        if (this.isLearnNext(subLesson)) {
            this.currentSubLesson = subLesson;
            
            // Force change detection
            this.cdr.detectChanges();
            
            // Force video reload and add progress listener
            setTimeout(() => {
                if (this.videoElement?.nativeElement) {
                    const video = this.videoElement.nativeElement;
                    video.load(); // Force reload video
                    
                    // Add timeupdate event listener to track progress
                    this.addVideoProgressListener(video, subLesson);
                }
            }, 100);
        }
    }

    formatDuration(duration: number) {
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        return `${hours}h${minutes}m${seconds}s`;
    }

    addVideoProgressListener(video: HTMLVideoElement, subLesson: SubLesson): void {
        // Remove existing listeners first
        video.removeEventListener('timeupdate', this.handleVideoProgress);
        
        // Add new listener
        video.addEventListener('timeupdate', () => {
            if (video.duration && video.currentTime) {
                const progressPercent = (video.currentTime / video.duration) * 100;
                
                // Check if video reached 95% and not already completed
                if (progressPercent >= 95 && 
                    !subLesson.isCompleted && 
                    !this.completedSubLessons.has(subLesson.id)) {
                    
                    this.onSubLessonCompleted(subLesson);
                }
            }
        });
    }

    onSubLessonCompleted(subLesson: SubLesson): void {
        // Add to completed set to avoid multiple calls
        this.completedSubLessons.add(subLesson.id);
        
        this.courseService.getProgress(subLesson.id).subscribe({
            next: (progress: any) => {
                // Update the current sub lesson status
                subLesson.isCompleted = true;
                subLesson.completedAt = new Date().toISOString();
                
                // Refresh course data to update lesson progress
                this.refreshCourseData();
                
                // Auto-select next available sub lesson
                setTimeout(() => {
                    this.autoSelectNextSubLesson();
                }, 500);
            },
            error: (error: any) => {
                // Remove from completed set on error so it can be retried
                this.completedSubLessons.delete(subLesson.id);
            }
        });
    }

    refreshCourseData(): void {
        this.courseService.getCourseById(Number(this.id)).subscribe((course: any) => {
            this.detail = course;
        });
    }

    autoSelectNextSubLesson(): void {
        const nextSubLesson = this.getNextSubLessonToLearn();
        if (nextSubLesson && nextSubLesson.id !== this.currentSubLesson?.id) {
            this.selectSubLesson(nextSubLesson);
        }
    }

    // Property to bind the function context
    private handleVideoProgress = (event: Event) => {
        // This will be handled in addVideoProgressListener
    };

    isLearnNext(subLesson: SubLesson) : boolean {
        // Nếu đã hoàn thành thì có thể xem lại
        if (subLesson.isCompleted) {
            return true;
        }

        const allSubLessons: SubLesson[] = [];
        this.detail?.lessons
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .forEach(lesson => {
                lesson.subLessons
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .forEach(sub => allSubLessons.push(sub));
            });

        const currentIndex = allSubLessons.findIndex(s => s.id === subLesson.id);
        
        // Nếu là SubLesson đầu tiên thì có thể học
        if (currentIndex === 0) {
            return true;
        }

        // Kiểm tra SubLesson trước đó đã hoàn thành chưa
        const previousSubLesson = allSubLessons[currentIndex - 1];
        return previousSubLesson?.isCompleted === true;
    }

    // Video event handlers
    onVideoError(event: any): void {
        // Video error
    }

    onVideoLoadStart(): void {
        // Video load started
    }

    onVideoCanPlay(): void {
        // Video can play
    }

    onVideoLoadedData(): void {
        // Add progress listener when video data is ready
        if (this.videoElement?.nativeElement && this.currentSubLesson) {
            this.addVideoProgressListener(this.videoElement.nativeElement, this.currentSubLesson);
        }
    }

    ngOnDestroy(): void {
        // Clean up video event listeners
        if (this.videoElement?.nativeElement) {
            this.videoElement.nativeElement.removeEventListener('timeupdate', this.handleVideoProgress);
        }
    }

}