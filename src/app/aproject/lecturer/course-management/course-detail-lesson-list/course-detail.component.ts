import { Component, inject, Inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocumentDialog } from './document-dialog/document-dialog.component';
import { CreateSubLesson } from './sub-lesson-dialog/dialog-creat-sublesson';
import { Lesson, SubLesson } from '../../../../models/course.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiCourseServices } from '../../../../services/course.service';
import { ConfirmDialogComponent } from '../../../../common/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-drag-table',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatPaginatorModule, MatIcon, DragDropModule, CommonModule, FormsModule, RouterLink, MatDialogModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatTooltipModule, MatExpansionModule, MatChipsModule, ReactiveFormsModule]
})
export class LecturerCourseDetail {
  constructor(public dialog: MatDialog, public router: Router, private route: ActivatedRoute, private courseService: ApiCourseServices, private snack: MatSnackBar) {}
  id!: string;

  dataSource = new MatTableDataSource();
  searchTerm = '';
  lessons: Lesson[] = [];

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.getLessons();
  }

  getLessons() {
    this.courseService.getLessons(this.id).subscribe((lessons: Lesson[]) => {
      this.lessons = lessons;
    });
  }

  deleteLesson(lessonId: number | string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        type: 'warning',
        title: 'Delete Lesson',
        message: 'Are you sure you want to delete this lesson?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        destructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courseService.deleteLesson(lessonId).subscribe({
          next: () => {
          this.getLessons();
          this.snack.open('Lesson deleted successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        },
        error: (error: any) => {
          this.snack.open('Failed to delete lesson', '', {
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

  dropLesson(event: CdkDragDrop<Lesson[]>) {
    // Lưu orderIndex của 2 lesson cần swap
    const prev = this.lessons[event.previousIndex];
    const current = this.lessons[event.currentIndex];

    const previousOrderIndex = prev.orderIndex;
    const currentOrderIndex = current.orderIndex;
    
    // Move items in array
    moveItemInArray(this.lessons, event.previousIndex, event.currentIndex);
    
    // Swap orderIndex của 2 lesson
    current.orderIndex = previousOrderIndex;
    prev.orderIndex = currentOrderIndex;
    
    this.courseService.reorderLessons({
      courseId: Number(this.id),
      lessons: this.lessons.map((lesson: Lesson) => ({
        lessonId: lesson.lessonId as number,
        orderIndex: lesson.orderIndex as number
      }))
    }).subscribe({
      next: () => {
        this.snack.open('Lessons reordered successfully', '', {
          duration: 3000,
          panelClass: ['success-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      error: (error: any) => {
        this.snack.open('Failed to reorder lessons', '', {
          duration: 3000,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
  }

  dropSubLesson(event: CdkDragDrop<SubLesson[]>, lesson: Lesson) {
    if (lesson.subLessons) {
      // Lưu orderIndex của 2 sub-lesson cần swap
      const previousOrderIndex = lesson.subLessons[event.previousIndex].orderIndex;
      const currentOrderIndex = lesson.subLessons[event.currentIndex].orderIndex;
      
      // Move items in array
      moveItemInArray(lesson.subLessons, event.previousIndex, event.currentIndex);
      
      // Swap orderIndex của 2 sub-lesson
      if (previousOrderIndex !== undefined && currentOrderIndex !== undefined) {
        lesson.subLessons[event.currentIndex].orderIndex = previousOrderIndex;
        lesson.subLessons[event.previousIndex].orderIndex = currentOrderIndex;
      }
      
      this.lessons = [...this.lessons];
    }
  }

  detailLesson(lesson:any) {
    this.router.navigate([`lecturer/courses/lesson/${lesson.id}`])
  }

  finalQuiz() {
    this.router.navigate([`lecturer/courses/${this.id}/quiz`])
  }

  openAddEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, lesson?: any): void {
    this.dialog.open(CreateCourse, {
        width: '600px',
        enterAnimationDuration,
        exitAnimationDuration,
        data:{
          lesson, 
          courseId: this.id
        }
    },
    ).afterClosed().subscribe(result => {
      if (result) {
        this.getLessons();
      }
    });
  }

  openDocumentDialog(): void {
    this.dialog.open(DocumentDialog, {
      width: '1000px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: {
        courseId: this.id
      }
    });
  }

  openSubLessonDialog(enterAnimationDuration: string, exitAnimationDuration: string, lesson: Lesson, subLesson?: SubLesson): void {
    const dialogRef = this.dialog.open(CreateSubLesson, {
        width: '600px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: {
          lesson,
          courseId: this.id,
          load: () => this.getLessons(),
          subLesson
        }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleSubLessonResult(lesson, result, subLesson);
      }
    });
  }

  deleteSubLesson(subLessonId: number | string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        type: 'warning',
        title: 'Delete Sub Lesson',
        message: 'Are you sure you want to delete this sub lesson?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        destructive: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.courseService.deleteSubLesson(subLessonId).subscribe({
          next: () => {
            this.lessons = this.lessons.map((lesson: Lesson) => {
              if (lesson.subLessons) {
                lesson.subLessons = lesson.subLessons.filter(subLesson => subLesson.id !== subLessonId);
              }
              return lesson;
            });
            this.snack.open('Sub lesson deleted successfully', '', {
              duration: 3000,
              panelClass: ['success-snackbar', 'custom-snackbar'],
              horizontalPosition: 'right',
              verticalPosition: 'top'
            });
          },
          error: (error: any) => {
            this.snack.open('Failed to delete sub lesson', '', {
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

  private handleSubLessonResult(lesson: Lesson, subLessonData: any, existingSubLesson?: SubLesson): void {
    if (!lesson.subLessons) {
      lesson.subLessons = [];
    }

    if (existingSubLesson) {
      const index = lesson.subLessons.findIndex(sl => sl.id === existingSubLesson.id);
      if (index !== -1) {
        lesson.subLessons[index] = { ...existingSubLesson, ...subLessonData };
      }
    } else {
      const newSubLesson: SubLesson = {
        id: Date.now(),
        ...subLessonData
      };
      lesson.subLessons.push(newSubLesson);
    }

    this.lessons = [...this.lessons];
  }

  search() {}
}

@Component({
    selector: 'create-course',
    templateUrl: './dialog-create-lesson.html',
    styleUrls: ['./course-detail.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class CreateCourse {

  constructor(
    public dialogRef: MatDialogRef<CreateCourse>, @Inject(MAT_DIALOG_DATA) public data: any,
    private snack: MatSnackBar,
    private courseService: ApiCourseServices,
  ) {}

  courseId!: number | string;
  lessonId!: number | string;

  fb = inject(FormBuilder);
  lessonForm = this.fb.group({
    name: ['', [Validators.required]],
    description: ['', []],
  });
  isEdit = false;
  
  ngOnInit() {
    this.courseId = this.data.courseId;
    this.lessonId = this.data.lesson?.lessonId;
    if (this.lessonId) {
      this.isEdit = true;
      this.courseService.detailLesson(this.lessonId).subscribe((lesson: Lesson) => {
        this.lessonForm.patchValue({
          name: lesson.title,
          description: lesson.description,
        });
      });
    }
  }

  onSubmit() {
    this.lessonForm.markAllAsTouched();
    if (!this.lessonForm.valid) return;

    const payload = {
      title: this.lessonForm.value.name,
      description: this.lessonForm.value.description,
    } as Lesson;
    if (this.isEdit) {
      this.courseService.updateLesson(this.lessonId as number, payload).subscribe({
        next: (lesson: Lesson) => {
          this.snack.open('Lesson updated successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.snack.open('Failed to update lesson', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      this.courseService.createLesson(this.courseId, payload).subscribe({
        next: (lesson: Lesson) => {
          this.snack.open('Lesson created successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.snack.open('Failed to create lesson', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }
  }

  close(){
      this.dialogRef.close(true);
  }

}
