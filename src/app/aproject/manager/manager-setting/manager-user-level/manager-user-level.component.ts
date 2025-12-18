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
import { CourseType, Level } from '../../../../models/lookup.model';

@Component({
  selector: 'app-manager-user-level',
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
  templateUrl: './manager-user-level.component.html',
  styleUrls: ['./manager-user-level.component.scss']
})
export class ManagerUserLevelComponent implements OnInit {
  displayedColumns: string[] = ['levelId', 'name', 'isActive', 'action'];
  data: Level[] = [];
  levels: Level[] = [];

  searchTerm: string = '';

  constructor(
    private lookupService: ApiLookupServices,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLevels();
  }

  loadLevels(): void {
    this.lookupService.getLevels().subscribe({
      next: (response: Level[]) => {
        this.levels = response;
        this.data = response;
      },
      error: (error: any) => {
        this.snackBar.open('Error loading levels', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      }
    });
  }

  search(): void {
    this.data = this.levels.filter(level => level.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }

  openAddEditLevelDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
    const dialogRef = this.dialog.open(UserLevelDialog, {
      width: '500px',
      maxWidth: '95vw',
      enterAnimationDuration,
      exitAnimationDuration,
      data: {
        level: null,
        loadLevels: () => this.loadLevels()
      }
    });
  }

  editLevel(level: Level): void {
    const dialogRef = this.dialog.open(UserLevelDialog, {
      width: '500px',
      maxWidth: '95vw',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '100ms',
      data: {
        level: level,
        loadLevels: () => this.loadLevels()
      }
    });
  }

  toggleActive(level: Level): void {
    const newStatus = !level.isActive;
    const action = newStatus ? 'activate' : 'deactivate';
    const actionTitle = newStatus ? 'Activate' : 'Deactivate';
    const confirmMsg = `Are you sure you want to ${action} "${level.name}"?`;

    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: {
        title: `${actionTitle} Level`,
        message: confirmMsg,
        buttonText: actionTitle,
        buttonColor: newStatus ? 'primary' : 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lookupService.activateUserLevel(level.levelId, newStatus).subscribe({
          next: () => {
            this.snackBar.open(`Level ${action}d successfully`, 'Close', { 
              duration: 3000, 
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.loadLevels();
          },
          error: (error: any) => {
            this.snackBar.open(`Error ${action}ing level`, 'Close', { 
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

  deleteLevel(level: Level): void {
    // Show confirmation dialog
    const dialogRef = this.dialog.open(ConfirmDeleteDialog, {
      width: '400px',
      data: {
        title: 'Delete Level',
        message: `Are you sure you want to delete "${level.name}"? This action cannot be undone.`
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.lookupService.deleteLevel(level.levelId).subscribe({
          next: () => {
            this.snackBar.open('Level deleted successfully', 'Close', { 
              duration: 3000, 
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            this.loadLevels();
          },
          error: (error: any) => {
            this.snackBar.open('Error deleting level', 'Close', { 
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

// Dialog Component for Add/Edit Level
@Component({
  selector: 'user-level-dialog',
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
  templateUrl: './dialog-user-level.html',
  styleUrls: ['./manager-user-level.component.scss']
})
export class UserLevelDialog {
  fb = inject(FormBuilder);
  levelForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]]
  });

  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<UserLevelDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      level: Level | null;
      loadLevels: () => void;
    },
    private lookupService: ApiLookupServices,
    private snackBar: MatSnackBar
  ) {
    if (data.level) {
      this.isEditMode = true;
      this.levelForm.patchValue({
        name: data.level.name
      });
    }
  }

  onSubmit(): void {
    this.levelForm.markAllAsTouched();
    if (!this.levelForm.valid) return;

    const name = this.levelForm.get('name')?.value?.trim();
    if (!name) return;

    if (this.isEditMode && this.data.level) {
      // Update existing level
      this.lookupService.updateLevel(this.data.level.levelId, name).subscribe({
        next: () => {
          this.snackBar.open('Level updated successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          if (this.data?.loadLevels) {
            this.data.loadLevels();
          }
          this.close();
        },
        error: (error: any) => {
          this.snackBar.open('Error updating level', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      // Create new level
      this.lookupService.createLevel(name).subscribe({
        next: () => {
          this.snackBar.open('Level created successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          if (this.data?.loadLevels) {
            this.data.loadLevels();
          }
          this.close();
        },
        error: (error: any) => {
          this.snackBar.open('Error creating level', 'Close', {
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


