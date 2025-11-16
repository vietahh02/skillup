import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

export enum QuestionType {
  SINGLE_CHOICE = 'single_choice',
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  TEXT = 'text'
}

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
    MatDividerModule
  ],
  templateUrl: './quiz-creator.component.html',
  styleUrls: ['./quiz-creator.component.scss']
})
export class QuizCreatorComponent {
  quizForm: FormGroup; 
  QuestionType = QuestionType;

  questionTypes = [
    { value: QuestionType.SINGLE_CHOICE, label: 'One answer correct' },
    { value: QuestionType.MULTIPLE_CHOICE, label: 'Multi answer correct' },
    { value: QuestionType.TRUE_FALSE, label: 'True/False' },
    { value: QuestionType.TEXT, label: 'Text' }
  ];

  constructor(private fb: FormBuilder) {
    this.quizForm = this.fb.group({
      title: ['', Validators.required],
      duration: [null, Validators.required],
      passScore: [null, Validators.required],
      description: [''],
      questions: this.fb.array([])
    });
  }

  getName(ai : number ) :string {
    return `${ai}`
  }

  get questions(): FormArray {
    return this.quizForm.get('questions') as FormArray;
  }

  getAnswers(questionIndex: number): FormArray {
    return this.questions.at(questionIndex).get('answers') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      type: [QuestionType.SINGLE_CHOICE, Validators.required],
      question: ['', Validators.required],
      answers: this.fb.array([]),
      textAnswer: ['']
    });

    this.questions.push(questionGroup);
    this.addAnswer(this.questions.length - 1, '', true);
    this.addAnswer(this.questions.length - 1);
  }

  removeQuestion(index: number): void {
    this.questions.removeAt(index);
  }

  onQuestionTypeChange(questionIndex: number): void {
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
    if (this.quizForm.valid && this.questions.length > 0) {
      const quizData = this.quizForm.value;
      console.log('Quiz Data:', quizData);
      
      // Success message with quiz summary
      const questionCount = this.questions.length;
      const successMessage = `🎉 Quiz "${quizData.title}" created successfully!\n\n📊 Summary:\n• ${questionCount} question${questionCount > 1 ? 's' : ''}\n• ${quizData.duration} minutes duration\n• ${quizData.passScore}% pass score\n\nCheck the console for detailed quiz data.`;
      
      alert(successMessage);
    } else {
      let errorMessage = '⚠️ Please fix the following issues:\n\n';
      
      if (this.questions.length === 0) {
        errorMessage += '• Add at least one question\n';
      }
      
      if (this.quizForm.get('title')?.hasError('required')) {
        errorMessage += '• Quiz title is required\n';
      }
      
      if (this.quizForm.get('duration')?.hasError('required')) {
        errorMessage += '• Duration is required\n';
      }
      
      if (this.quizForm.get('passScore')?.hasError('required')) {
        errorMessage += '• Pass score is required\n';
      }
      
      alert(errorMessage);
      this.markFormGroupTouched(this.quizForm);
    }
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