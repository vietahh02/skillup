import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule, MatTooltip } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { QuizService } from '../../../../services/quiz.service';
import { QuizResponse, Question } from '../../../../models/quiz.models';

@Component({
  selector: 'app-quiz-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './quiz-list.component.html',
  styleUrls: ['./quiz-list.component.scss']
})
export class QuizListComponent implements OnInit {
  displayedColumns: string[] = ['quizId', 'title', 'courseName', 'questionsCount', 'passScore', 'attemptLimit', 'createdAt', 'action'];
  data: QuizResponse[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  pageSize: number = 10;
  totalItems: number = 0;
  isLoading: boolean = false;

  constructor(
    private quizService: QuizService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  maxLengthText(text: string) : boolean {
    return text.length > 20;
  }

  formatText(text: string) : string {
    return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
  }

  loadQuizzes(): void {
    this.isLoading = true;
    this.quizService.getQuizzes(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.data = response.items || [];
        // Backend might return 'total' instead of 'totalCount'
        this.totalItems = response.totalCount || response.total || 0;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Error loading quizzes', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.isLoading = false;
      }
    });
  }

  search(): void {
    this.currentPage = 1;
    this.loadQuizzes();
  }

  onPaginatorChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex + 1;
    this.loadQuizzes();
  }

  viewQuiz(quiz: QuizResponse): void {
    // Load full quiz data including questions before opening dialog
    this.quizService.getQuizById(quiz.quizId).subscribe({
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
        this.snackBar.open('Error loading quiz details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  editQuiz(quiz: QuizResponse): void {
    // Navigate to quiz creator in edit mode
    this.router.navigate(['/lecturer/courses', quiz.courseId, 'quiz']);
  }

  deleteQuiz(quiz: QuizResponse): void {
    // Open confirmation dialog
    const dialogRef = this.dialog.open(DeleteQuizDialog, {
      width: '500px',
      data: { title: quiz.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.quizService.deleteQuiz(quiz.quizId).subscribe({
          next: () => {
            this.snackBar.open('Quiz deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadQuizzes();
          },
          error: (error) => {
            const errorMessage = error?.error?.message || 'Error deleting quiz';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}

// Delete Confirmation Dialog
@Component({
  selector: 'delete-quiz-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="delete-quiz-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon class="warning-icon">warning</mat-icon>
        Confirm Delete
      </h2>

      <mat-dialog-content class="dialog-content">
        <p>Are you sure you want to delete this quiz?</p>
        <div class="quiz-info">
          <mat-icon>quiz</mat-icon>
          <strong>{{ data.title }}</strong>
        </div>
        <p class="warning-text">
          <mat-icon>info</mat-icon>
          This action cannot be undone. All quiz data will be permanently deleted.
        </p>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="warn" (click)="onConfirm()">
          <mat-icon>delete</mat-icon>
          Delete Quiz
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .delete-quiz-dialog {
      .dialog-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #2d3748;
        font-weight: 600;
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        margin: 0;

        .warning-icon {
          color: #f59e0b;
          font-size: 28px;
        }
      }

      .dialog-content {
        padding: 30px 24px;

        p {
          margin: 0 0 16px 0;
          font-size: 15px;
          color: #4a5568;
        }

        .quiz-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #3b82f6;
          margin-bottom: 20px;

          mat-icon {
            color: #3b82f6;
            font-size: 24px;
          }

          strong {
            color: #1e293b;
            font-size: 16px;
          }
        }

        .warning-text {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px;
          background: #fef3c7;
          border-radius: 6px;
          color: #92400e;
          font-size: 13px;
          margin: 0;

          mat-icon {
            font-size: 18px;
            color: #f59e0b;
          }
        }
      }

      .dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        justify-content: flex-end;
        gap: 12px;

        button {
          mat-icon {
            margin-right: 6px;
            font-size: 18px;
          }
        }
      }
    }
  `]
})
export class DeleteQuizDialog {
  constructor(
    public dialogRef: MatDialogRef<DeleteQuizDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

// View Quiz Dialog
@Component({
  selector: 'view-quiz-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatDividerModule, MatChipsModule, MatTooltip],
  template: `
    <div class="view-quiz-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <div class="title-content">
          <mat-icon>quiz</mat-icon>
          <span class="value">{{ data.title }}</span>
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
                <span class="value word-break-all" [matTooltip]="maxLengthText(data.courseName) ? data.courseName : ''">{{formatText(data.courseName)}}</span>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>percent</mat-icon>
              <div class="info-content">
                <span class="label">Pass Score</span>
                <span class="value word-break-all">{{ data.passScore }}%</span>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>repeat</mat-icon>
              <div class="info-content">
                <span class="label">Attempt Limit</span>
                <span class="value word-break-all">{{ data.attemptLimit === 0 ? 'Unlimited' : data.attemptLimit }}</span>
              </div>
            </div>

            <div class="info-item">
              <mat-icon>quiz</mat-icon>
              <div class="info-content">
                <span class="label">Questions</span>
                <span class="value word-break-all">{{ data.questions.length || 0 }}</span>
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
              <p class="question-title word-break-all">{{ question.title }}</p>
              <div class="question-details">
                <span class="points">
                  <mat-icon>star</mat-icon>
                  {{ question.points }} points
                </span>
              </div>

              <!-- Answer Options -->
              <div *ngIf="question.answerOptions && question.answerOptions.length > 0" class="answer-options">
                <!-- Text Question: Show only answer without label -->
                <div *ngIf="isTextQuestion(question.questionType)" class="text-answer">
                  <div class="text-answer-label">
                    <mat-icon>check_circle</mat-icon>
                    <span>Correct Answer:</span>
                  </div>
                  <div class="text-answer-content word-break-all">{{ question.answerOptions[0].content }}</div>
                </div>
                
                <!-- Other Question Types: Show with A, B, C labels -->
                <div *ngIf="!isTextQuestion(question.questionType)">
                  <div *ngFor="let option of question.answerOptions; let j = index"
                       class="answer-option"
                       [class.correct]="option.isCorrect">
                    <span class="option-label">{{ getLetter(j) }}</span>
                    <span class="option-content word-break-all">{{ option.content }}</span>
                    <mat-icon *ngIf="option.isCorrect" class="correct-icon">check_circle</mat-icon>
                  </div>
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
  .value {
    word-break: break-word;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  .word-break-all {
    word-break: break-all;
    overflow-wrap: break-word;
    word-wrap: break-word;
  }
  ::ng-deep .mat-mdc-dialog-surface {
    overflow-y: hidden !important;
  }
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

                .text-answer {
                  padding: 16px;
                  background: #dcfce7;
                  border-radius: 8px;
                  border: 2px solid #22c55e;

                  .text-answer-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-weight: 600;
                    font-size: 13px;
                    color: #166534;

                    mat-icon {
                      color: #22c55e;
                      font-size: 20px;
                    }
                  }

                  .text-answer-content {
                    font-size: 15px;
                    color: #1e293b;
                    font-weight: 500;
                    padding-left: 28px;
                  }
                }

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

  
  maxLengthText(text: string) : boolean {
    return text.length > 10;
  }

  formatText(text: string) : string {
      return this.maxLengthText(text) ? text.substring(0, 10) + '...' : text;
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

  /**
   * Check if question is Text type
   */
  isTextQuestion(questionType: string | number): boolean {
    const typeString = this.getQuestionTypeClass(questionType);
    return typeString === 'text';
  }
}
