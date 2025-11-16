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
import { Course, CoursePaginatedResponse } from '../../../../models/course.models';

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
],
    templateUrl: './course-list.component.html',
    styleUrls: ['./course-list.component.scss'],
})
export class LecturerCourseList implements AfterViewInit {
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

    constructor(public dialog: MatDialog, private dialogService: DialogService, private courseService: ApiCourseServices) {}

    ngOnInit() {
        this.loadCourses();
    }

    loadCourses(page: number = 1, pageSize: number = 10, searchTerm?: string) {
      this.courseService.getCourseListCreator(page, pageSize, searchTerm).subscribe((response: any) => {
        this.data = response;
        this.totalItems = response.total;
      });
    }

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    ngAfterViewInit() {}

    search() {
      this.loadCourses(this.currentPage, this.pageSize, this.searchTerm);
    }

    detailCourse(id: string| number) {
      this.router.navigate([`/lecturer/courses/${id}`])
    }

    openAddEditEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, id? : string | number): void {
      this.dialog.open(CreateCourse, {
          width: '600px',
          enterAnimationDuration,
          exitAnimationDuration,
          data:{
            id : id
          }
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
        this.data = this.data.filter((c: Course) => c.courseId !== course.courseId);
        this.totalItems--;
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
      name: ['', [Validators.required]],
      duration: [null as number | null, [Validators.required]],
      category: ['', [Validators.required]],
      level: ['', [Validators.required]],
      description: ['', []],
      image: [null as File | null, [Validators.required]],
    });

    isEdit = false;
    selectedImage: string | null = null;
    selectedFile: File | null = null;

    constructor(
        public dialogRef: MatDialogRef<CreateCourse>, @Inject(MAT_DIALOG_DATA) public data: any,
        private snack: MatSnackBar
    ) {}

    ngOnInit() {
      if (this.data.id) {
        this.isEdit = true;
        this.courseForm.patchValue({
          name: this.data.name,
          duration: this.data.duration,
          category: this.data.category,
          level: this.data.level,
          description: this.data.description,
          image: this.data.image,
        });
      }
    }

    close(){
        this.dialogRef.close(true);
    }

    onSubmit(): void {
      this.courseForm.markAllAsTouched();
      if (!this.courseForm.valid) return;

      if (this.isEdit) {
        this.snack.open('Course updated successfully', '', {
          duration: 3000,
          panelClass: ['success-snackbar', 'custom-snackbar']
        });
      } else {
        this.snack.open('Course created successfully', '', {
          duration: 3000,
          panelClass: ['success-snackbar', 'custom-snackbar']
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
              panelClass: ['error-snackbar', 'custom-snackbar']
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.snack.open('File size must be less than 5MB', '', {
              duration: 3000,
              panelClass: ['error-snackbar', 'custom-snackbar']
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

    listCourseTypes: string[] = [
      'JavaScript',
      'Python',
      'Java',
      'C#',
      'C++',
      'TypeScript',
      'Go',
      'Rust',
      'Kotlin',
      'Swift',
      'Other',
    ];

    listLevels: string[] = [
      'Intern',
      'Fresher',
      'Junior',
      'Middle',
      'Senior',
      'Other',
    ];


}

const fakeCourses = [
  {
    id: 1,
    name: 'Introduction to React',
    type: 'JavaScript',
    time: 30,
    role: 'Intern',
    status: 'Approved',
  },
  {
    id: 2,
    name: 'Advanced JavaScript',
    type: 'JavaScript',
    time: 45,
    role: 'Junior',
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Spring Boot for Beginners',
    type: 'Java',
    time: 60,
    role: 'Fresher',
    status: 'Approved',
  },
  {
    id: 4,
    name: 'Building APIs with Go',
    type: 'Go',
    time: 25,
    role: 'Middle',
    status: 'Rejected',
  },
  {
    id: 5,
    name: 'Data Science with Python',
    type: 'Python',
    time: 75,
    role: 'Senior',
    status: 'Approved',
  },
  {
    id: 6,
    name: 'Mobile Development with Kotlin',
    type: 'Kotlin',
    time: 40,
    role: 'Fresher',
    status: 'Draft',
  },
  {
    id: 7,
    name: 'Swift for iOS Development',
    type: 'Swift',
    time: 35,
    role: 'Junior',
    status: 'Rejected',
  },
  {
    id: 8,
    name: 'Rust for Systems Programming',
    type: 'Rust',
    time: 50,
    role: 'Senior',
    status: 'Approved',
  },
  {
    id: 9,
    name: 'C# Backend Development',
    type: 'C#',
    time: 42,
    role: 'Middle',
    status: 'Pending',
  },
  {
    id: 10,
    name: 'C++ Game Engine Development',
    type: 'C++',
    time: 65,
    role: 'Other',
    status: 'Draft',
  },
  {
    id: 11,
    name: 'TypeScript in Depth',
    type: 'TypeScript',
    time: 28,
    role: 'Fresher',
    status: 'Rejected',
  },
  {
    id: 12,
    name: 'Python for Data Analysis',
    type: 'Python',
    time: 80,
    role: 'Middle',
    status: 'Approved',
  },
  {
    id: 13,
    name: 'Modern Web Development with TypeScript',
    type: 'TypeScript',
    time: 55,
    role: 'Intern',
    status: 'Draft',
  },
];

