import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";

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

@Component({
    selector: 'question-detail-dialog',
    templateUrl: './question-detail-dialog.html',
    styleUrls: ['./question-detail-dialog.scss'],
    imports: [CommonModule, MatButtonModule, MatIcon, MatDialogModule, MatChipsModule]
})
export class QuestionDetailDialog {
    constructor(
        public dialogRef: MatDialogRef<QuestionDetailDialog>,
        @Inject(MAT_DIALOG_DATA) public data: { question: Question }
    ) {}

    getQuestionTypeIcon(): string {
        switch (this.data.question.type) {
            case 'single_choice': return 'radio_button_checked';
            case 'multiple_choice': return 'check_box';
            case 'true_false': return 'help_outline';
            case 'text': return 'text_fields';
            default: return 'help';
        }
    }

    getQuestionTypeLabel(): string {
        switch (this.data.question.type) {
            case 'single_choice': return 'Single Choice';
            case 'multiple_choice': return 'Multiple Choice';
            case 'true_false': return 'True/False';
            case 'text': return 'Text Answer';
            default: return 'Unknown';
        }
    }

    close() {
        this.dialogRef.close();
    }
}