import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiAuthServices } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, ReactiveFormsModule],
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {

    currentStep: 'email' | 'otp' | 'password' = 'email';
    emailForm!: FormGroup;
    otpForm!: FormGroup;
    passwordForm!: FormGroup;
    isSubmitting = false;
    hidePassword = true;
    hideConfirmPassword = true;

    // Store data between steps
    userEmail = '';
    resetToken = '';

    // OTP resend cooldown
    canResendOtp = false;
    resendCooldown = 60;
    private resendInterval: any;

    constructor(
        private fb: FormBuilder,
        private api: ApiAuthServices,
        private snack: MatSnackBar,
        private router: Router
    ) {
        this.emailForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.otpForm = this.fb.group({
            otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
        });

        this.passwordForm = this.fb.group({
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        });
    }

    ngOnDestroy(): void {
        if (this.resendInterval) {
            clearInterval(this.resendInterval);
        }
    }

    // Step 1: Send OTP to email
    sendOtp(): void {
        if (this.emailForm.invalid) {
            this.emailForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.userEmail = this.emailForm.value.email;

        this.api.forgotPassword(this.userEmail).subscribe({
            next: (result: any) => {
                this.isSubmitting = false;
                this.currentStep = 'otp';
                this.startResendCooldown();
                this.snack.open('Mã OTP đã được gửi đến email của bạn!', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            },
            error: (err) => {
                this.isSubmitting = false;
                let errorMessage = 'Gửi OTP thất bại';

                if (err.status === 404) {
                    errorMessage = 'Email không tồn tại trong hệ thống';
                } else if (err.error?.message) {
                    errorMessage = err.error.message;
                }

                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    // Step 2: Verify OTP
    verifyOtp(): void {
        if (this.otpForm.invalid) {
            this.otpForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        const otp = this.otpForm.value.otp;

        this.api.verifyOtp({ email: this.userEmail, otp }).subscribe({
            next: (result: any) => {
                this.isSubmitting = false;
                this.resetToken = result.resetToken || result.data?.resetToken;
                this.currentStep = 'password';
                this.snack.open('Xác thực OTP thành công!', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            },
            error: (err) => {
                this.isSubmitting = false;
                let errorMessage = 'Mã OTP không đúng';

                if (err.status === 400) {
                    errorMessage = err.error?.message || 'Mã OTP không hợp lệ hoặc đã hết hạn';
                } else if (err.error?.message) {
                    errorMessage = err.error.message;
                }

                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    // Step 3: Reset password
    resetPassword(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        const { newPassword, confirmPassword } = this.passwordForm.value;

        if (newPassword !== confirmPassword) {
            this.snack.open('Mật khẩu không khớp!', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            return;
        }

        this.isSubmitting = true;

        this.api.resetPassword({ resetToken: this.resetToken, newPassword }).subscribe({
            next: (result: any) => {
                this.isSubmitting = false;
                this.snack.open('Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/authentication/login']);
                }, 2000);
            },
            error: (err) => {
                this.isSubmitting = false;
                let errorMessage = 'Đặt lại mật khẩu thất bại';

                if (err.status === 400) {
                    errorMessage = err.error?.message || 'Token không hợp lệ hoặc đã hết hạn';
                } else if (err.error?.message) {
                    errorMessage = err.error.message;
                }

                this.snack.open(errorMessage, '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    // Resend OTP
    resendOtp(): void {
        if (!this.canResendOtp) return;

        this.isSubmitting = true;

        this.api.forgotPassword(this.userEmail).subscribe({
            next: (result: any) => {
                this.isSubmitting = false;
                this.startResendCooldown();
                this.snack.open('Mã OTP mới đã được gửi!', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            },
            error: (err) => {
                this.isSubmitting = false;
                this.snack.open('Gửi lại OTP thất bại', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
            }
        });
    }

    // Start cooldown timer for resend OTP
    startResendCooldown(): void {
        this.canResendOtp = false;
        this.resendCooldown = 60;

        if (this.resendInterval) {
            clearInterval(this.resendInterval);
        }

        this.resendInterval = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) {
                this.canResendOtp = true;
                clearInterval(this.resendInterval);
            }
        }, 1000);
    }

    // Go back to previous step
    goBack(): void {
        if (this.currentStep === 'otp') {
            this.currentStep = 'email';
            if (this.resendInterval) {
                clearInterval(this.resendInterval);
            }
        } else if (this.currentStep === 'password') {
            this.currentStep = 'otp';
        }
    }

}