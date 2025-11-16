import { Component } from '@angular/core';
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
import { AuthService } from '../../context/auth.service';
import { TokenService } from '../../context/token.service';

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
export class LoginComponent {
  hide = true;
  loginForm!: FormGroup;
  isSubmitted = false;

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private api: ApiAuthServices, 
    private snack: MatSnackBar,
    private authService: AuthService,
    private tokenService: TokenService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [true],
    });
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
