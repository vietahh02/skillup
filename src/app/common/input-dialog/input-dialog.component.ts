import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

export interface InputDialogData {
  title?: string;
  message?: string;
  placeholder?: string;
  label?: string;
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}

@Component({
  selector: 'app-input-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.scss']
})
export class InputDialogComponent {
  inputValue: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: InputDialogData,
    private ref: MatDialogRef<InputDialogComponent>
  ) {
    this.data = {
      title: 'Input Required',
      message: 'Please provide the following information:',
      placeholder: 'Enter text here...',
      label: 'Input',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      required: true,
      ...data
    };
  }

  close(ok: boolean) {
    if (ok && this.data.required && !this.inputValue.trim()) {
      return; // Don't close if required and empty
    }
    this.ref.close(ok ? this.inputValue : null);
  }
}

