import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, ReactiveFormsModule],
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {

    hide = true;
    hideConfirm = true;
    resetPasswordForm!: FormGroup;

    constructor(private fb: FormBuilder) {
        this.resetPasswordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]],
            confirmPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(25), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)]]
        });
    }

    onSubmit() {
        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }

        const { newPassword, confirmPassword } = this.resetPasswordForm.value;
        if (newPassword !== confirmPassword) {
            // You can add a custom validator or show error message here
            return;
        }

        // Handle reset password logic here
    }

}