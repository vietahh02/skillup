import { Component, Inject, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserManager } from '../../../../models/user.models';
import { ApiUserServices } from '../../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-manager-lecturer',
    imports: [FormsModule, MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatPaginatorModule, MatProgressBarModule, MatCheckboxModule, CommonModule, MatIcon, MatIconModule, MatTooltip],
    templateUrl: './manager-lecturer.component.html',
    styleUrls: ['./manager-lecturer.component.scss']
})
export class ManagerLecturer {
  constructor(private router: Router,public dialog: MatDialog, private apiUserServices: ApiUserServices, private snack: MatSnackBar) {}

  displayedColumns: string[] = ['user', 'email','courses', 'status', 'action'];
  dataSource = new MatTableDataSource<UserManager>([]);
  searchTerm = '';
  
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  isDownloading = false;
  isImporting = false;

  levelOptions: string[] = [
    "Assistant Manager",
    "Director",
    "Junior Developer",
    "Mid-level Developer",
    "Product Manager",
    "Senior Lecturer"
    ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
      this.loadUsers();
  }

  
  maxLengthText(text: string) : boolean {
    return text.length > 20;
}

formatText(text: string) : string {
    return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
}

  loadUsers(page: number = 1, pageSize: number = 10, searchTerm?: string) {
    this.isLoading = true;
    this.apiUserServices.getLecturerManagerList(page, pageSize, searchTerm).subscribe(
      (res: any) => {
        console.log(res);
        this.dataSource = res.items;
        this.totalItems = res.total;
        this.currentPage = res.page;
        this.pageSize = res.pageSize;
        
        if (this.paginator) {
            this.paginator.length = this.totalItems;
            this.paginator.pageSize = this.pageSize;
            this.paginator.pageIndex = this.currentPage - 1;
        }
        
        this.isLoading = false;
      }, 
      error => {
        this.isLoading = false;
      }
    );
  }

  changeLevel(element: UserManager, level: string) {

    this.apiUserServices.updateUserLevel(element.userId, level).subscribe(
        (res: any) => {
            this.snack.open('User level updated successfully', '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
        },
        error => {
            this.snack.open('Failed to update user level', '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
        }
    );
  }

  ngAfterViewInit() {
      this.dataSource.paginator = this.paginator;
  }

  goDetail(element: any) {
      this.router.navigate([`/manager/users/${element.userId}`])
  }

  openCreateLecturerDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
      this.dialog.open(CreateLecturerDialog, {
          width: '600px',
          enterAnimationDuration,
          exitAnimationDuration,
          data: {
            loadUsers: () => this.loadUsers(this.currentPage, this.pageSize, this.searchTerm)
          }
      });
  }

  banUser(element: UserManager, isActive: boolean) {
    this.apiUserServices.banUser(element.userId, isActive).subscribe(
        (res: any) => {
            this.snack.open('User banned successfully', '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
        },
        error => {
            this.snack.open('Failed to ban user', '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
        }
    );
  }

  search() {
    this.currentPage = 1;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
  }

  onPaginatorChange(event: PageEvent) {
      this.currentPage = event.pageIndex + 1;
      this.pageSize = event.pageSize;
      this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
  }

  downloadTemplate() {
    this.isDownloading = true;
    
    this.apiUserServices.downloadTemplate().subscribe({
      next: (blob: Blob) => {
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        
        // Generate filename with current date
        const currentDate = new Date();
        const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        const filename = `user-import-template-${dateString}.xlsx`;
        
        link.download = filename;
        link.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        link.remove();
        
        this.snack.open('Template downloaded successfully!', '', {
          duration: 3000,
          panelClass: ['success-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        
        this.isDownloading = false;
      },
      error: (error) => {
        console.error('Download error:', error);
        this.snack.open('Failed to download template. Please try again.', '', {
          duration: 3000,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        this.isDownloading = false;
      }
    });
  }

  /**
   * Trigger the hidden file input
   */
  triggerFileInput(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  /**
   * Handle file selection event
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.validateAndImportFile(file);
    }
  }

  /**
   * Validate file and import if valid
   */
  validateAndImportFile(file: File): void {
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedTypes.includes(file.type)) {
      this.snack.open('Please select a valid Excel file (.xlsx or .xls)', '', {
        duration: 3000,
        panelClass: ['error-snackbar', 'custom-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.snack.open('File size must be less than 10MB', '', {
        duration: 3000,
        panelClass: ['error-snackbar', 'custom-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
      return;
    }

    // Import the file
    this.importExcel(file);
  }

  /**
   * Import Excel file
   */
  importExcel(file: File): void {
    this.isImporting = true;

    this.apiUserServices.importExcel(file).subscribe({
      next: (res: any) => {
        console.log('Import response:', res);
        
        // Show success message
        this.snack.open(
          res.message || 'Excel file imported successfully!', 
          '', 
          { 
            duration: 3000, 
            panelClass: ['success-snackbar', 'custom-snackbar'], 
            horizontalPosition: 'right', 
            verticalPosition: 'top' 
          }
        );
        
        // Reload user list to show imported users
        this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
        this.isImporting = false;
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        console.error('Import error:', error);
        
        let errorMessage = 'Failed to import Excel file. Please try again.';
        
        // Handle specific error messages from backend
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.snack.open(errorMessage, '', {
          duration: 4000,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
        
        this.isImporting = false;
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      }
    });
  }
}

@Component({
    selector: 'create-lecturer',
    templateUrl: './dialog-create-lecturer.html',
    imports:[CommonModule, FormsModule, ReactiveFormsModule],
    styleUrls: ['./manager-lecturer.component.scss']
})
export class CreateLecturerDialog {

    fb = inject(FormBuilder);
    lecturerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    });
    
    constructor(
        public dialogRef: MatDialogRef<CreateLecturerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { loadUsers: () => void },
        private apiUserServices: ApiUserServices,
        private snack: MatSnackBar
    ) {}

    close(){
        this.dialogRef.close(true);
    }

    onSubmit() {
      this.lecturerForm.markAllAsTouched();
      if (this.lecturerForm.invalid) return;

      this.apiUserServices.createLecturer(this.lecturerForm.value).subscribe({
        next: (res: any) => {
          
          this.snack.open('Lecturer created successfully. Password has been sent to their email.', '', { 
            duration: 4000, 
            panelClass: ['success-snackbar', 'custom-snackbar'], 
            horizontalPosition: 'right', 
            verticalPosition: 'top' 
          });
          
          // Reload users list
          if (this.data?.loadUsers) {
            this.data.loadUsers();
          }
          
          // Close dialog
          this.close();
        },
        error: (error: any) => {
          console.error('Error creating lecturer:', error);
          let errorMessage = 'Failed to create lecturer. Please try again.';
          
          // Handle email domain validation error from backend
          if (error?.error?.error === 'InvalidEmailDomain') {
            errorMessage = error.error.message || 'Email must be from @skillup.com domain';
          }
          
          this.snack.open(errorMessage, '', { 
            duration: 3000, 
            panelClass: ['error-snackbar', 'custom-snackbar'], 
            horizontalPosition: 'right', 
            verticalPosition: 'top' 
          });
        }
      });
    }
}