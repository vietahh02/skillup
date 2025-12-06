import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiAuthServices } from '../../../services/auth.service';
import { AuthService } from '../../../context/auth.service';
import { TokenService } from '../../../context/token.service';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  hide = true;
  loginForm!: FormGroup;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: ApiAuthServices,
    private snack: MatSnackBar,
    private authService: AuthService,
    private tokenService: TokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
      rememberMe: [true],
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleScript();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSubmit();
    }
  }

  ngOnDestroy(): void {
    // Cleanup interval khi component bị destroy
    if (this.googleAuthCheckInterval) {
      clearInterval(this.googleAuthCheckInterval);
    }
    // Đóng popup nếu vẫn còn mở
    if (this.googleAuthWindow && !this.googleAuthWindow.closed) {
      this.googleAuthWindow.close();
    }
  }

  private loadGoogleScript(): void {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      this.initializeGoogle();
    };
    document.head.appendChild(script);
  }

  private googleAuthWindow: Window | null = null;
  private googleAuthCheckInterval: any = null;

  private initializeGoogle(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleLogin(response),
        auto_select: false
      });
    }
  }

  loginWithGoogle(): void {
    if (typeof google !== 'undefined') {
      // Render button tạm thời trong hidden div để trigger popup
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      google.accounts.id.renderButton(tempDiv, {
        theme: 'outline',
        size: 'large'
      });

      // Trigger click trên button Google đã render
      setTimeout(() => {
        const googleBtn = tempDiv.querySelector('[role="button"]') as HTMLElement;
        if (googleBtn) {
          googleBtn.click();
        }
        // Cleanup
        setTimeout(() => document.body.removeChild(tempDiv), 100);
      }, 10);
    } else {
      this.snack.open('Đang tải Google Sign-In. Vui lòng thử lại.', '', {
        duration: 3000,
        panelClass: ['error-snackbar', 'custom-snackbar'],
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
  }

  handleGoogleLogin(response: any): void {
    const idToken = response.credential;

    this.api.loginWithGoogle(idToken).subscribe(
      (result: any) => {
        console.log('Google login success:', result);

        // Close the modal popup if it exists
        const modal = document.getElementById('google-signin-button')?.closest('div[style*="position: fixed"]');
        const overlay = document.querySelector('div[style*="position: fixed"][style*="background-color: rgba(0, 0, 0, 0.5)"]');
        if (modal && overlay) {
          document.body.removeChild(modal);
          document.body.removeChild(overlay);
        }

        // Save access token
        if (result.accessToken) {
          this.tokenService.setToken(result.accessToken);
        }

        // Save refresh token
        if (result.refreshToken) {
          this.tokenService.setRefreshToken(result.refreshToken);
        }

        // Load user info
        this.authService.loadUserInfo();
        this.tokenService.setupAutoRefresh();
        this.navigateByRole(this.authService.getCurrentUser()?.roles[0] || 'User');

        this.snack.open('Đăng nhập thành công!', '', {
          duration: 3000,
          panelClass: ['success-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      },
      (err) => {
        console.error('Google login error:', err);

        // Close the modal popup if it exists
        const modal = document.getElementById('google-signin-button')?.closest('div[style*="position: fixed"]');
        const overlay = document.querySelector('div[style*="position: fixed"][style*="background-color: rgba(0, 0, 0, 0.5)"]');
        if (modal && overlay) {
          try {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
          } catch (e) {
            // Ignore if already removed
          }
        }

        // Display appropriate error message based on backend response
        let errorMessage = 'Đăng nhập Google thất bại';
        let duration = 5000;

        if (err.status === 401) {
          const message = err.error?.message || '';

          if (message.includes('Invalid Google token')) {
            errorMessage = 'Phiên đăng nhập Google đã hết hạn. Vui lòng thử lại.';
          } else if (message.includes('User not found') || message.includes('Please contact administrator to create your account')) {
            errorMessage = 'Tài khoản của bạn chưa được tạo trong hệ thống. Vui lòng liên hệ quản trị viên để được hỗ trợ.';
            duration = 7000;
          } else if (message.includes('deactivated') || message.includes('Please contact administrator')) {
            errorMessage = 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.';
            duration = 7000;
          } else {
            errorMessage = message || errorMessage;
          }
        } else if (err.status === 500) {
          errorMessage = 'Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại sau.';
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        this.snack.open(errorMessage, '', {
          duration: duration,
          panelClass: ['error-snackbar', 'custom-snackbar'],
          horizontalPosition: 'right',
          verticalPosition: 'top'
        });
      }
    );
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password, rememberMe } = this.loginForm.value;

    this.api.login({
        email: email, 
        password: password
    }).subscribe((result: any) => {
        console.log(result);
        
        // Lưu access token 
        if (result.accessToken) {
          this.tokenService.setToken(result.accessToken);
        }
        
        // Lưu refresh token nếu rememberMe = true
        if (rememberMe && result.refreshToken) {
          this.tokenService.setRefreshToken(result.refreshToken);
        }
        
        // Load thông tin user
        this.authService.loadUserInfo();
        this.tokenService.setupAutoRefresh();
        this.navigateByRole(this.authService.getCurrentUser()?.roles[0] || 'User');
    }, err => {
        this.snack.open(err.error || 'Login failed', '', { 
          duration: 3000, 
          panelClass: ['error-snackbar', 'custom-snackbar'], 
          horizontalPosition: 'right', 
          verticalPosition: 'top' 
        });
        console.error('Login error:', err);
    });
  }

  private navigateByRole(role: string) {
    switch (role.toLowerCase()) {
      case 'admin':
        this.router.navigate(['/admin/']);
        break;
      case 'manager':
        this.router.navigate(['/manager/']);
        break;
      case 'lecturer':
        this.router.navigate(['/lecturer/']);
        break;
      case 'user':
      case 'student':
        this.router.navigate(['/']);
        break;
      default:
        this.router.navigate(['/']);
        break;
    }
  }

}
