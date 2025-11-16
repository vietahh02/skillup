import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
        CommonModule
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
})
export class AdminUserList implements OnInit, AfterViewInit {
    constructor(private router: Router, private apiUserService: ApiUserServices, private snack: MatSnackBar) {}

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