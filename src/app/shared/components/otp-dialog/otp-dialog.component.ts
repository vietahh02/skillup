import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../../utils/translate.pipe';
import { OtpInputComponent } from '../otp-input/otp-input.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-otp-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    OtpInputComponent,
    ReactiveFormsModule
  ],
  templateUrl: './otp-dialog.component.html',
  styleUrls: ['./otp-dialog.component.scss']
})
export class OtpDialogComponent {
  otpForm: FormGroup;
  otpValue: string = '';
  loading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string },
    private dialogRef: MatDialogRef<OtpDialogComponent>,
    private fb: FormBuilder
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), Validators.pattern(/^\d{6}$/)]]
    });
  }

  onOtpChange(value: string): void {
    this.otpValue = value;
    this.otpForm.patchValue({ otp: value }, { emitEvent: true });
    this.otpForm.get('otp')?.updateValueAndValidity({ emitEvent: true });
  }

  onOtpCompleted(value: string): void {
    this.otpValue = value;
    this.otpForm.patchValue({ otp: value }, { emitEvent: true });
    this.otpForm.get('otp')?.updateValueAndValidity({ emitEvent: true });
  }

  get isSubmitDisabled(): boolean {
    return this.loading || this.otpValue.length !== 6 || !this.otpForm.valid;
  }

  onSubmit(): void {
    if (this.otpForm.valid && this.otpValue.length === 6) {
      this.dialogRef.close({ otp: this.otpValue });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

