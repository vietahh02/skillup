import { Component, inject, Inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon, MatIconModule } from "@angular/material/icon";
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
import { CourseDetail, Lesson, SubLesson } from '../../../../models/course.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiCourseServices } from '../../../../services/course.service';
import { ConfirmDialogComponent } from '../../../../common/confirm-dialog/confirm-dialog.component';
import { VideoPlayerDialog } from './video-player-dialog/video-player-dialog';
import { QuizResponse } from '../../../../models/quiz.models';
import { QuizService } from '../../../../services/quiz.service';

@Component({
  selector: 'app-drag-table',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatPaginatorModule, MatIcon, DragDropModule, CommonModule, FormsModule, RouterLink, MatDialogModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatTooltipModule, MatExpansionModule, MatChipsModule, ReactiveFormsModule]
})
export class LecturerCourseDetail {
  constructor(public dialog: MatDialog, public router: Router, 
    private route: ActivatedRoute, private courseService: ApiCourseServices, 
    private snack: MatSnackBar, private quizService: QuizService) {}
  id!: string;

  dataSource = new MatTableDataSource();
  searchTerm = '';
  lessons: Lesson[] = [];
  courseDetail: CourseDetail | null = null;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.getCourseDetail();
  }

  maxLengthText(text: string) : boolean {
    return text.length > 20;
  }

  formatText(text: string) : string {
      return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
  }

  getCourseDetail() {

    this.courseService.getCourseById(Number(this.id)).subscribe((courseDetail: CourseDetail) => {
      this.lessons = courseDetail.lessons;
      this.courseDetail = courseDetail;
      
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
          this.getCourseDetail();
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

  formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
  
    let result = '';
  
    if (h > 0) {
      result += `${h}h`;
    }
    if (m > 0) {
      result += `${m}m`;
    }
    if (s > 0 && h === 0) { 
      result += `${s}s`;
    } else if (s > 0 && h > 0 && m === 0) {
      result += `${s}s`;
    }
  
    if (result === '') {
      return '0s';
    }
  
    return result;
  }

  getTimeAgo(date: string | number) {
    if (!date) {
      return 'never';
    }

    const now = new Date();
    const dateObj = new Date(date);
    const diff = now.getTime() - dateObj.getTime();
    
    if (diff < 0) {
      return 'just now';
    }

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return `${years} ${years > 1 ? 'years' : 'year'} ago`;
    } else if (months > 0) {
      return `${months} ${months > 1 ? 'months' : 'month'} ago`;
    } else if (days > 0) {
      return `${days} ${days > 1 ? 'days' : 'day'} ago`;
    } else if (hours > 0) {
      return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
    } else if (minutes > 0) {
      return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
    } else if (seconds > 5) {
      return `${seconds} ${seconds > 1 ? 'seconds' : 'second'} ago`;
    } else {
      return 'few seconds ago';
    }
}

  isDraftCourse(): boolean {
    return this.courseDetail?.status === 'Draft' || this.courseDetail?.status === 'Rejected';
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

  viewQuiz() {
    // Load full quiz data including questions before opening dialog
    this.quizService.getQuizByCourseId(Number(this.id)).subscribe({
      next: (fullQuizData) => {
        // Open dialog with full data
        this.dialog.open(ViewQuizDialog, {
          width: '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          data: fullQuizData
        });
      },
      error: (error) => {
        console.error('Error loading quiz details:', error);
        this.snack.open('Error loading quiz details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    });
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
        this.getCourseDetail();
      }
    });
  }

  openDocumentDialog(): void {
    this.dialog.open(DocumentDialog, {
      width: '1000px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: {
        courseId: this.id,
        isDraftCourse: this.isDraftCourse()
      }
    });
  }

  openVideoDialog(subLesson: SubLesson): void {
    this.dialog.open(VideoPlayerDialog, {
        width: '900px',
        maxWidth: '95vw',
        // maxHeight: '90vh',
        data: subLesson,
        panelClass: 'video-dialog-container'
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
          load: () => this.getCourseDetail(),
          subLesson
        }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleSubLessonResult(lesson, result, subLesson);
      }
    });
  }

  completeCourse() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        type: 'warning',
        title: 'Complete Course',
        message: 'Are you sure you want to complete this course?',
        confirmText: 'Complete',
        cancelText: 'Cancel',
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }

      this.courseService.completeCourse(Number(this.id)).subscribe({
        next: () => {
          this.router.navigate([`lecturer/courses`]);
          this.snack.open('Course completed successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        },
        error: (error: any) => {
          this.snack.open(error.error || 'Failed to complete course', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
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
    private courseService: ApiCourseServices
  ) {}

  courseId!: number | string;
  lessonId!: number | string;

  fb = inject(FormBuilder);
  lessonForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
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

// View Quiz Dialog
@Component({
  selector: 'view-quiz-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule],
  template: `
    <div class="view-quiz-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <div class="title-content">
          <mat-icon>quiz</mat-icon>
          <span>{{ data.title }}</span>
        </div>
        <button mat-icon-button (click)="onClose()">
          <mat-icon>close</mat-icon>
        </button>
      </h2>

      <mat-dialog-content class="dialog-content">
        <!-- Quiz Info Section -->
        <div class="info-section">
          <div class="info-grid">
            <div class="info-item">
              <mat-icon>school</mat-icon>
              <div class="info-content">
                <span class="label">Course</span>
                <span class="value">{{ data.courseName }}</span>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>percent</mat-icon>
              <div class="info-content">
                <span class="label">Pass Score</span>
                <span class="value">{{ data.passScore }}%</span>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>repeat</mat-icon>
              <div class="info-content">
                <span class="label">Attempt Limit</span>
                <span class="value">{{ data.attemptLimit === 0 ? 'Unlimited' : data.attemptLimit }}</span>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>quiz</mat-icon>
              <div class="info-content">
                <span class="label">Questions</span>
                <span class="value">{{ data.questions.length || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Questions List -->
        <div class="questions-section">
          <h3>
            <mat-icon>list</mat-icon>
            Questions ({{ data.questions.length || 0 }})
          </h3>

          <div *ngIf="!data.questions || data.questions.length === 0" class="no-questions">
            <mat-icon>info</mat-icon>
            <p>No questions available</p>
          </div>

          <div *ngFor="let question of data.questions; let i = index" class="question-card">
            <div class="question-header">
              <span class="question-number">Question {{ i + 1 }}</span>
              <mat-chip class="type-chip" [class]="getQuestionTypeClass(question.questionType)">
                {{ getQuestionTypeLabel(question.questionType) }}
              </mat-chip>
            </div>

            <div class="question-body">
              <p class="question-title">{{ question.title }}</p>
              <div class="question-details">
                <span class="points">
                  <mat-icon>star</mat-icon>
                  {{ question.points }} points
                </span>
              </div>

              <!-- Answer Options -->
              <div *ngIf="question.answerOptions && question.answerOptions.length > 0" class="answer-options">
                <div *ngFor="let option of question.answerOptions; let j = index"
                     class="answer-option"
                     [class.correct]="option.isCorrect">
                  <span class="option-label">{{ getLetter(j) }}</span>
                  <span class="option-content">{{ option.content }}</span>
                  <mat-icon *ngIf="option.isCorrect" class="correct-icon">check_circle</mat-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onClose()">
          <mat-icon>close</mat-icon>
          Close
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .view-quiz-dialog {
      .dialog-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        color: #2d3748;
        font-weight: 600;
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        margin: 0;

        .title-content {
          display: flex;
          align-items: center;
          gap: 12px;

          mat-icon {
            color: #3b82f6;
            font-size: 28px;
          }
        }
      }

      .dialog-content {
        padding: 0;
        max-height: 70vh;
        overflow-y: auto;

        .info-section {
          padding: 24px;
          background: #f8fafc;

          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;

            .info-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e2e8f0;

              mat-icon {
                color: #3b82f6;
                font-size: 24px;
              }

              .info-content {
                display: flex;
                flex-direction: column;
                gap: 4px;

                .label {
                  font-size: 12px;
                  color: #64748b;
                  font-weight: 500;
                }

                .value {
                  font-size: 16px;
                  color: #1e293b;
                  font-weight: 600;
                }
              }
            }
          }
        }

        mat-divider {
          margin: 0;
        }

        .questions-section {
          padding: 24px;

          h3 {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 20px 0;

            mat-icon {
              color: #3b82f6;
            }
          }

          .no-questions {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;

            mat-icon {
              font-size: 48px;
              display: block;
              margin-bottom: 12px;
            }

            p {
              margin: 0;
              font-size: 14px;
            }
          }

          .question-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 16px;
            transition: box-shadow 0.2s;

            &:hover {
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .question-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 12px;

              .question-number {
                font-weight: 600;
                color: #3b82f6;
                font-size: 14px;
              }

              .type-chip {
                font-size: 11px;
                padding: 4px 12px;
                height: 24px;

                &.SingleChoice {
                  background: #dbeafe;
                  color: #1e40af;
                }

                &.MultipleChoice {
                  background: #fce7f3;
                  color: #be185d;
                }

                &.TrueFalse {
                  background: #fef3c7;
                  color: #92400e;
                }

                &.Text {
                  background: #dcfce7;
                  color: #166534;
                }
              }
            }

            .question-body {
              .question-title {
                font-size: 15px;
                font-weight: 500;
                color: #1e293b;
                margin: 0 0 12px 0;
                line-height: 1.6;
              }

              .question-details {
                display: flex;
                align-items: center;
                gap: 16px;
                margin-bottom: 16px;

                .points {
                  display: flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  color: #64748b;

                  mat-icon {
                    font-size: 16px;
                    color: #f59e0b;
                  }
                }
              }

              .answer-options {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-top: 16px;

                .answer-option {
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  padding: 12px 16px;
                  background: #f8fafc;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                  transition: all 0.2s;

                  &.correct {
                    background: #dcfce7;
                    border-color: #22c55e;
                  }

                  .option-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    background: white;
                    border: 2px solid #cbd5e1;
                    border-radius: 50%;
                    font-weight: 600;
                    font-size: 13px;
                    color: #475569;
                  }

                  &.correct .option-label {
                    background: #22c55e;
                    border-color: #22c55e;
                    color: white;
                  }

                  .option-content {
                    flex: 1;
                    font-size: 14px;
                    color: #334155;
                  }

                  .correct-icon {
                    color: #22c55e;
                    font-size: 20px;
                  }
                }
              }
            }
          }
        }
      }

      .dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        justify-content: flex-end;

        button mat-icon {
          margin-right: 6px;
        }
      }
    }
  `]
})
export class ViewQuizDialog {
  constructor(
    public dialogRef: MatDialogRef<ViewQuizDialog>,
    @Inject(MAT_DIALOG_DATA) public data: QuizResponse
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  /**
   * Convert questionType (number or string) to display string and CSS class
   */
  getQuestionTypeClass(type: string | number): string {
    // If it's a number from backend, convert to string
    if (typeof type === 'number') {
      switch (type) {
        case 0: return 'single_choice';
        case 1: return 'multiple_choice';
        case 2: return 'true_false';
        case 3: return 'text';
        default: return 'single_choice';
      }
    }
    // Already a string
    return type;
  }

  /**
   * Get display label for questionType
   */
  getQuestionTypeLabel(type: string | number): string {
    const typeString = this.getQuestionTypeClass(type);
    switch (typeString) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'true_false': return 'True/False';
      case 'text': return 'Text';
      default: return typeString;
    }
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D...
  }
}