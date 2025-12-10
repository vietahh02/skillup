import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {TranslatePipe} from '../../../utils/translate.pipe';
import {ApiAuthServices} from '../../../services/auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-change-password-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        TranslatePipe
    ],
    templateUrl: './change-password-dialog.component.html',
    styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
    changePasswordForm: FormGroup;
    loading = false;
    hideOldPassword = true;
    hideNewPassword = true;
    hideConfirmPassword = true;

    constructor(
        private dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
        private fb: FormBuilder,
        private authService: ApiAuthServices,
        private snackBar: MatSnackBar
    ) {
        this.changePasswordForm = this.fb.group({
            oldPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, {validators: this.passwordMatchValidator});
    }

    passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword');
        const confirmPassword = form.get('confirmPassword');

        if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
            confirmPassword.setErrors({passwordMismatch: true});
            return {passwordMismatch: true};
        }
        return null;
    }

    get oldPasswordControl() {
        return this.changePasswordForm.get('oldPassword');
    }

    get newPasswordControl() {
        return this.changePasswordForm.get('newPassword');
    }

    get confirmPasswordControl() {
        return this.changePasswordForm.get('confirmPassword');
    }

    onSubmit(): void {
        if (this.changePasswordForm.valid) {
            this.loading = true;
            const {oldPassword, newPassword} = this.changePasswordForm.value;

            this.authService.changePassword(oldPassword, newPassword).pipe(
                finalize(() => this.loading = false)
            ).subscribe({
                next: (response) => {
                    this.snackBar.open('Password changed successfully', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                    this.dialogRef.close({success: true});
                },
                error: (error) => {
                    const errorMessage = error?.error?.errorMessage || error?.error?.message || error?.message || 'Failed to change password';
                    this.snackBar.open(errorMessage, '', {
                        duration: 3000,
                        panelClass: ['error-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    toggleOldPasswordVisibility(): void {
        this.hideOldPassword = !this.hideOldPassword;
    }

    toggleNewPasswordVisibility(): void {
        this.hideNewPassword = !this.hideNewPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.hideConfirmPassword = !this.hideConfirmPassword;
    }
}

