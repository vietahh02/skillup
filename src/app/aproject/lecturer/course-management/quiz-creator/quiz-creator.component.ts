import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuizService } from '../../../../services/quiz.service';
import { QuizCreateRequest, Question, AnswerOption } from '../../../../models/quiz.models';
import { QuestionType } from '../../../../enums/api.enums';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quiz-creator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './quiz-creator.component.html',
  styleUrls: ['./quiz-creator.component.scss']
})
export class QuizCreatorComponent implements OnInit {
  quizForm: FormGroup;
  QuestionType = QuestionType;
  courseId: number | null = null;
  existingQuizId: number | null = null;
  isEditMode = false;
  isLoading = false;
  isSubmitting = false;
  isPopulatingForm = false; // Flag to prevent duplicate answers during form population
  private lastSubmitTime = 0; // Track last submit timestamp
  private originalQuestions: Map<number, any> = new Map(); // Store original question data including answerOptions

  questionTypes = [
    { value: QuestionType.SINGLE_CHOICE, label: 'One answer correct' },
    { value: QuestionType.MULTIPLE_CHOICE, label: 'Multi answer correct' },
    { value: QuestionType.TRUE_FALSE, label: 'True/False' },
    { value: QuestionType.TEXT, label: 'Text' }
  ];

  /**
   * Normalize questionType from backend to FE enum string
   * Backend NOW returns: 0 (SingleChoice), 1 (MultipleChoice), 2 (TrueFalse), 3 (Text)
   * Frontend uses: string enum ('single_choice', 'multiple_choice', 'true_false', 'text')
   */
  private normalizeQuestionType(questionType: any): string {
    // Backend returns number (0, 1, 2, 3) after recent update
    if (typeof questionType === 'number') {
      switch (questionType) {
        case 0: return QuestionType.SINGLE_CHOICE;  // 'single_choice'
        case 1: return QuestionType.MULTIPLE_CHOICE; // 'multiple_choice'
        case 2: return QuestionType.TRUE_FALSE;      // 'true_false'
        case 3: return QuestionType.TEXT;            // 'text'
        default:
          return QuestionType.SINGLE_CHOICE;
      }
    }

    // Legacy: If backend still returns string for some reason
    if (typeof questionType === 'string') {
      const validTypes = ['single_choice', 'multiple_choice', 'true_false', 'text'];
      if (validTypes.includes(questionType)) {
        return questionType;
      }
    }

    // Default fallback
    return QuestionType.SINGLE_CHOICE;
  }

  /**
   * Convert FE enum string to backend number format
   * Frontend: 'single_choice', 'multiple_choice', 'true_false', 'text'
   * Backend expects: 0, 1, 2, 3
   */
  private convertQuestionTypeToNumber(questionType: string | number): number {
    // If already a number, return as-is
    if (typeof questionType === 'number') {
      return questionType;
    }

    // Convert string to number
    switch (questionType) {
      case QuestionType.SINGLE_CHOICE:   return 0;
      case QuestionType.MULTIPLE_CHOICE: return 1;
      case QuestionType.TRUE_FALSE:      return 2;
      case QuestionType.TEXT:            return 3;
      default:
        return 0; // Default to SINGLE_CHOICE
    }
  }

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      attemptLimit: [1, [Validators.required, Validators.min(1)]],
      passScore: [70, [Validators.required, Validators.min(0), Validators.max(100)]],
      timeLimit: [null, [Validators.min(1)]], // Optional: time limit in minutes (null = no time limit)
      questions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Get courseId from route params
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.courseId = parseInt(id, 10);
        this.loadExistingQuiz();
      }
    });
  }

  /**
   * Load existing quiz for this course (if exists)
   */
  private loadExistingQuiz(): void {
    if (!this.courseId) return;

    this.isLoading = true;
    this.quizService.getQuizByCourseId(this.courseId).subscribe({
      next: (quiz) => {
        this.existingQuizId = quiz.quizId;
        this.isEditMode = true;
        this.populateForm(quiz);
        this.isLoading = false;
      },
      error: (error) => {
        // 404 means no quiz exists yet (CREATE mode)
        if (error.status === 404) {
          this.isEditMode = false;
        } else {
          this.snackBar.open('⚠️ Error loading quiz. You can still create a new one.', 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
        this.isLoading = false;
      }
    });
  }

  /**
   * Populate form with existing quiz data
   */
  private populateForm(quiz: any): void {
    this.isPopulatingForm = true; // Start populating

    // Set basic quiz info
    this.quizForm.patchValue({
      title: quiz.title,
      passScore: quiz.passScore,
      attemptLimit: quiz.attemptLimit,
      timeLimit: quiz.timeLimit || null // Load timeLimit from backend, null if not set
    });

    // Clear existing questions
    while (this.questions.length) {
      this.questions.removeAt(0);
    }

    // Clear original questions map
    this.originalQuestions.clear();

    // Populate questions
    if (quiz.questions && quiz.questions.length > 0) {
      quiz.questions.forEach((q: any, index: number) => {
        const normalizedType = this.normalizeQuestionType(q.questionType);

        // Store original question data including answerOptions
        if (q.questionId) {
          this.originalQuestions.set(q.questionId, {
            answerOptions: q.answerOptions ? [...q.answerOptions] : [],
            textAnswer: normalizedType === QuestionType.TEXT && q.answerOptions?.[0]?.content ? q.answerOptions[0].content : ''
          });
        }

        const questionGroup = this.fb.group({
          questionId: [q.questionId], // Store question ID for update/delete
          type: [normalizedType, Validators.required],
          question: [q.title, Validators.required],
          answers: this.fb.array([]),
          textAnswer: ['']
        });

        // Add question to form
        this.questions.push(questionGroup);
        const questionIndex = this.questions.length - 1;

        // Handle Text questions separately (don't populate answers array)
        if (normalizedType === QuestionType.TEXT) {
          // Ensure answers array is empty for Text questions
          const answersArray = this.getAnswers(questionIndex);
          while (answersArray.length > 0) {
            answersArray.removeAt(0);
          }
          
          // Set textAnswer if available
          if (q.answerOptions && q.answerOptions.length > 0) {
            questionGroup.patchValue({
              textAnswer: q.answerOptions[0].content
            });
          }
        } else {
          // Populate answers (only for non-TEXT questions)
          if (q.answerOptions && q.answerOptions.length > 0) {
            q.answerOptions.forEach((option: any) => {
              const answerGroup = this.fb.group({
                text: [option.content, Validators.required],
                isCorrect: [option.isCorrect]
              });
              this.getAnswers(questionIndex).push(answerGroup);
            });
          }
        }
      });
    }

    this.isPopulatingForm = false; // Done populating
  }

  /**
   * Generate unique name for radio buttons to prevent crosstalk between questions
   * Each question needs a unique radio group name
   */
  getName(questionIndex: number): string {
    return `question-${questionIndex}-answer`;
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      questionId: [null], // New question - no ID yet
      type: [QuestionType.SINGLE_CHOICE, Validators.required],
      question: ['', Validators.required],
      answers: this.fb.array([]),
      textAnswer: ['']
    });

    this.questions.push(questionGroup);
    const newQuestionIndex = this.questions.length - 1;

    this.addAnswer(newQuestionIndex, '', true);
    this.addAnswer(newQuestionIndex);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  /**
   * Open AI Gen Quiz Dialog
   */
  openAIGenDialog(): void {
    if (!this.courseId) {
      this.snackBar.open('Course ID is required to generate questions', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    const dialogRef = this.dialog.open(AIGenQuizDialog, {
      width: '700px',
      maxWidth: '95vw',
      data: { courseId: this.courseId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.questions) {
        this.loadGeneratedQuestions(result.questions);
      }
    });
  }

  /**
   * Load AI generated questions into form
   */
  private loadGeneratedQuestions(generatedQuestions: any[]): void {
    this.isPopulatingForm = true;

    generatedQuestions.forEach((genQ: any) => {
      const normalizedType = this.normalizeQuestionType(genQ.questionType);

      const questionGroup = this.fb.group({
        questionId: [null],
        type: [normalizedType, Validators.required],
        question: [genQ.title, Validators.required],
        answers: this.fb.array([]),
        textAnswer: [normalizedType === QuestionType.TEXT ? genQ.answerOptions[0]?.content || '' : '']
      });

      this.questions.push(questionGroup);
      const questionIndex = this.questions.length - 1;

      // Add answer options
      if (genQ.answerOptions && genQ.answerOptions.length > 0) {
        genQ.answerOptions.forEach((option: any) => {
          const answerGroup = this.fb.group({
            text: [option.content, Validators.required],
            isCorrect: [option.isCorrect]
          });
          this.getAnswers(questionIndex).push(answerGroup);
        });
      }
    });

    this.isPopulatingForm = false;

    this.snackBar.open(
      `✨ Generated ${generatedQuestions.length} questions successfully!`,
      'Close',
      { duration: 3000, panelClass: ['success-snackbar'] }
    );
  }

  onQuestionTypeChange(questionIndex: number): void {
    // Skip if we're currently populating the form from backend data
    if (this.isPopulatingForm) {
      return;
    }

    const question = this.questions.at(questionIndex);
    const type = question.get('type')?.value;
    const answers = this.getAnswers(questionIndex);

    answers.clear();

    if (type === QuestionType.TRUE_FALSE) {
      this.addAnswer(questionIndex, 'True', true);
      this.addAnswer(questionIndex, 'False');
    } else if (type === QuestionType.TEXT) {
      question.get('textAnswer')?.setValidators([Validators.required]);
      question.get('textAnswer')?.updateValueAndValidity();
    } else {
      question.get('textAnswer')?.clearValidators();
      question.get('textAnswer')?.updateValueAndValidity();
      this.addAnswer(questionIndex, "", true);
      this.addAnswer(questionIndex);
    }
  }

  addAnswer(questionIndex: number, defaultValue: string = '', isCorrect: boolean = false): void {
    const answers = this.getAnswers(questionIndex);
    const answerGroup = this.fb.group({
      text: [defaultValue, Validators.required],
      isCorrect: [isCorrect]
    });

    answers.push(answerGroup);
  }

  removeAnswer(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    if (answers.length > 1) {
      answers.removeAt(answerIndex);
    }
  }

  onSingleChoiceChange(questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(questionIndex);
    answers.controls.forEach((answer, index) => {
      answer.get('isCorrect')?.setValue(index === answerIndex);
    });
  }

  canAddAnswer(questionIndex: number): boolean {
    const question = this.questions.at(questionIndex);
    const type = question.get('type')?.value;
    return type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE;
  }

  canRemoveAnswer(questionIndex: number): boolean {
    const answers = this.getAnswers(questionIndex);
    return answers.length > 1;
  }

  isTextQuestion(questionIndex: number): boolean {
    const question = this.questions.at(questionIndex);
    return question.get('type')?.value === QuestionType.TEXT;
  }

  isTrueFalseQuestion(questionIndex: number): boolean {
    const question = this.questions.at(questionIndex);
    return question.get('type')?.value === QuestionType.TRUE_FALSE;
  }

  isSingleChoice(questionIndex: number): boolean {
    const question = this.questions.at(questionIndex);
    return question.get('type')?.value === QuestionType.SINGLE_CHOICE;
  }

  onSubmit(): void {
    // Prevent double submit
    if (this.isSubmitting) {
      return;
    }

    // Debounce: Prevent multiple submits within 1 second
    const now = Date.now();
    if (now - this.lastSubmitTime < 1000) {
      return;
    }
    this.lastSubmitTime = now;

    if (this.quizForm.valid && this.questions.length > 0) {
      if (!this.courseId) {
        this.snackBar.open('❌ Course ID is missing. Please access this page from a course.', 'Close', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.isSubmitting = true;
      const formValue = this.quizForm.value;

      if (this.isEditMode && this.existingQuizId) {
        // EDIT MODE: Update quiz info + update each question separately
        this.updateExistingQuiz(formValue);
      } else {
        // CREATE MODE: Create quiz with all questions at once
        const quizRequest: QuizCreateRequest = {
          courseId: this.courseId,
          title: formValue.title,
          passScore: formValue.passScore,
          attemptLimit: formValue.attemptLimit,
          timeLimit: formValue.timeLimit && formValue.timeLimit > 0 ? formValue.timeLimit : null,
          questions: this.transformQuestionsToAPI(formValue.questions)
        };

        this.quizService.createQuiz(quizRequest).subscribe({
          next: (response) => {
            this.isSubmitting = false;

            this.snackBar.open(
              `✅ Quiz "${response.title}" created successfully with ${response.questions.length} questions!`,
              'Close',
              { duration: 3000, panelClass: ['success-snackbar'] }
            );

            // Navigate back to course detail immediately
            this.router.navigate(['/lecturer/courses', this.courseId]);
          },
          error: (error) => {
            this.isSubmitting = false;

            const errorMessage = error.error?.message || error.message || 'Failed to create quiz';
            this.snackBar.open(`❌ Error: ${errorMessage}`, 'Close', {
              duration: 7000,
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    } else {
      // Validation errors
      let errorMessage = '⚠️ Please fix the following issues:\n\n';

      if (this.questions.length === 0) {
        errorMessage += '• Add at least one question\n';
      }

      if (this.quizForm.get('title')?.hasError('required')) {
        errorMessage += '• Quiz title is required\n';
      }

      if (this.quizForm.get('attemptLimit')?.hasError('required')) {
        errorMessage += '• Attempt limit is required\n';
      }

      if (this.quizForm.get('passScore')?.hasError('required')) {
        errorMessage += '• Pass score is required\n';
      }

      this.snackBar.open(errorMessage, 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
      this.markFormGroupTouched(this.quizForm);
    }
  }

  /**
   * Update existing quiz (EDIT MODE)
   * Step 1: Update quiz info (title, passScore, attemptLimit)
   * Step 2: Delete removed questions
   * Step 3: Use batch API to update existing questions and create new questions
   */
  private updateExistingQuiz(formValue: any): void {
    if (!this.existingQuizId) {
      this.isSubmitting = false;
      return;
    }

    // Step 1: Update quiz basic info (without questions)
    const quizInfoUpdate = {
      courseId: this.courseId!,
      title: formValue.title,
      passScore: formValue.passScore,
      attemptLimit: formValue.attemptLimit,
      timeLimit: formValue.timeLimit && formValue.timeLimit > 0 ? formValue.timeLimit : null,
      questions: [] // Backend expects this but won't update it
    };

    this.quizService.updateQuiz(this.existingQuizId, quizInfoUpdate).subscribe({
      next: async (quizResponse) => {
        // Step 2: Handle add/update/delete questions
        const formQuestions = formValue.questions;
        const existingQuestionIds = quizResponse.questions.map((q: any) => q.questionId);
        const formQuestionIds = formQuestions.map((q: any) => q.questionId).filter((id: any) => id != null);

        try {
          // 1. Delete removed questions (individual DELETE calls)
          const questionsToDelete = existingQuestionIds.filter(id => !formQuestionIds.includes(id));
          if (questionsToDelete.length > 0) {
            const deletePromises = questionsToDelete.map(questionId =>
              firstValueFrom(this.quizService.deleteQuestion(questionId))
            );
            await Promise.all(deletePromises);
          }

        // 2. Separate questions into UPDATE vs CREATE
        const questionsToUpdate: Question[] = [];
        const questionsToCreate: Question[] = [];

        formQuestions.forEach((formQ: any, index: number) => {
          const questionData = this.transformSingleQuestionToAPI(formQ, index);

            if (formQ.questionId) {
              // Existing question - UPDATE
              questionData.questionId = formQ.questionId;
              questionData.quizId = this.existingQuizId!;
              questionsToUpdate.push(questionData);
            } else {
              // New question - CREATE
              questionData.quizId = this.existingQuizId!;
              questionsToCreate.push(questionData);
            }
          });

          // 3. Use individual UPDATE API for existing questions (not batch)
          // Reason: Batch API handles both CREATE and UPDATE, but we need them separate to avoid duplicates
          if (questionsToUpdate.length > 0) {
            const updatePromises = questionsToUpdate.map(question => {
              return firstValueFrom(this.quizService.updateQuestion(question.questionId!, question));
            });

            await Promise.all(updatePromises);
          }

          // 4. Use individual CREATE API for new questions (WORKAROUND: batch API has duplicate bug)
          if (questionsToCreate.length > 0) {
            const createPromises = questionsToCreate.map(async (question) => {
              try {
                const response = await firstValueFrom(this.quizService.createQuestion(this.existingQuizId!, question));
                return response;
              } catch (error: any) {
                throw error;
              }
            });

            await Promise.all(createPromises);
          }

          // All done!
          this.isSubmitting = false;

          this.snackBar.open(
            `✅ Quiz "${quizResponse.title}" updated successfully with ${formQuestions.length} questions!`,
            'Close',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );

          // Navigate back to course detail
          this.router.navigate(['/lecturer/courses', this.courseId]);

        } catch (error: any) {
          this.isSubmitting = false;

          const errorMessage = error?.error?.message || error?.message || 'Failed to update questions';
          this.snackBar.open(`❌ Error: ${errorMessage}`, 'Close', {
            duration: 7000,
            panelClass: ['error-snackbar']
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;

        const errorMessage = error.error?.message || error.message || 'Failed to update quiz';
        this.snackBar.open(`❌ Error: ${errorMessage}`, 'Close', {
          duration: 7000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * Transform a single form question to API format
   */
  private transformSingleQuestionToAPI(formQuestion: any, orderIndex: number): Question {
    const question: Question = {
      title: formQuestion.question,
      questionType: this.convertQuestionTypeToNumber(formQuestion.type) as any, // Convert string enum to number for backend
      points: 1,
      orderIndex: orderIndex,
      answerOptions: []
    };

    // Transform answers to API format
    if (formQuestion.type === QuestionType.TEXT) {
      // For Text questions, check if textAnswer has changed
      const currentTextAnswer = (formQuestion.textAnswer || '').trim();
      
      // If this is an existing question (has questionId), check if textAnswer changed
      if (formQuestion.questionId) {
        const originalData = this.originalQuestions.get(formQuestion.questionId);
        
        if (originalData) {
          const originalTextAnswer = (originalData.textAnswer || '').trim();
          
          // If textAnswer hasn't changed or is empty, use original answerOptions
          if (currentTextAnswer === originalTextAnswer || currentTextAnswer === '') {
            // Use original answerOptions to preserve correct answer
            question.answerOptions = originalData.answerOptions.map((opt: any) => ({
              content: opt.content,
              isCorrect: opt.isCorrect
            }));
          } else {
            // TextAnswer has changed, use new value
            question.answerOptions = [{
              content: currentTextAnswer,
              isCorrect: true
            }];
          }
        } else {
          // No original data found, use current value (shouldn't happen, but fallback)
          question.answerOptions = currentTextAnswer ? [{
            content: currentTextAnswer,
            isCorrect: true
          }] : [];
        }
      } else {
        // New question, use current textAnswer
        question.answerOptions = currentTextAnswer ? [{
          content: currentTextAnswer,
          isCorrect: true
        }] : [];
      }
    } else {
      question.answerOptions = formQuestion.answers.map((answer: any) => ({
        content: answer.text,
        isCorrect: answer.isCorrect
      }));
    }

    return question;
  }

  /**
   * Transform form questions to API format
   */
  private transformQuestionsToAPI(formQuestions: any[]): Question[] {
    return formQuestions.map((q, index) => {
      const question: Question = {
        title: q.question,
        questionType: this.convertQuestionTypeToNumber(q.type) as any, // Convert string enum to number for backend
        points: 1, // Default 1 point per question
        orderIndex: index,
        answerOptions: []
      };

      // Transform answers to API format
      if (q.type === QuestionType.TEXT) {
        // For text questions, create one answer option with the correct answer
        question.answerOptions = [{
          content: q.textAnswer || '',
          isCorrect: true
        }];
      } else {
        // For choice questions, map answers
        question.answerOptions = q.answers.map((answer: any) => ({
          content: answer.text,
          isCorrect: answer.isCorrect
        }));
      }

      return question;
    });
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}

// ============================================================
// AI Gen Quiz Dialog Component
// ============================================================
@Component({
  selector: 'ai-gen-quiz-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="ai-gen-dialog">
      <h2 mat-dialog-title>
        <mat-icon class="dialog-icon">auto_awesome</mat-icon>
        AI Generate Quiz Questions
      </h2>

      <mat-dialog-content>
        <p class="dialog-description">
          Let AI (powered by OpenRouter) generate quiz questions automatically from your course content.
        </p>

        <form [formGroup]="genForm">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Number of Questions</mat-label>
            <input
              matInput
              type="number"
              formControlName="numberOfQuestions"
              min="1"
              max="50"
              placeholder="e.g., 10">
            <mat-icon matPrefix>quiz</mat-icon>
            <mat-hint>Choose between 1 and 50 questions</mat-hint>
            <mat-error *ngIf="genForm.get('numberOfQuestions')?.hasError('required')">
              Number of questions is required
            </mat-error>
            <mat-error *ngIf="genForm.get('numberOfQuestions')?.hasError('min')">
              Minimum 1 question
            </mat-error>
            <mat-error *ngIf="genForm.get('numberOfQuestions')?.hasError('max')">
              Maximum 50 questions
            </mat-error>
          </mat-form-field>
        </form>

        <div *ngIf="isGenerating" class="loading-container">
          <mat-spinner diameter="40"></mat-spinner>
          <p class="loading-text">Generating questions with AI...</p>
        </div>

        <div *ngIf="errorMessage" class="error-message">
          <mat-icon>error</mat-icon>
          <span>{{ errorMessage }}</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button
          mat-button
          (click)="onCancel()"
          [disabled]="isGenerating">
          Cancel
        </button>
        <button
          mat-raised-button
          color="primary"
          (click)="onGenerate()"
          [disabled]="genForm.invalid || isGenerating">
          <mat-icon>auto_awesome</mat-icon>
          Generate
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .ai-gen-dialog {
      h2 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        font-size: 24px;
        color: #1a202c;

        .dialog-icon {
          color: #4299e1;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }

      mat-dialog-content {
        min-width: 500px;
        padding: 24px 0;

        .dialog-description {
          color: #718096;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .full-width {
          width: 100%;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px 0;

          .loading-text {
            color: #4299e1;
            font-weight: 500;
            margin: 0;
          }
        }

        .error-message {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          background: #fff5f5;
          border-left: 4px solid #f56565;
          border-radius: 8px;
          color: #c53030;
          margin-top: 16px;
          max-width: 100%;

          mat-icon {
            font-size: 24px;
            width: 24px;
            height: 24px;
            flex-shrink: 0;
            margin-top: 2px;
          }

          span {
            flex: 1;
            line-height: 1.6;
            word-wrap: break-word;
            overflow-wrap: break-word;
            white-space: pre-wrap;
            font-size: 14px;
          }
        }
      }

      mat-dialog-actions {
        padding: 16px 0 0 0;
        margin: 0;

        button {
          mat-icon {
            margin-right: 4px;
          }
        }
      }
    }

    @media (max-width: 600px) {
      .ai-gen-dialog mat-dialog-content {
        min-width: 300px;
      }
    }
  `]
})
export class AIGenQuizDialog {
  genForm: FormGroup;
  isGenerating = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AIGenQuizDialog>,
    @Inject(MAT_DIALOG_DATA) public data: { courseId: number },
    private quizService: QuizService,
    private snackBar: MatSnackBar
  ) {
    this.genForm = this.fb.group({
      numberOfQuestions: [10, [Validators.required, Validators.min(1), Validators.max(50)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async onGenerate(): Promise<void> {
    if (this.genForm.invalid) return;

    this.isGenerating = true;
    this.errorMessage = null;

    const numberOfQuestions = this.genForm.get('numberOfQuestions')?.value;

    try {
      const response = await firstValueFrom(
        this.quizService.generateQuizFromCourse(this.data.courseId, numberOfQuestions)
      );

      // Check if response has questionsJson
      if (!response || !response.questionsJson) {
        throw new Error('Invalid response from server: missing questionsJson');
      }

      // Parse the questionsJson string
      let questions;
      try {
        // Remove markdown code blocks if present (```json ... ```)
        let cleanedJson = response.questionsJson.trim();
        if (cleanedJson.startsWith('```')) {
          // Remove starting ```json or ```
          cleanedJson = cleanedJson.replace(/^```(?:json)?\s*\n?/, '');
          // Remove ending ```
          cleanedJson = cleanedJson.replace(/\n?```\s*$/, '');
        }

        const parsedData = JSON.parse(cleanedJson);

        // Handle both direct array and wrapped object format
        if (Array.isArray(parsedData)) {
          questions = parsedData;
        } else if (parsedData.questions && Array.isArray(parsedData.questions)) {
          questions = parsedData.questions;
        } else {
          throw new Error('Invalid response format: expected array of questions');
        }

        // Transform BE format to FE format
        questions = questions.map((q: any) => {
          // Handle both BE format and FE format
          if (q.questionType && q.title && q.answerOptions) {
            // Already in FE format
            return q;
          }

          // Transform from BE format: { question, options, correctAnswer, explanation }
          return {
            questionType: 0, // Default to SINGLE_CHOICE
            title: q.question || q.title || '',
            answerOptions: (q.options || []).map((option: string, index: number) => ({
              content: option,
              isCorrect: index === q.correctAnswer
            }))
          };
        });
      } catch (parseError) {
        throw new Error(`Failed to parse questions: ${response.questionsJson.substring(0, 100)}`);
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions were generated');
      }

      this.snackBar.open(
        `✨ Successfully generated ${questions.length} questions!`,
        'Close',
        { duration: 3000, panelClass: ['success-snackbar'] }
      );

      // Close dialog and return questions
      this.dialogRef.close({ questions });

    } catch (error: any) {
      // Display error message with better details
      if (error.status === 404) {
        this.errorMessage = 'Course not found. Please check the course ID.';
      } else if (error.status === 400) {
        this.errorMessage = error.error?.message || error.error || 'Invalid request. Please check your input.';
      } else if (error.status === 500) {
        this.errorMessage = error.error?.message || error.error || 'Server error. Please contact backend team.';
      } else if (error.message) {
        // Custom error messages (like JSON parse errors)
        this.errorMessage = error.message;
      } else if (typeof error.error === 'string') {
        // Backend returned plain text error
        this.errorMessage = error.error;
      } else {
        this.errorMessage = 'Failed to generate questions. Please try again or contact backend team.';
      }

      this.snackBar.open(
        '❌ Failed to generate quiz questions',
        'Close',
        { duration: 4000, panelClass: ['error-snackbar'] }
      );
    } finally {
      this.isGenerating = false;
    }
  }
}