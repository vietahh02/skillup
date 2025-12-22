import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { provideNativeDateAdapter } from '@angular/material/core';
import { LearningPathService } from '../../../../services/learning-path.service';
import { LearningPath, DetailedEnrollment } from '../../../../models/learning-path.models';
import { firstValueFrom } from 'rxjs';
import { DialogService } from '../../../../services/dialog.service';

@Component({
  selector: 'app-manager-learning-path',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './manager-learning-path.component.html',
  styleUrls: ['./manager-learning-path.component.scss']
})
export class ManagerLearningPathComponent implements OnInit {
  // View state
  currentView: 'paths' | 'progress' = 'paths';

  // Stats data for cards
  totalPaths = 0;
  activePaths = 0;
  totalEnrolledUsers = 0;
  averageCompletionRate = 0;

  // Enrollment statistics (for User tab cards)
  totalEnrollments = 0;
  activeEnrollments = 0;
  completedEnrollments = 0;

  // Learning Paths table data
  displayedColumns: string[] = ['roadmap', 'level', 'duration', 'users', 'avgProgress', 'status', 'created', 'actions'];
  dataSource: LearningPath[] = [];
  total = 0;
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';
  isLoading = false;

  // User Progress table data
  progressDisplayedColumns: string[] = ['user', 'learningPath', 'enrollmentType', 'progress', 'status', 'startDate', 'actions'];
  progressDataSource: DetailedEnrollment[] = [];
  progressTotal = 0;
  progressCurrentPage = 1;
  progressPageSize = 10;
  progressSearchTerm = '';
  progressFilterType: 'all' | 'assigned' | 'self-enrolled' = 'all';
  progressDateFrom: Date | null = null;
  progressDateTo: Date | null = null;
  isLoadingProgress = false;

  constructor(
    private router: Router,
    private learningPathService: LearningPathService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.loadLearningPaths();
    this.loadStats();
    this.loadUserProgress();
  }

  maxLengthText(text: string) : boolean {
    return text.length > 20;
  }

  formatText(text: string) : string {
      return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
  }

  formatDateForAPI(date: Date): string {
    // Format to YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  get isDateRangeInvalid(): boolean {
    if (!this.progressDateFrom || !this.progressDateTo) {
      return false;
    }
    return this.progressDateFrom > this.progressDateTo;
  }

  clearDateFilters(): void {
    this.progressDateFrom = null;
    this.progressDateTo = null;
    this.progressCurrentPage = 1;
    this.loadUserProgress();
  }

  onDateFilterChange(): void {
    if (this.isDateRangeInvalid) {
      return; // Don't load if date range is invalid
    }
    this.progressCurrentPage = 1;
    this.loadUserProgress();
  }

  exportToExcel(): void {
    // Don't export if date range is invalid
    if (this.isDateRangeInvalid) {
      this.snackBar.open('Invalid date range: From Date must be before or equal to To Date', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar', 'custom-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }
    
    this.isLoadingProgress = true;
    
    // Format dates to ISO string (YYYY-MM-DD) or null
    const dateFrom = this.progressDateFrom ? this.formatDateForAPI(this.progressDateFrom) : undefined;
    const dateTo = this.progressDateTo ? this.formatDateForAPI(this.progressDateTo) : undefined;
    
    this.learningPathService.exportUserProgressExcel(
      this.progressSearchTerm,
      this.progressFilterType,
      dateFrom,
      dateTo
    ).subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        const filterStr = this.progressFilterType !== 'all' ? `-${this.progressFilterType}` : '';
        link.download = `user-progress-tracking${filterStr}-${dateStr}.xlsx`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.isLoadingProgress = false;
        this.snackBar.open('Export to Excel completed successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (error) => {
        this.isLoadingProgress = false;
        this.snackBar.open('Failed to export Excel file', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  loadLearningPaths(): void {
    this.isLoading = true;
    this.learningPathService.getLearningPaths(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.dataSource = response.items;
        this.total = response.total;
        this.currentPage = response.page;
        this.pageSize = response.pageSize;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Failed to load learning paths', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadStats(): void {
    this.learningPathService.getStatistics().subscribe({
      next: (stats) => {
        this.totalPaths = stats.totalPaths;
        this.activePaths = stats.activePaths;
        this.totalEnrolledUsers = stats.totalEnrolledUsers;
        this.averageCompletionRate = stats.averageCompletionRate;
      },
      error: (error) => {
        this.snackBar.open('Failed to load statistics', 'Close', { duration: 3000 });
      }
    });
  }


  loadUserProgress(): void {
    // Don't load if date range is invalid
    if (this.isDateRangeInvalid) {
      return;
    }
    
    this.isLoadingProgress = true;
    
    // Format dates to ISO string (YYYY-MM-DD) or undefined
    const dateFrom = this.progressDateFrom ? this.formatDateForAPI(this.progressDateFrom) : undefined;
    const dateTo = this.progressDateTo ? this.formatDateForAPI(this.progressDateTo) : undefined;
    
    // Load with larger pageSize to get all data for filtering
    this.learningPathService.getAllEnrollments(1, 1000, this.progressSearchTerm, dateFrom, dateTo).subscribe({
      next: (response) => {
        // Ensure response and items exist
        if (!response || !response.items) {
          this.progressDataSource = [];
          this.progressTotal = 0;
          this.isLoadingProgress = false;
          return;
        }

        // Backend now returns both active and inactive enrollments
        // FE will display all and change icon color based on isActive
        let filteredItems = response.items || [];
        
        // Filter by enrollment type if needed
        if (this.progressFilterType === 'assigned') {
          filteredItems = filteredItems.filter(item => item.enrollmentType === 'assigned');
        } else if (this.progressFilterType === 'self-enrolled') {
          filteredItems = filteredItems.filter(item => item.enrollmentType === 'self-enrolled');
        }
        
        // Apply pagination to filtered results
        const startIndex = (this.progressCurrentPage - 1) * this.progressPageSize;
        const endIndex = startIndex + this.progressPageSize;
        const paginatedItems = filteredItems.slice(startIndex, endIndex);
        
        this.progressDataSource = paginatedItems;
        this.progressTotal = filteredItems.length; // Use filtered count
        this.progressCurrentPage = this.progressCurrentPage;
        this.progressPageSize = this.progressPageSize;
        this.isLoadingProgress = false;
      },
      error: (error) => {
        this.progressDataSource = [];
        this.progressTotal = 0;
        this.snackBar.open('Failed to load user progress', 'Close', { duration: 3000 });
        this.isLoadingProgress = false;
      }
    });
  }

  onFilterTypeChange(): void {
    this.progressCurrentPage = 1;
    this.loadUserProgress();
  }

  searchPaths(): void {
    this.currentPage = 1;
    this.loadLearningPaths();
  }

  searchProgress(): void {
    this.progressCurrentPage = 1;
    this.loadUserProgress();
  }

  onPaginatorChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadLearningPaths();
  }

  onProgressPaginatorChange(event: PageEvent): void {
    this.progressPageSize = event.pageSize;
    this.progressCurrentPage = event.pageIndex + 1;
    this.loadUserProgress();
  }

  switchView(view: 'paths' | 'progress'): void {
    this.currentView = view;
  }

  createPath(): void {
    this.router.navigate(['/manager/learning-paths/create']);
  }

  viewPath(path: LearningPath): void {
    this.router.navigate(['/manager/learning-paths/detail', path.learningPathId]);
  }

  editPath(path: LearningPath): void {
    this.router.navigate(['/manager/learning-paths/edit', path.learningPathId]);
  }

  async togglePathStatus(path: LearningPath): Promise<void> {
    const isActive = path.status === 'Active';
    const newStatus = isActive ? 'Inactive' : 'Active';
    const action = isActive ? 'deactivate' : 'activate';
    const confirmMsg = `Are you sure you want to ${action} "${path.name}"?\n\n${
      isActive
        ? 'This learning path will be marked as Inactive. Users will no longer see it.'
        : 'This learning path will be marked as Active. Users will be able to see and enroll in it.'
    }`;

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      // Call the new status update API
      await firstValueFrom(
        this.learningPathService.updateLearningPathStatus(path.learningPathId, newStatus)
      );
      this.snackBar.open(`Learning path ${action}d successfully`, 'Close', { duration: 3000 });
      this.loadLearningPaths();
      this.loadStats();
    } catch (error) {
      this.snackBar.open(`Failed to ${action} learning path`, 'Close', { duration: 3000 });
    }
  }

  async deletePath(path: LearningPath): Promise<void> {
    const confirmMsg = `⚠️ WARNING: Delete "${path.name}"?\n\nThis learning path will be soft deleted (IsDeleted = true).\nIt will remain in the database but won't be visible.\n\nAll user enrollments and progress data will be preserved.`;

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      // Soft delete - set IsDeleted = true in database
      await firstValueFrom(
        this.learningPathService.deleteLearningPath(path.learningPathId)
      );
      this.snackBar.open('Learning path deleted successfully', 'Close', { duration: 3000 });
      this.loadLearningPaths();
      this.loadStats();
    } catch (error) {
      this.snackBar.open('Failed to delete learning path', 'Close', { duration: 3000 });
    }
  }

  // Helper methods
  getPathStatusClass(status?: string): string {
    switch (status) {
      case 'Active':
        return 'text-soft-success';
      case 'Inactive':
        return 'text-soft-danger';
      case 'Draft':
        return 'text-soft-warning';
      default:
        return 'text-soft-success';
    }
  }

  getLevelBadgeClass(level?: string): string {
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
      default:
        return 'level-default';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'text-soft-success';
      case 'InProgress':
        return 'text-soft-info';
      case 'NotStarted':
        return 'text-soft-secondary';
      case 'Failed':
        return 'text-soft-danger';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // User Progress Actions
  viewEnrollmentProgress(enrollment: DetailedEnrollment): void {
    // Navigate to user detail page instead
    this.router.navigate(['/manager/users', enrollment.userId]);
  }

  async unenrollUser(enrollment: DetailedEnrollment): Promise<void> {
    // BE now always returns isActive field (bool)
    const isActive = enrollment.isActive === true;
    const action = isActive ? 'unenroll' : 're-enroll';
    const actionText = isActive ? 'Unenroll' : 'Re-enroll';
    
    // Show Material Dialog instead of browser confirm
    const confirmed = await firstValueFrom(
      this.dialogService.confirm({
        type: 'confirm',
        title: `${actionText} User`,
        message: `Are you sure you want to ${action} "${enrollment.userName}" from "${enrollment.learningPathName}"?`,
        confirmText: actionText,
        cancelText: 'Cancel',
        destructive: isActive // Unenroll is destructive
      })
    );

    if (!confirmed) {
      return;
    }

    // Optimistic update: update local state immediately
    const enrollmentIndex = this.progressDataSource.findIndex(
      e => e.learningPathEnrollmentId === enrollment.learningPathEnrollmentId
    );
    if (enrollmentIndex !== -1) {
      this.progressDataSource[enrollmentIndex].isActive = !isActive;
      // Force change detection to update UI immediately
      this.cdr.detectChanges();
    }

    try {
      await firstValueFrom(
        this.learningPathService.toggleEnrollmentActive(enrollment.learningPathEnrollmentId, !isActive)
      );
      this.snackBar.open(`User ${action}ed successfully`, 'Close', { duration: 3000 });
      
      // Don't reload immediately - keep the updated state visible
      // Only reload when user performs other actions (search, filter, pagination)
      // This way the color change stays visible
    } catch (error) {
      // Revert optimistic update on error
      if (enrollmentIndex !== -1) {
        this.progressDataSource[enrollmentIndex].isActive = isActive;
        this.cdr.detectChanges();
      }
      this.snackBar.open(`Failed to ${action} user`, 'Close', { duration: 3000 });
    }
  }
}
