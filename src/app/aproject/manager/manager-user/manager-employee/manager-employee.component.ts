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
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { UserManager } from '../../../../models/user.models';
import { ApiUserServices } from '../../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Level } from '../../../../models/lookup.model';
import { ApiCourseServices } from '../../../../services/course.service';
import { MatTooltip } from "@angular/material/tooltip";
import { ChatBoxComponent } from '../../../../shared/chat-box/chat-box.component';

@Component({
    selector: 'app-manager-employee',
    imports: [FormsModule, MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatPaginatorModule, MatProgressBarModule, MatCheckboxModule, CommonModule, MatIcon, MatIconModule, MatTooltip],
    templateUrl: './manager-employee.component.html',
    styleUrls: ['./manager-employee.component.scss']
})
export class ManagerEmployee {
  constructor(private router: Router,public dialog: MatDialog, private apiUserServices: ApiUserServices,
     private snack: MatSnackBar, private apiCourseServices: ApiCourseServices) {
     }

  displayedColumns: string[] = ['user','progress', 'email', 'level','courses', 'role', 'status', 'action'];
  dataSource = new MatTableDataSource<UserManager>([]);
  searchTerm = '';
  
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  isDownloading = false;
  isImporting = false;

  levelOptions: Level[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
      this.loadUsers();
      this.loadLevels();
  }

  
  maxLengthText(text: string) : boolean {
    return text.length > 20;
}

formatText(text: string) : string {
    return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
}

  loadUsers(page: number = 1, pageSize: number = 10, searchTerm?: string) {
    this.isLoading = true;
    this.apiUserServices.getEmployeeManagerList(page, pageSize, searchTerm).subscribe(
      (res: any) => {
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

  loadLevels() {
    this.apiCourseServices.getLevels().subscribe(
      (res: any) => {
        this.levelOptions = res;
      }
    );
  }

  changeLevel(element: UserManager, level: Level) {

    this.apiUserServices.updateUserLevel(element.userId, level.levelId.toString()).subscribe(
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

  openCreateEmployeeDialog(enterAnimationDuration: string, exitAnimationDuration: string): void {
      this.dialog.open(CreateEmployeeDialog, {
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
      if (event.pageSize !== this.pageSize) {
        this.onPageSizeChange(event.pageSize);
      } else {
        this.onPageChange(event.pageIndex + 1);
      }
      this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
  }

  onPageSizeChange(s: number) {
    this.pageSize = s;
    this.currentPage = 1;
    this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
  }

  onPageChange(p: number) {
    this.currentPage = p;
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
        this.isImporting = false;
        
        // Check if there are errors (new logic: if any error, successCount = 0)
        if (res.errorCount > 0 || res.successCount === 0) {
          // Show error dialog with detailed error list
          this.dialog.open(ImportErrorDialog, {
            width: '600px',
            data: {
              totalRows: res.totalRows || 0,
              errorCount: res.errorCount || 0,
              errors: res.errors || []
            }
          });
        } else {
          // Success: show success message and reload
          this.snack.open(
            `Đã import thành công ${res.successCount} người dùng!`, 
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
        }
        
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        let errorMessage = 'Không thể import file Excel. Vui lòng thử lại.';
        
        // Handle specific error messages from backend
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.snack.open(errorMessage, '', {
          duration: 5000,
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
    selector: 'create-employee',
    templateUrl: './dialog-create-employee.html',
    imports:[CommonModule, FormsModule, ReactiveFormsModule],
    styleUrls: ['./manager-employee.component.scss']
})
export class CreateEmployeeDialog {

    fb = inject(FormBuilder);
    employeeForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      levelId: [null as number | null, [Validators.required]],
    });

    constructor(
        public dialogRef: MatDialogRef<CreateEmployeeDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { loadUsers: () => void },
        private apiUserServices: ApiUserServices,
        private apiCourseServices: ApiCourseServices,
        private snack: MatSnackBar
    ) {}

    listLevel: Level[] = [];

    ngOnInit() {
      this.apiCourseServices.getLevels().subscribe(
        (res: any) => {
            this.listLevel = res;
        }
      );
      
    }

    onSubmit() {
      this.employeeForm.markAllAsTouched();
      if (!this.employeeForm.valid) return;

      this.apiUserServices.createEmployee(this.employeeForm.value).subscribe(
        (res: any) => {
          this.snack.open('Employee created successfully. Password has been sent to their email.', '', { duration: 4000, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          if (this.data?.loadUsers) {
            this.data.loadUsers();
          }
          this.close();
        },
        (error: any) => {
          let errorMessage = 'Failed to create employee. Please try again.';
          
          // Handle email domain validation error from backend
          if (error?.error?.error === 'InvalidEmailDomain') {
            errorMessage = error.error.message || 'Email must be from @skillup.com domain';
          }
          
          this.snack.open(errorMessage, '', { duration: 3000, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      );
    }


    close(){
        this.dialogRef.close(true);
    }

}

@Component({
    selector: 'import-error-dialog',
    template: `
        <h2 mat-dialog-title style="color: #f44336; margin-bottom: 16px;">
            <mat-icon style="vertical-align: middle; margin-right: 8px;">error</mat-icon>
            Import thất bại
        </h2>
        <mat-dialog-content>
            <p style="margin-bottom: 16px; font-weight: 500;">
                File Excel có lỗi. <strong>Toàn bộ file sẽ không được import.</strong> Vui lòng sửa file và thử lại.
            </p>
            <div style="margin-bottom: 8px;">
                <strong>Tổng số dòng:</strong> {{ data.totalRows }}<br>
                <strong>Số lỗi:</strong> {{ data.errorCount }}
            </div>
            <div style="max-height: 400px; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 4px; padding: 12px;">
                <div *ngFor="let error of data.errors" style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0;">
                    <div style="color: #f44336; font-weight: 500; margin-bottom: 4px;">
                        Dòng {{ error.rowNumber }}:
                    </div>
                    <div style="color: #666;">
                        {{ error.message }}
                    </div>
                </div>
            </div>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button mat-dialog-close>Đóng</button>
        </mat-dialog-actions>
    `,
    imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule],
    styles: [`
        ::ng-deep .mat-mdc-dialog-content {
            max-height: 500px;
        }
    `]
})
export class ImportErrorDialog {
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {
            totalRows: number;
            errorCount: number;
            errors: Array<{ rowNumber: number; message: string }>;
        }
    ) {}
}