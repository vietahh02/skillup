import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";
import { Question } from "../../../../../models/course.models";
import { QuestionType } from "../../../../../enums/api.enums";

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

    convertNumberToQuestionType(type: number | string): string {
        if (typeof type === 'string') {
            return type;
        }
    
        switch (type) {
            case 0: return QuestionType.SINGLE_CHOICE;
            case 1: return QuestionType.MULTIPLE_CHOICE;
            case 2: return QuestionType.TRUE_FALSE;
            case 3: return QuestionType.TEXT;
            default:
                return QuestionType.SINGLE_CHOICE;
        }
    }

    getQuestionTypeIcon(): string {
        switch (this.convertNumberToQuestionType(this.data.question.questionType)) {
            case QuestionType.SINGLE_CHOICE: return 'radio_button_checked';
            case QuestionType.MULTIPLE_CHOICE: return 'check_box';
            case QuestionType.TRUE_FALSE: return 'help_outline';
            case QuestionType.TEXT: return 'text_fields';
            default: return 'help';
        }
    }

    getQuestionTypeLabel(): string {
        switch (this.convertNumberToQuestionType(this.data.question.questionType)) {
            case QuestionType.SINGLE_CHOICE: return 'Single Choice';
            case QuestionType.MULTIPLE_CHOICE: return 'Multiple Choice';
            case QuestionType.TRUE_FALSE: return 'True/False';
            case QuestionType.TEXT: return 'Text Answer';
            default: return 'Unknown';
        }
    }

    close() {
        this.dialogRef.close();
    }
}