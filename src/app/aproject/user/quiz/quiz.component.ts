import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuizService } from '../../../services/quiz.service';
import { ApiCourseServices } from '../../../services/course.service';
import { QuizResponse, QuizAttemptDetail, SubmitAnswerRequest, SubmitQuizRequest } from '../../../models/quiz.models';
import { firstValueFrom } from 'rxjs';

// Frontend UI interface - maps to backend Question format
interface Question {
  id: number;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'text';
  question: string;
  answers?: Answer[];
  textAnswer?: string;
  explanation?: string;
}

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

// User answer for submission
interface UserAnswer {
  questionId: number;
  answerIds?: number[];
  textAnswer?: string;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  quizId!: number;
  courseId!: number;
  quizTitle = '';
  quizDuration = 30; // minutes - will be updated from backend
  currentQuestionIndex = 0;
  userAnswers: UserAnswer[] = [];

  // Backend data
  quizData: QuizResponse | null = null;
  attemptId: number | null = null;
  passScore = 70;

  // Loading states
  isLoading = true;
  isSubmitting = false;

  // Timer properties
  timeRemaining: number = 0; // in seconds
  timerInterval: any;
  isTimerRunning = false;
  isTimeUp = false;

  // Questions loaded from backend
  questions: Question[] = [];

  get currentQuestion(): Question | undefined {
    return this.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
  }

  get isFirstQuestion(): boolean {
    return this.currentQuestionIndex === 0;
  }

  get isLastQuestion(): boolean {
    return this.currentQuestionIndex === this.questions.length - 1;
  }

  get canSubmit(): boolean {
    return this.userAnswers.length === this.questions.length;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private quizService: QuizService,
    private courseService: ApiCourseServices,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));

    // TODO: Add enrollment check here when ready
    // if (!this.isEnrolled) { redirect to course page }

    await this.loadQuizAndStartAttempt();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  /**
   * Load quiz from backend and start attempt
   */
  private async loadQuizAndStartAttempt(): Promise<void> {
    try {
      this.isLoading = true;

      // Step 1: Load quiz data
      console.log(`Loading quiz ${this.quizId}...`);
      this.quizData = await firstValueFrom(this.quizService.getQuizById(this.quizId));

      console.log('Quiz loaded:', this.quizData);

      // Set quiz metadata
      this.quizTitle = this.quizData!.title;
      this.courseId = this.quizData!.courseId;
      this.passScore = this.quizData!.passScore;
      // this.quizDuration = this.quizData.duration || 30; // Backend may not have duration yet

      // Step 2: Start quiz attempt
      console.log('Starting quiz attempt...');
      const attemptData = await firstValueFrom(this.quizService.startQuizAttempt(this.quizId));

      this.attemptId = attemptData.attemptId;
      console.log('Attempt started:', this.attemptId);

      // Step 3: Transform backend questions to UI format
      this.questions = this.transformQuestions(this.quizData!.questions);
      console.log(`Transformed ${this.questions.length} questions`);

      // Step 4: Initialize user answers
      this.initializeUserAnswers();

      // Step 5: Start timer
      this.startTimer();

      this.isLoading = false;

    } catch (error: any) {
      console.error('Error loading quiz:', error);
      console.error('Error details:', error.error);
      this.isLoading = false;

      // Extract detailed error message
      let errorMessage = 'Failed to load quiz. Please try again.';
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.error?.title) {
        errorMessage = error.error.title;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }

      this.snackBar.open(
        errorMessage,
        'Close',
        { duration: 8000, panelClass: ['error-snackbar'] }
      );

      // Redirect back after error
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 3000);
    }
  }

  /**
   * Transform backend Question format to UI Question format
   * Backend: { questionId, questionType: 0, title, answerOptions: [{ optionId, content, isCorrect }] }
   * UI: { id, type: 'single_choice', question, answers: [{ id, text, isCorrect }] }
   */
  private transformQuestions(backendQuestions: any[]): Question[] {
    return backendQuestions.map((q: any) => {
      // Convert questionType number to string
      const type = this.normalizeQuestionType(q.questionType);

      return {
        id: q.questionId,
        type: type as any,
        question: q.title,
        answers: q.answerOptions?.map((opt: any) => ({
          id: opt.optionId || opt.questionId, // Use optionId if available
          text: opt.content,
          isCorrect: opt.isCorrect
        })) || [],
        textAnswer: type === 'text' ? q.answerOptions?.[0]?.content || '' : undefined
      };
    });
  }

  /**
   * Normalize questionType from backend (number) to FE string enum
   * Backend: 0=SingleChoice, 1=MultipleChoice, 2=TrueFalse, 3=Text
   * Frontend: 'single_choice', 'multiple_choice', 'true_false', 'text'
   */
  private normalizeQuestionType(questionType: any): string {
    if (typeof questionType === 'number') {
      switch (questionType) {
        case 0: return 'single_choice';
        case 1: return 'multiple_choice';
        case 2: return 'true_false';
        case 3: return 'text';
        default: return 'single_choice';
      }
    }

    // If already string, return as-is
    if (typeof questionType === 'string') {
      return questionType;
    }

    return 'single_choice';
  }

  startTimer() {
    // Convert minutes to seconds
    this.timeRemaining = this.quizDuration * 60;
    this.isTimerRunning = true;
    this.isTimeUp = false;

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        // Time is up - auto submit
        this.stopTimer();
        this.autoSubmit();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.isTimerRunning = false;
  }

  getFormattedTime(): string {
    const hours = Math.floor(this.timeRemaining / 3600);
    const minutes = Math.floor((this.timeRemaining % 3600) / 60);
    const seconds = this.timeRemaining % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  getTimeRemainingPercentage(): number {
    const totalSeconds = this.quizDuration * 60;
    return (this.timeRemaining / totalSeconds) * 100;
  }

  isTimeWarning(): boolean {
    return this.timeRemaining <= 300; // 5 minutes or less
  }

  isTimeCritical(): boolean {
    return this.timeRemaining <= 60; // 1 minute or less
  }

  autoSubmit() {
    this.isTimeUp = true;
    this.stopTimer();

    // Auto submit without confirmation
    this.submitQuiz(true);
  }

  private initializeUserAnswers() {
    this.userAnswers = this.questions.map(q => ({
      questionId: q.id,
      answerIds: q.type === 'multiple_choice' ? [] : undefined,
      textAnswer: q.type === 'text' ? '' : undefined
    }));
  }

  getSelectedAnswerIds(questionId: number): number[] {
    const userAnswer = this.userAnswers.find(a => a.questionId === questionId);
    return userAnswer?.answerIds || [];
  }

  getTextAnswer(questionId: number): string {
    const userAnswer = this.userAnswers.find(a => a.questionId === questionId);
    return userAnswer?.textAnswer || '';
  }

  onSingleChoiceChange(questionId: number, answerId: number) {
    const userAnswer = this.userAnswers.find(a => a.questionId === questionId);
    if (userAnswer) {
      userAnswer.answerIds = [answerId];
    }
  }

  onMultipleChoiceChange(questionId: number, answerId: number, checked: boolean) {
    const userAnswer = this.userAnswers.find(a => a.questionId === questionId);
    if (userAnswer) {
      if (!userAnswer.answerIds) {
        userAnswer.answerIds = [];
      }
      if (checked) {
        if (!userAnswer.answerIds.includes(answerId)) {
          userAnswer.answerIds.push(answerId);
        }
      } else {
        if (userAnswer.answerIds) {
          userAnswer.answerIds = userAnswer.answerIds.filter(id => id !== answerId);
        }
      }
    }
  }

  onTextAnswerChange(questionId: number, text: string) {
    const userAnswer = this.userAnswers.find(a => a.questionId === questionId);
    if (userAnswer) {
      userAnswer.textAnswer = text;
    }
  }

  isAnswerSelected(questionId: number, answerId: number): boolean {
    const selectedIds = this.getSelectedAnswerIds(questionId);
    return selectedIds.includes(answerId);
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.questions.length) {
      this.currentQuestionIndex = index;
    }
  }

  async submitQuiz(autoSubmit = false) {
    // Stop timer if still running
    this.stopTimer();

    if (!autoSubmit) {
      // Open confirmation dialog
      const dialogRef = this.dialog.open(SubmitConfirmDialog, {
        width: '450px',
        disableClose: true,
        data: {
          answeredCount: this.userAnswers.filter(ua =>
            (ua.answerIds && ua.answerIds.length > 0) || (ua.textAnswer && ua.textAnswer.trim())
          ).length,
          totalCount: this.questions.length
        }
      });

      const confirmed = await firstValueFrom(dialogRef.afterClosed());
      if (!confirmed) {
        // Restart timer if user cancels
        this.startTimer();
        return;
      }
    }

    if (!this.attemptId) {
      this.snackBar.open('No active attempt found', 'Close', { duration: 3000 });
      return;
    }

    try {
      this.isSubmitting = true;

      // Build submission request
      const answers: SubmitAnswerRequest[] = this.userAnswers.map(ua => {
        const answer: SubmitAnswerRequest = {
          questionId: ua.questionId,
          selectedOptionId: ua.answerIds && ua.answerIds.length > 0 ? ua.answerIds[0] : undefined,
          answerText: ua.textAnswer?.trim() || undefined
        } as SubmitAnswerRequest;

        if (answer.selectedOptionId === undefined) {
          delete (answer as any).selectedOptionId;
        }
        if (!answer.answerText) {
          delete answer.answerText;
        }

        return answer;
      });

      const request: SubmitQuizRequest = {
        attemptId: this.attemptId,
        answers: answers
      };

      console.log('Submitting quiz:', request);

      // Submit to backend
      const result = await firstValueFrom(this.quizService.submitQuizAttempt(request));

      console.log('Quiz submitted:', result);

      // Backend returns score as percentage (0-100)
      const percentage = result.score || 0;

      // Calculate number of correct answers from percentage
      const correctAnswers = Math.round((percentage / 100) * this.questions.length);

      // Open result dialog
      this.dialog.open(QuizResultDialog, {
        width: '600px',
        maxWidth: '95vw',
        data: {
          score: correctAnswers,
          total: this.questions.length,
          percentage,
          passScore: this.passScore,
          autoSubmitted: autoSubmit,
          attemptId: this.attemptId
        },
        disableClose: true
      }).afterClosed().subscribe(async () => {
        // Mark course as complete
        if (this.courseId) {
          try {
            await firstValueFrom(this.courseService.completeCourse(this.courseId));
            console.log('✅ Course marked as complete');
            
            // Refresh course data to update quiz status
            try {
              await firstValueFrom(this.courseService.getCourseById(this.courseId));
              console.log('✅ Course data refreshed');
            } catch (refreshError) {
              console.error('Error refreshing course data:', refreshError);
            }
          } catch (error) {
            console.error('Error marking course as complete:', error);
          }
        }

        // Navigate back to course learn page
        if (this.courseId) {
          this.router.navigate(['/course/learn', this.courseId]);
        } else {
          this.router.navigate(['/']);
        }
      });

    } catch (error: any) {
      console.error('Error submitting quiz:', error);
      this.snackBar.open(
        error.error?.message || 'Failed to submit quiz. Please try again.',
        'Close',
        { duration: 5000 }
      );
      // Restart timer if submission failed
      this.startTimer();
    } finally {
      this.isSubmitting = false;
    }
  }

  getQuestionStatus(questionIndex: number): 'answered' | 'current' | 'unanswered' {
    if (questionIndex === this.currentQuestionIndex) {
      return 'current';
    }

    const question = this.questions[questionIndex];
    const userAnswer = this.userAnswers.find(a => a.questionId === question.id);

    if (question.type === 'text') {
      return userAnswer?.textAnswer && userAnswer.textAnswer.trim().length > 0 ? 'answered' : 'unanswered';
    } else {
      return userAnswer?.answerIds && userAnswer.answerIds.length > 0 ? 'answered' : 'unanswered';
    }
  }

  getQuestionTypeIcon(type: string): string {
    switch (type) {
      case 'single_choice': return 'radio_button_checked';
      case 'multiple_choice': return 'check_box';
      case 'true_false': return 'help_outline';
      case 'text': return 'text_fields';
      default: return 'help';
    }
  }

  getQuestionTypeLabel(type: string): string {
    switch (type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'true_false': return 'True/False';
      case 'text': return 'Text Answer';
      default: return 'Unknown';
    }
  }

  getQuestionTypeColor(type: string): string {
    switch (type) {
      case 'single_choice': return 'primary';
      case 'multiple_choice': return 'accent';
      case 'true_false': return 'warn';
      case 'text': return '';
      default: return '';
    }
  }
}

// Result Dialog Component
@Component({
  selector: 'quiz-result-dialog',
  standalone: true,
  template: `
    <div class="quiz-result-dialog">
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon [class]="resultIconClass">{{resultIcon}}</mat-icon>
        Quiz Results
      </h2>

      <mat-dialog-content class="dialog-content">
        <div *ngIf="data.autoSubmitted" class="auto-submit-notice">
          <mat-icon>schedule</mat-icon>
          <span>Quiz was automatically submitted when time ran out.</span>
        </div>
        <div class="score-container">
          <div class="score-circle" [class.passed]="data.percentage >= data.passScore"
               [class.failed]="data.percentage < data.passScore">
            <div class="score-value">{{data.percentage.toFixed(0)}}%</div>
            <div class="score-label">Score</div>
          </div>

          <div class="score-details">
            <div class="detail-item">
              <mat-icon>check_circle</mat-icon>
              <span class="label">Correct Answers:</span>
              <span class="value">{{data.score}} / {{data.total}}</span>
            </div>

            <div class="detail-item">
              <mat-icon>assignment</mat-icon>
              <span class="label">Total Questions:</span>
              <span class="value">{{data.total}}</span>
            </div>

            <div class="detail-item">
              <mat-icon>emoji_events</mat-icon>
              <span class="label">Passing Score:</span>
              <span class="value">{{data.passScore}}%</span>
            </div>

            <mat-chip [color]="data.percentage >= data.passScore ? 'primary' : 'warn'" selected class="status-chip">
              <mat-icon matChipAvatar>
                {{data.percentage >= data.passScore ? 'check_circle' : 'cancel'}}
              </mat-icon>
              {{data.percentage >= data.passScore ? 'Passed' : 'Failed'}}
            </mat-chip>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="dialog-actions">
        <button mat-raised-button color="primary" (click)="close()">
          <mat-icon>check</mat-icon>
          Continue
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .quiz-result-dialog {
      .dialog-title {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #2d3748;
        font-weight: 600;
        padding: 20px 24px;
        border-bottom: 1px solid #e2e8f0;
        margin: 0;

        mat-icon {
          font-size: 32px;

          &.success {
            color: #38a169;
          }

          &.failure {
            color: #e53e3e;
          }
        }
      }

      .dialog-content {
        padding: 30px 24px;

        .auto-submit-notice {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 16px;
          background: #fff5f5;
          border: 2px solid #e53e3e;
          border-radius: 8px;
          margin-bottom: 24px;
          color: #e53e3e;
          font-weight: 600;
          font-size: 14px;

          mat-icon {
            font-size: 20px;
          }
        }

        .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 30px;

          .score-circle {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
            color: white;
            box-shadow: 0 8px 24px rgba(229, 62, 62, 0.3);

            &.passed {
              background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
              box-shadow: 0 8px 24px rgba(56, 161, 105, 0.3);
            }

            .score-value {
              font-size: 48px;
              font-weight: 700;
              line-height: 1;
            }

            .score-label {
              font-size: 14px;
              font-weight: 500;
              opacity: 0.9;
              margin-top: 8px;
            }
          }

          .score-details {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;

            .detail-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: #f7fafc;
              border-radius: 8px;

              mat-icon {
                color: #4299e1;
              }

              .label {
                flex: 1;
                font-weight: 500;
                color: #4a5568;
              }

              .value {
                font-weight: 600;
                color: #2d3748;
                font-size: 16px;
              }
            }

            .status-chip {
              align-self: center;
              font-size: 14px;
              font-weight: 600;
              height: 36px;
            }
          }
        }
      }

      .dialog-actions {
        padding: 16px 24px;
        border-top: 1px solid #e2e8f0;
        justify-content: center;

        button {
          mat-icon {
            margin-right: 8px;
          }
        }
      }
    }
  `],
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MatChipsModule]
})
export class QuizResultDialog {
  constructor(
    public dialogRef: MatDialogRef<QuizResultDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      score: number;
      total: number;
      percentage: number;
      passScore: number;
      autoSubmitted?: boolean;
      attemptId: number;
    }
  ) {}

  get resultIcon(): string {
    return this.data.percentage >= this.data.passScore ? 'celebration' : 'error';
  }

  get resultIconClass(): string {
    return this.data.percentage >= this.data.passScore ? 'success' : 'failure';
  }

  close() {
    this.dialogRef.close();
  }
}

// Submit Confirmation Dialog Component
@Component({
  selector: 'submit-confirm-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="submit-confirm-dialog">
      <h2 mat-dialog-title>
        <mat-icon>warning</mat-icon>
        Submit Quiz?
      </h2>

      <mat-dialog-content>
        <p class="message">Are you sure you want to submit your quiz?</p>
        <p class="warning">You will not be able to make changes after submission.</p>

        <div class="progress-info">
          <mat-icon>assignment</mat-icon>
          <span>You have answered <strong>{{data.answeredCount}}</strong> out of <strong>{{data.totalCount}}</strong> questions.</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="cancel()">
          <mat-icon>close</mat-icon>
          Cancel
        </button>
        <button mat-raised-button color="primary" (click)="confirm()">
          <mat-icon>send</mat-icon>
          Submit Quiz
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .submit-confirm-dialog {
      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        color: #f59e0b;

        mat-icon {
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }

      mat-dialog-content {
        padding: 24px 0;
        min-width: 350px;

        .message {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: #1e293b;
        }

        .warning {
          font-size: 14px;
          color: #ef4444;
          margin: 0 0 20px 0;
          font-weight: 500;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f1f5f9;
          border-radius: 8px;
          font-size: 14px;
          color: #475569;

          mat-icon {
            color: #3b82f6;
            font-size: 20px;
            width: 20px;
            height: 20px;
          }

          strong {
            color: #1e293b;
          }
        }
      }

      mat-dialog-actions {
        padding: 16px 0 0 0;

        button {
          mat-icon {
            margin-right: 6px;
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
    }
  `]
})
export class SubmitConfirmDialog {
  constructor(
    public dialogRef: MatDialogRef<SubmitConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { answeredCount: number, totalCount: number }
  ) {}

  cancel() {
    this.dialogRef.close(false);
  }

  confirm() {
    this.dialogRef.close(true);
  }
}
