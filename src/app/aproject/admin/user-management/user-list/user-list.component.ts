import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, ViewChild, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { UserAdmin, PaginatedResponse } from '../../../../models/user.models';
import { ApiUserServices } from '../../../../services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Level } from '../../../../models/lookup.model';
import { ApiCourseServices } from '../../../../services/course.service';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-admin-user-list',
    imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    MatTooltip
],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
})
export class AdminUserList implements OnInit, AfterViewInit {
    constructor(private router: Router, private apiUserService: ApiUserServices, private snack: MatSnackBar, private dialog: MatDialog) {}

    displayedColumns: string[] = [
        'id',
        'name',
        'email',
        'role',
        'status',
        'joinedDate',
        'action',
    ];

    roles = [
        { value: 1, label: 'Admin' },
        { value: 2, label: 'Manager' },
        { value: 3, label: 'Lecturer' },
        { value: 4, label: 'Employee' },
    ];

    data = new MatTableDataSource<UserAdmin>([]);
    searchTerm = '';
    
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;
    isLoading = false;

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
        this.apiUserService.getUserAdminList(page, pageSize, searchTerm).subscribe(
            (res: PaginatedResponse<UserAdmin>) => {
                this.data = new MatTableDataSource<UserAdmin>(res.items);
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

    ngAfterViewInit() {
        if (this.paginator) {
            this.paginator.pageSize = this.pageSize;
            this.paginator.length = this.totalItems;
            
            this.paginator.page.subscribe(event => {
                this.currentPage = event.pageIndex + 1;
                this.pageSize = event.pageSize;
                this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
            });
        }
        
        this.data.filterPredicate = () => true;
    }

    addUser() {
        this.dialog.open(CreateUserDialog, {
            width: '500px',
            data: { loadUsers: () => this.loadUsers() }
        });
    }

    goDetail(element: UserAdmin) {
        this.router.navigate([`/admin/users/${element.userId}`])
    }

    updateRole(element: UserAdmin, role: number) {
        this.apiUserService.updateUserRole(element.userId, role).subscribe(
            (res: any) => {
                this.snack.open('User role updated successfully', '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
            },
            error => {
                this.snack.open('Failed to update user role', '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                this.loadUsers(this.currentPage, this.pageSize, this.searchTerm);
            }
        );
    }

    banUser(element: UserAdmin, isActive: boolean) {
        this.apiUserService.banUser(element.userId, isActive).subscribe(
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
}

@Component({
    selector: 'create-user',
    templateUrl: './dialog-create-employee.html',
    imports:[CommonModule, FormsModule, ReactiveFormsModule],
    styleUrls: ['./user-list.component.scss']
})
export class CreateUserDialog {

    fb = inject(FormBuilder);
    userForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.maxLength(200)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
      levelId: [1, [Validators.required]],
      roleId: [4, [Validators.required]],
    });

    constructor(
            public dialogRef: MatDialogRef<CreateUserDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { loadUsers: () => void },
        private apiUserServices: ApiUserServices,
        private apiCourseServices: ApiCourseServices,
        private snack: MatSnackBar
    ) {}

    listLevel: Level[] = [];

    listRole: any[] = [
      { roleId: 1, name: 'Admin' },
      { roleId: 2, name: 'Manager' },
      { roleId: 3, name: 'Lecturer' },
      { roleId: 4, name: 'Employee' },
    ];

    ngOnInit() {
      this.apiCourseServices.getLevels().subscribe(
        (res: any) => {
            this.listLevel = res;
        }
      );
    }

    onSubmit() {
      this.userForm.markAllAsTouched();
      if (!this.userForm.valid) return;

      const payload = {
        fullName: this.userForm.value.fullName,
        email: this.userForm.value.email,
        roleId: this.userForm.value.roleId,
        levelId: this.userForm.value.levelId,
        roleIds: [this.userForm.value.roleId],
    };

      this.apiUserServices.createUser(payload).subscribe(
        (res: any) => {
          this.snack.open('User created successfully', '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
          if (this.data?.loadUsers) {
            this.data.loadUsers();
          }
          this.close();
        },
        (error: any) => {
          this.snack.open('Failed to create user. Please try again.', '', { duration: 3000, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        }
      );
    }


    close(){
        this.dialogRef.close(true);
    }

}