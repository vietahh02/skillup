import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LearningPathService } from '../../../../services/learning-path.service';
import { LearningPath, LearningPathsResponse } from '../../../../models/learning-path.models';
import { firstValueFrom } from 'rxjs';

export interface AssignLearningPathDialogData {
  userId: number;
  userName: string;
  onAssigned?: () => void;
}

@Component({
  selector: 'app-assign-learning-path-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './assign-learning-path-dialog.component.html',
  styleUrls: ['./assign-learning-path-dialog.component.scss']
})
export class AssignLearningPathDialogComponent implements OnInit {
  learningPaths: LearningPath[] = [];
  selectedLearningPathId: number | null = null;
  isLoading = false;
  isLoadingPaths = false;
  searchTerm = '';

  constructor(
    public dialogRef: MatDialogRef<AssignLearningPathDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AssignLearningPathDialogData,
    private learningPathService: LearningPathService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    await this.loadLearningPaths();
  }

  async loadLearningPaths() {
    this.isLoadingPaths = true;
    try {
      const response = await firstValueFrom(
        this.learningPathService.getLearningPaths(1, 100, this.searchTerm)
      );
      // Chỉ lấy các Learning Path có status = 'Active'
      this.learningPaths = response.items.filter(path => path.status === 'Active');
    } catch (error) {
      this.snackBar.open('Failed to load learning paths', 'Close', { duration: 3000 });
    } finally {
      this.isLoadingPaths = false;
    }
  }

  onSearch() {
    this.loadLearningPaths();
  }

  async assign() {
    if (!this.selectedLearningPathId) {
      this.snackBar.open('Please select a learning path', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    try {
      await firstValueFrom(
        this.learningPathService.assignLearningPath(
          this.data.userId,
          this.selectedLearningPathId
        )
      );

      this.snackBar.open('Learning path assigned successfully', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });

      if (this.data.onAssigned) {
        this.data.onAssigned();
      }

      this.dialogRef.close(true);
    } catch (error: any) {
      // Handle specific error types from BE
      let errorMessage = 'Failed to assign learning path';
      
      if (error.error) {
        const errorCode = error.error.error;
        const message = error.error.message;
        
        switch (errorCode) {
          case 'ActiveAssignment':
            errorMessage = message || 'Employee has active learning path assignments. Please complete them first.';
            break;
          case 'InsufficientLevel':
            errorMessage = message || `Employee level (${error.error.userLevel}) is lower than required level (${error.error.requiredLevel})`;
            break;
          case 'NotFound':
            errorMessage = message || 'Learning path not found';
            break;
          case 'Duplicate':
            errorMessage = message || 'Employee is already enrolled in this learning path';
            break;
          default:
            errorMessage = message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    } finally {
      this.isLoading = false;
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}

