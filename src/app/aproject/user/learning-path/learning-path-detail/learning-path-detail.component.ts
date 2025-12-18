import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LearningPathService } from '../../../../services/learning-path.service';
import {
  LearningPath,
  LearningPathItem,
  LearningPathProgressSummary
} from '../../../../models/learning-path.models';
import { firstValueFrom } from 'rxjs';
import { MatTooltip } from "@angular/material/tooltip";

type CourseStatus = 'completed' | 'in-progress' | 'upcoming' | 'failed';

interface CourseWithStatus extends LearningPathItem {
  status: CourseStatus;
  progress: number;
}

@Component({
  selector: 'app-learning-path-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
],
  templateUrl: './learning-path-detail.component.html',
  styleUrl: './learning-path-detail.component.scss'
})
export class LearningPathDetail implements OnInit {
  learningPathId: number | null = null;
  learningPath: LearningPath | null = null;
  courses: CourseWithStatus[] = [];
  progressSummary: LearningPathProgressSummary | null = null;
  isLoading = false;
  isEnrolled = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private learningPathService: LearningPathService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.learningPathId = +params['id'];
        this.loadLearningPathData();
      }
    });
  }
  
  maxLengthText(text: string) : boolean {
    return text.length > 40;
  }

  formatText(text: string) : string {
      return this.maxLengthText(text) ? text.substring(0, 40) + '...' : text;
  }

  async loadLearningPathData(): Promise<void> {
    if (!this.learningPathId) return;

    this.isLoading = true;
    try {
      // Load learning path details
      this.learningPath = await firstValueFrom(
        this.learningPathService.getLearningPathById(this.learningPathId)
      );

      // Load courses in the path
      const items = await firstValueFrom(
        this.learningPathService.getLearningPathItems(this.learningPathId, 'asc')
      );

      // Load progress summary
      this.progressSummary = await firstValueFrom(
        this.learningPathService.getProgressSummary(this.learningPathId)
      );

      // Check enrollment status
      await this.checkEnrollmentStatus();

      // Map courses with status and progress from backend
      this.courses = items.map((item, index) => ({
        ...item,
        status: this.getCourseStatus(item),
        progress: item.progressPct || 0  // Use progressPct from backend
      }));

    } catch (error) {
      this.snackBar.open('Failed to load learning path', 'Close', { duration: 3000 });
    } finally {
      this.isLoading = false;
    }
  }

  async checkEnrollmentStatus(): Promise<void> {
    try {
      const enrollments = await firstValueFrom(
        this.learningPathService.getMyEnrollments()
      );
      this.isEnrolled = enrollments.some(
        e => e.learningPathId === this.learningPathId
      );
    } catch (error) {
      // Error checking enrollment
    }
  }

  getCourseStatus(item: LearningPathItem): CourseStatus {
    // Use enrollmentStatus from backend
    if (!item.enrollmentStatus) return 'upcoming';

    if (item.enrollmentStatus === 'Failed') {
      return 'failed';
    } else if (item.enrollmentStatus === 'Completed' || (item.progressPct && item.progressPct >= 100)) {
      return 'completed';
    } else if (item.enrollmentStatus === 'InProgress') {
      return 'in-progress';
    } else {
      return 'upcoming';
    }
  }

  get overallProgress(): number {
    return this.progressSummary?.overallProgress || 0;
  }

  get completedCourses(): number {
    return this.progressSummary?.completedCourses || 0;
  }

  get totalCourses(): number {
    return this.progressSummary?.totalCourses || this.courses.length;
  }

  get currentCourse(): CourseWithStatus | undefined {
    return this.courses.find(c => c.status === 'in-progress');
  }

  getStatusIcon(status: CourseStatus): string {
    if (status === 'completed') return 'check_circle';
    if (status === 'in-progress') return 'pending';
    if (status === 'failed') return 'cancel';
    return 'radio_button_unchecked';
  }

  getStatusClass(status: CourseStatus): string {
    return status;
  }

  async enrollNow(): Promise<void> {
    if (!this.learningPathId) return;

    try {
      await firstValueFrom(
        this.learningPathService.enrollInLearningPath(this.learningPathId)
      );
      this.isEnrolled = true;
      this.snackBar.open('Successfully enrolled in learning path!', 'Close', { duration: 3000 });
      await this.loadLearningPathData();
    } catch (error) {
      this.snackBar.open('Failed to enroll in learning path', 'Close', { duration: 3000 });
    }
  }

  viewCourse(course: CourseWithStatus): void {
    // Check if course is unlocked
    if (!this.isCourseUnlocked(course)) {
      this.snackBar.open('Complete previous courses to unlock this one', 'Close', { duration: 3000 });
      return;
    }

    // Navigate to course detail
    this.router.navigate(['/course-detail', course.courseId]);
  }

  isCourseUnlocked(course: CourseWithStatus): boolean {
    // First course is always unlocked
    if (course.orderIndex === 0) return true;

    // Check if previous mandatory course is completed
    const previousCourse = this.courses.find(c => c.orderIndex === course.orderIndex - 1);
    if (!previousCourse) return true;

    // If previous course is mandatory and not completed (or failed), current course is locked
    if (previousCourse.isMandatory && previousCourse.status !== 'completed' && previousCourse.status !== 'failed') {
      return false;
    }

    return true;
  }

  goBack(): void {
    this.router.navigate(['/learning-paths']);
  }
}
