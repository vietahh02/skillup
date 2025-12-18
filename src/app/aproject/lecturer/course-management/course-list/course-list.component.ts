import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, Inject, ViewChild } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DialogService } from '../../../../services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiCourseServices } from '../../../../services/course.service';
import { Course, CourseCreateEdit, CourseDetail, CoursePaginatedResponse } from '../../../../models/course.models';
import { CourseType } from '../../../../models/lookup.model';
import { Level } from '../../../../models/lookup.model';
import { ApiLookupServices } from '../../../../services/lookup.service';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-lecturer-course-list',
    imports: [
    CommonModule,
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
    MatTooltip
],
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
})
export class LecturerCourseList {
    displayedColumns: string[] = [
        'courseId',
        'name',
        'courseType',
        'duration',
        'level',
        'status',
        'action',
    ];
    router = inject(Router)

    data: Course[] = [];
    searchTerm = '';
    totalItems = 0;
    currentPage = 1;
    pageSize = 10;

    constructor(public dialog: MatDialog, private dialogService: DialogService, private courseService: ApiCourseServices, private snack: MatSnackBar) {}

    ngOnInit() {
        this.loadCourses();
    }

    
    maxLengthText(text: string) : boolean {
      return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    loadCourses(page: number = 1, pageSize: number = 10, searchTerm?: string) {
      this.courseService.getCourseListCreator(page, pageSize, searchTerm).subscribe({
        next: (response: any) => {
          this.data = response.items || [];
          this.totalItems = response.total || 0;
          this.currentPage = response.page || 1;
          this.pageSize = response.pageSize || 10;
        },
        error: (error) => {
          this.snack.open(error.error || 'Failed to load courses', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.data = [];
          this.totalItems = 0;
        }
      });
    }

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    search() {
      this.currentPage = 1; // Reset to first page when searching
      this.loadCourses(this.currentPage, this.pageSize, this.searchTerm);
    }

    detailCourse(id: string| number) {
      this.router.navigate([`/lecturer/courses/${id}`])
    }

    openAddEditEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, id? : string | number): void {
      const dialogRef = this.dialog.open(CreateCourse, {
          width: '800px',
          maxWidth: '800px',
          enterAnimationDuration,
          exitAnimationDuration,
          data:{
            id : id
          }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Reload courses list after successful create/edit
          this.loadCourses(this.currentPage, this.pageSize, this.searchTerm);
        }
      });
    }

    reasonReject(item: any) {
      this.dialogService.confirm({
        type: 'confirm',
        title: 'Reason Reject',
        message: `Reason: ${item.rejectionReason}`,
        confirmText: 'Close',
        isDisabledConfirm: false
      });
    }

    onDelete(course: Course) {
      this.dialogService.confirm({
        type: 'confirm',
        title: 'Confirmation',
        message: `Are you sure you want to Delete?`,
        confirmText: 'Yes',
        cancelText: 'No'
      }).subscribe((ok: boolean) => {
        if (!ok) {
          return;
        }
        
        // Call API to delete course
        this.courseService.deleteCourse(course.courseId).subscribe({
          next: () => {
            // Reload the courses list to get updated data from server
            this.loadCourses(this.currentPage, this.pageSize, this.searchTerm);
            this.snack.open('Course deleted successfully', '', {
              duration: 3000,
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          },
          error: (error) => {
            // Could show error snackbar here if needed
            this.snack.open(error.error || 'Failed to delete course', '', {
              duration: 3000,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          }
        });
      });
    }

  onPaginatorChange(event: PageEvent) {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadCourses(this.currentPage, this.pageSize, this.searchTerm);
  }
}

@Component({
    selector: 'create-course',
    templateUrl: './dialog-create-course.html',
    styleUrl: './course-list.component.scss',
    imports: [CommonModule, FormsModule, ReactiveFormsModule]
})
export class CreateCourse {

    fb = inject(FormBuilder);
    courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      courseType: [null as number | null, [Validators.required]],
      targetLevel: [null as number | null, [Validators.required]],
      duration: [null as number | null, [Validators.required, Validators.min(1), Validators.max(1000)]],
      image: [null as File | null, [Validators.required]],
    });

    isEdit = false;
    selectedImage: string | null = null;
    selectedFile: File | null = null;

    constructor(
        public dialogRef: MatDialogRef<CreateCourse>, @Inject(MAT_DIALOG_DATA) public data: any,
        private snack: MatSnackBar,
        private courseService: ApiCourseServices,
        private lookupService: ApiLookupServices
    ) {}

    ngOnInit() {
      this.loadOptions();
      if (this.data.id) {
        this.isEdit = true;
        this.courseService.getCourseById(this.data.id).subscribe((response: CourseDetail) => {
          this.courseForm.patchValue({
            name: response.name,
            duration: response.duration,
            courseType: response.courseTypeId,
            targetLevel: response.targetLevelId,
            description: response.description,
            image: new File([], response.imageUrl),
          });
          this.selectedImage = response.imageUrl;
        });
      }
    }

    close(){
      this.dialogRef.close(true);
    }

    onSubmit(): void {
      this.courseForm.markAllAsTouched();
      if (!this.courseForm.valid) return;

      const payload : CourseCreateEdit = {
        name: this.courseForm.value.name as string,
        description: this.courseForm.value.description as string,
        courseTypeId: this.courseForm.value.courseType as number,
        targetLevelId: this.courseForm.value.targetLevel as number,
        duration: this.courseForm.value.duration as number,
        imageUrl: this.courseForm.value.image as File,
      };

      if (this.isEdit) {
        this.courseService.updateCourse(this.data.id, payload).subscribe((response: any) => {
          this.snack.open('Course updated successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        }, (error: any) => {
          this.snack.open(error.error || 'Failed to update course', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        });
      } else {
        this.courseService.createCourse(payload).subscribe((response: any) => {
          this.snack.open('Course created successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        }, (error: any) => {
          this.snack.open(error.error || 'Failed to create course', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        });
      }
    }

    onImageSelected(event: Event): void {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.snack.open('Please select a valid image file', '', {
              duration: 3000,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.snack.open('File size must be less than 5MB', '', {
              duration: 3000,
              panelClass: ['error-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
            return;
        }

        this.selectedFile = file;
        
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
            this.selectedImage = e.target?.result as string;
        };
        reader.readAsDataURL(file);

        // Update form control
        this.courseForm.patchValue({ image: file });
      }
    }

    /**
     * Remove selected image
     */
    removeImage(): void {
      this.selectedImage = null;
      this.selectedFile = null;
      this.courseForm.patchValue({ image: null });
      
      // Reset file input
      const fileInput = document.getElementById('courseImage') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
    }

    listCourseTypes: CourseType[] = [];

    listLevels: Level[] = [];

    loadOptions() {
      this.lookupService.getLevels().subscribe((response: Level[]) => {
        this.listLevels = response;
      });
      this.lookupService.getCourseTypes().subscribe((response: CourseType[]) => {
        this.listCourseTypes = response;
      });
    }
}

