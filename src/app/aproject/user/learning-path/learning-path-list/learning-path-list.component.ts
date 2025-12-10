import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LearningPathService } from '../../../../services/learning-path.service';
import { LearningPath } from '../../../../models/learning-path.models';
import { firstValueFrom } from 'rxjs';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
  selector: 'app-learning-path-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCard,
    MatCardContent,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FormsModule,
    MatTooltip
],
  templateUrl: './learning-path-list.component.html',
  styleUrls: ['./learning-path-list.component.scss']
})
export class LearningPathListComponent implements OnInit {
  searchTerm = '';
  isLoading = false;
  learningPaths: LearningPath[] = [];

  // Enrollment status loaded from API
  enrolledPathIds: number[] = [];
  pathProgress: { [pathId: number]: number } = {};
  enrollmentTypes: { [pathId: number]: 'assigned' | 'self-enrolled' } = {}; // Track enrollment type

  constructor(
    private router: Router,
    private learningPathService: LearningPathService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadLearningPaths();
  }

  async loadLearningPaths(): Promise<void> {
    this.isLoading = true;
    try {
      const response = await firstValueFrom(
        this.learningPathService.getLearningPaths(1, 100, this.searchTerm)
      );
      this.learningPaths = response.items;

      // Load enrollment status from API
      await this.loadEnrollmentStatus();
    } catch (error) {
      console.error('Error loading learning paths:', error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load user's enrollment status and progress from API
   */
  async loadEnrollmentStatus(): Promise<void> {
    try {
      const enrollments = await firstValueFrom(
        this.learningPathService.getMyEnrollments()
      );

      // Clear existing data
      this.enrolledPathIds = [];
      this.pathProgress = {};
      this.enrollmentTypes = {};

      // Populate from API response
      enrollments.forEach(enrollment => {
        this.enrolledPathIds.push(enrollment.learningPathId);
        this.pathProgress[enrollment.learningPathId] = enrollment.progressPct || 0;
        // Store enrollment type (default to 'self-enrolled' if not provided)
        this.enrollmentTypes[enrollment.learningPathId] = enrollment.enrollmentType || 'self-enrolled';
      });
    } catch (error) {
      console.error('Error loading enrollment status:', error);
    }
  }

  get filteredPaths(): LearningPath[] {
    // Filter by search term
    let filtered = this.learningPaths;
    
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = this.learningPaths.filter(path =>
        path.name.toLowerCase().includes(searchLower) ||
        path.description.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }

  get enrolledPaths(): LearningPath[] {
    return this.learningPaths.filter(path =>
      this.enrolledPathIds.includes(path.learningPathId)
    );
  }

  get assignedPaths(): LearningPath[] {
    let paths = this.learningPaths.filter(path =>
      this.enrolledPathIds.includes(path.learningPathId) &&
      this.enrollmentTypes[path.learningPathId] === 'assigned'
    );
    
    // Apply search filter if exists
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      paths = paths.filter(path =>
        path.name.toLowerCase().includes(searchLower) ||
        path.description.toLowerCase().includes(searchLower)
      );
    }
    
    return paths;
  }

  get selfEnrolledPaths(): LearningPath[] {
    let paths = this.learningPaths.filter(path =>
      this.enrolledPathIds.includes(path.learningPathId) &&
      this.enrollmentTypes[path.learningPathId] === 'self-enrolled'
    );
    
    // Apply search filter if exists
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      paths = paths.filter(path =>
        path.name.toLowerCase().includes(searchLower) ||
        path.description.toLowerCase().includes(searchLower)
      );
    }
    
    return paths;
  }

  get availablePaths(): LearningPath[] {
    let paths = this.learningPaths.filter(path =>
      !this.enrolledPathIds.includes(path.learningPathId)
    );
    
    // Apply search filter if exists
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      paths = paths.filter(path =>
        path.name.toLowerCase().includes(searchLower) ||
        path.description.toLowerCase().includes(searchLower)
      );
    }
    
    return paths;
  }

  isEnrolled(pathId: number): boolean {
    return this.enrolledPathIds.includes(pathId);
  }

  getProgress(pathId: number): number {
    return this.pathProgress[pathId] || 0;
  }

  async search(): Promise<void> {
    await this.loadLearningPaths();
  }

  viewDetail(path: LearningPath): void {
    this.router.navigate(['/learning-path', path.learningPathId]);
  }

  async enrollPath(path: LearningPath, event: Event): Promise<void> {
    event.stopPropagation();

    try {
      // Call enrollment API
      const enrollment = await firstValueFrom(
        this.learningPathService.enrollInLearningPath(path.learningPathId)
      );

      // Update local state
      this.enrolledPathIds.push(path.learningPathId);
      this.pathProgress[path.learningPathId] = enrollment.progressPct || 0;
      // Set enrollment type (should be 'self-enrolled' when user enrolls themselves)
      this.enrollmentTypes[path.learningPathId] = enrollment.enrollmentType || 'self-enrolled';

      // Show success notification
      this.snackBar.open(`Successfully enrolled in "${path.name}"`, 'Close', {
        duration: 4000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['success-snackbar']
      });
    } catch (error: any) {
      console.error('Error enrolling in learning path:', error);

      // Handle different error types from backend
      const errorData = error?.error;
      const httpStatus = error?.status;
      let errorMessage = '';

      if (errorData?.errors) {
        // FluentValidation errors
        const firstError = Object.values(errorData.errors)[0] as string[] | undefined;
        errorMessage = firstError?.[0] || 'Validation error occurred';
      } else if (errorData?.error === 'InsufficientLevel') {
        // Level validation error - show detailed message
        errorMessage = `Cannot enroll: Your current level (${errorData.userLevel}) is lower than the required level (${errorData.requiredLevel}) for this learning path.`;
      } else if (errorData?.error === 'InvalidOperation') {
        // Business logic error
        errorMessage = errorData.message || 'Invalid operation';
      } else if (httpStatus === 410) {
        // HTTP 410 Gone - Resource no longer available
        errorMessage = 'This learning path is no longer available';
      } else if (httpStatus === 404) {
        // HTTP 404 Not Found
        errorMessage = 'Learning path not found';
      } else if (httpStatus === 409) {
        // HTTP 409 Conflict - Already enrolled
        errorMessage = 'You are already enrolled in this learning path';
      } else if (httpStatus === 401 || httpStatus === 403) {
        // Unauthorized or Forbidden
        errorMessage = 'You do not have permission to enroll in this learning path';
      } else if (errorData?.message) {
        // Use backend message if available
        errorMessage = errorData.message;
      } else {
        // Generic error
        errorMessage = 'Failed to enroll in learning path. Please try again.';
      }

      // Show error notification
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['error-snackbar']
      });
    }
  }

  continuePath(path: LearningPath, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/learning-path', path.learningPathId]);
  }

  getLevelClass(level?: string): string {
    if (!level) return 'level-default';

    switch (level.toLowerCase()) {
      case 'intern':
        return 'level-intern';
      case 'fresher':
        return 'level-fresher';
      case 'junior':
        return 'level-junior';
      case 'middle':
      case 'intermediate':
        return 'level-middle';
      case 'senior':
        return 'level-senior';
      case 'leader':
        return 'level-leader';
      case 'beginner':
        return 'level-beginner';
      case 'advanced':
        return 'level-advanced';
      default:
        return 'level-default';
    }
  }
}
