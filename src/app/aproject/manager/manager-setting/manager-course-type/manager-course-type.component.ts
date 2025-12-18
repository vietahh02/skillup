import { Component, OnInit, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ApiLookupServices } from '../../../../services/lookup.service';
import { CourseType } from '../../../../models/lookup.model';

@Component({
  selector: 'app-manager-course-type',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './manager-course-type.component.html',
  styleUrls: ['./manager-course-type.component.scss']
})
export class ManagerCourseTypeComponent implements OnInit {
  displayedColumns: string[] = ['courseTypeId', 'name', 'isActive', 'action'];
  data: CourseType[] = [];
  courseType: CourseType[] = [];

  searchTerm: string = '';

  constructor(
    private lookupService: ApiLookupServices,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCourseTypes();
  }

  loadCourseTypes(): void {
    this.lookupService.getCourseTypes().subscribe({
      next: (response: CourseType[]) => {
        this.courseType = response;
        this.data = response;
      },
      error: (error: any) => {
        this.snackBar.open('Error loading course types', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  search(): void {
    this.data = this.courseType.filter(courseType => courseType.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  openAddEditCourseTypeDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(CourseTypeDialog, {
      width: '500px',
      maxWidth: '95vw',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {
        courseType: null,
        loadCourseTypes: () => this.loadCourseTypes()
      }
    });
  }

  editCourseType(courseType: CourseType): void {
    const dialogRef = this.dialog.open(CourseTypeDialog, {
      width: '500px',
      maxWidth: '95vw',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '100ms',
      data: {
        courseType: courseType,
        loadCourseTypes: () => this.loadCourseTypes()
      }
    });
  }

  toggleActive(courseType: CourseType): void {
    const newStatus = !courseType.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    const actionTitle = newStatus ? 'Activate' : 'Deactivate';
    const confirmMsg = `Are you sure you want to ${action} "${courseType.name}"?`;

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: {
        title: `${actionTitle} Course Type`,
        message: confirmMsg,
        buttonText: actionTitle,
        buttonColor: newStatus ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lookupService.activateCourseType(courseType.courseTypeId, newStatus).subscribe({
          next: () => {
            this.snackBar.open(`Course type ${action}d successfully`, 'Close', { 
              duration: 3000, 
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.loadCourseTypes();
          },
          error: (error: any) => {
            this.snackBar.open(`Error ${action}ing course type`, 'Close', { 
              duration: 3000, 
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  deleteCourseType(courseType: CourseType): void {
    // Show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: {
        title: 'Delete Course Type',
        message: `Are you sure you want to delete "${courseType.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lookupService.deleteCourseType(courseType.courseTypeId).subscribe({
          next: () => {
            this.snackBar.open('Course type deleted successfully', 'Close', { 
              duration: 3000, 
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.loadCourseTypes();
          },
          error: (error: any) => {
            this.snackBar.open('Error deleting course type', 'Close', { 
              duration: 3000, 
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }
}

// Dialog Component for Add/Edit Course Type
@Component({
  selector: 'course-type-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule
  ],
  templateUrl: './dialog-course-type.html',
  styleUrls: ['./manager-course-type.component.scss']
})
export class CourseTypeDialog {
  fb = inject(FormBuilder);
  courseTypeForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<CourseTypeDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      courseType: CourseType | null;
      loadCourseTypes: () => void;
    },
    private lookupService: ApiLookupServices,
    private snackBar: MatSnackBar
  ) {
    if (data.courseType) {
      this.isEditMode = true;
      this.courseTypeForm.patchValue({
        name: data.courseType.name
      });
    }
  }

  onSubmit(): void {
    this.courseTypeForm.markAllAsTouched();
    if (!this.courseTypeForm.valid) return;

    const name = this.courseTypeForm.get('name')?.value?.trim();
    if (!name) return;

    if (this.isEditMode && this.data.courseType) {
      // Update existing course type
      this.lookupService.updateCourseType(this.data.courseType.courseTypeId, name).subscribe({
        next: () => {
          this.snackBar.open('Course type updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          if (this.data?.loadCourseTypes) {
            this.data.loadCourseTypes();
          }
          this.close();
        },
        error: (error: any) => {
          this.snackBar.open('Error updating course type', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Create new course type
      this.lookupService.createCourseType(name).subscribe({
        next: () => {
          this.snackBar.open('Course type created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          if (this.data?.loadCourseTypes) {
            this.data.loadCourseTypes();
          }
          this.close();
        },
        error: (error: any) => {
          this.snackBar.open('Error creating course type', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}

// Confirmation Dialog Component
@Component({
  selector: 'confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule
  ],
  template: `
    <div class="confirm-dialog">
      <h2 mat-dialog-title>{{ data.title || 'Confirm' }}</h2>
      <mat-dialog-content>
        <p>{{ data.message || 'Are you sure you want to proceed?' }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="close(false)">Cancel</button>
        <button mat-flat-button [color]="data.buttonColor || 'warn'" (click)="close(true)">{{ data.buttonText || 'Confirm' }}</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 20px;
    }
    .confirm-dialog h2 {
      margin: 0 0 16px 0;
    }
    .confirm-dialog p {
      margin: 0;
    }
    mat-dialog-actions {
      margin-top: 20px;
    }
  `]
})
export class ConfirmDeleteDialog {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string; buttonText?: string; buttonColor?: string }
  ) {}

  close(result: boolean): void {
    this.dialogRef.close(result);
  }
}


