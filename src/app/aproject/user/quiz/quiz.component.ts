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
    MatDialogModule
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  quizId!: string;
  quizTitle = 'Final Quiz - JavaScript Fundamentals';
  quizDuration = 30; // minutes
  currentQuestionIndex = 0;
  userAnswers: UserAnswer[] = [];
  
  // Timer properties
  timeRemaining: number = 0; // in seconds
  timerInterval: any;
  isTimerRunning = false;
  isTimeUp = false;
  
  // Sample quiz questions - in production, these would come from API
  questions: Question[] = [
    {
      id: 1,
      type: 'single_choice',
      question: 'Which of the following is NOT a feature introduced in ES6?',
      answers: [
        { id: 1, text: 'Arrow Functions', isCorrect: false },
        { id: 2, text: 'Template Literals', isCorrect: false },
        { id: 3, text: 'Callbacks', isCorrect: true },
        { id: 4, text: 'Classes', isCorrect: false }
      ]
    },
    {
      id: 2,
      type: 'multiple_choice',
      question: 'Which of the following are valid ways to handle asynchronous operations in JavaScript? (Select all that apply)',
      answers: [
        { id: 5, text: 'Callbacks', isCorrect: true },
        { id: 6, text: 'Promises', isCorrect: true },
        { id: 7, text: 'Async/Await', isCorrect: true },
        { id: 8, text: 'Synchronous Functions', isCorrect: false }
      ]
    },
    {
      id: 3,
      type: 'true_false',
      question: 'ES6 modules use the import/export syntax.',
      answers: [
        { id: 9, text: 'True', isCorrect: true },
        { id: 10, text: 'False', isCorrect: false }
      ]
    },
    {
      id: 4,
      type: 'text',
      question: 'Explain what a closure is in JavaScript and provide a simple example.',
      textAnswer: 'A closure is a function that retains access to its outer scope even after the outer function has returned.',
      explanation: 'A closure is a function that has access to variables in its outer scope even after the outer function returns.'
    },
    {
      id: 5,
      type: 'single_choice',
      question: 'What does the "this" keyword refer to in arrow functions?',
      answers: [
        { id: 11, text: 'The function itself', isCorrect: false },
        { id: 12, text: 'The enclosing scope', isCorrect: true },
        { id: 13, text: 'The global object', isCorrect: false },
        { id: 14, text: 'undefined', isCorrect: false }
      ]
    }
  ];

  get currentQuestion(): Question {
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
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.quizId = this.route.snapshot.paramMap.get('id') || '';
    this.initializeUserAnswers();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer() {
    // Convert minutes to seconds
    this.timeRemaining = this.quizDuration * 60;
    this.isTimerRunning = true;
    this.isTimeUp = false;

    this.timerInterval = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        
        // Warning when less than 5 minutes remaining
        if (this.timeRemaining === 5 * 60) {
          // You can add a notification here if needed
        }
        
        // Warning when less than 1 minute remaining
        if (this.timeRemaining === 60) {
          // You can add a notification here if needed
        }
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

  submitQuiz(autoSubmit = false) {
    // Stop timer if still running
    this.stopTimer();
    
    if (!autoSubmit) {
      if (!confirm('Are you sure you want to submit the quiz? You will not be able to make changes after submission.')) {
        return;
      }
    }
    
    const score = this.calculateScore();
    const percentage = (score / this.questions.length) * 100;
    
    // Open result dialog
    this.dialog.open(QuizResultDialog, {
      width: '600px',
      maxWidth: '95vw',
      data: {
        score,
        total: this.questions.length,
        percentage,
        passScore: 70,
        autoSubmitted: autoSubmit
      },
      disableClose: true
    }).afterClosed().subscribe(() => {
      this.router.navigate(['/course/learn', this.quizId]);
    });
  }

  private calculateScore(): number {
    let score = 0;
    
    this.questions.forEach(question => {
      const userAnswer = this.userAnswers.find(a => a.questionId === question.id);
      
      if (!userAnswer) return;
      
      switch (question.type) {
        case 'single_choice':
          if (userAnswer.answerIds && userAnswer.answerIds.length === 1) {
            const answerIds = userAnswer.answerIds;
            const selectedAnswer = question.answers?.find(a => a.id === answerIds[0]);
            if (selectedAnswer?.isCorrect) {
              score++;
            }
          }
          break;
          
        case 'multiple_choice':
          if (userAnswer.answerIds && userAnswer.answerIds.length > 0) {
            const correctIds = question.answers?.filter(a => a.isCorrect).map(a => a.id) || [];
            const selectedIds = userAnswer.answerIds;
            
            if (correctIds.length === selectedIds.length &&
                correctIds.every(id => selectedIds.includes(id)) &&
                selectedIds.every(id => correctIds.includes(id))) {
              score++;
            }
          }
          break;
          
        case 'true_false':
          if (userAnswer.answerIds && userAnswer.answerIds.length === 1) {
            const answerIds = userAnswer.answerIds;
            const selectedAnswer = question.answers?.find(a => a.id === answerIds[0]);
            if (selectedAnswer?.isCorrect) {
              score++;
            }
          }
          break;
          
        case 'text':
          // For text questions, we'll check if answer is not empty
          // In production, this would be evaluated by instructor or using keyword matching
          if (userAnswer.textAnswer && userAnswer.textAnswer.trim().length > 0) {
            score++;
          }
          break;
      }
    });
    
    return score;
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
            <div class="score-value">{{data.percentage}}%</div>
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
        @Inject(MAT_DIALOG_DATA) public data: { score: number; total: number; percentage: number; passScore: number; autoSubmitted?: boolean }
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

