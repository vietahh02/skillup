import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Language, LanguageService } from '../../services/language.service';
import { TranslatePipe } from '../../utils/translate.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from "@angular/material/icon";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiAuthServices } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, MatFormFieldModule, MatInputModule, MatIcon],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  currentLanguage: Language = 'en';
  currentLanguageFlag = 'img/flag/usa.png';
  translations: any = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private languageService: LanguageService,
    private apiAuthServices: ApiAuthServices,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.updateFlag();

    // Subscribe to language changes using effect (must be in constructor)
    effect(() => {
      const lang = this.languageService.getCurrentLanguageSignal()();
      this.currentLanguage = lang;
      this.updateFlag();
    });
  }

  ngOnInit(): void {
    if (this.apiAuthServices.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  updateFlag(): void {
    this.currentLanguageFlag = this.currentLanguage === 'en' ? 'img/flag/usa.png' : 'img/flag/myanmar.png';
  }

  // loadTranslations(): void {
  //   this.languageService.getTranslations().subscribe(translations => {
  //     this.translations = translations['auth'] as any;
  //   });
  // }

  changeLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
    this.currentLanguage = lang;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;

      const { username, password } = this.loginForm.value;

      this.apiAuthServices.login(username, password).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.access_token) {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          let errorMessage = '';
          if (error.error?.errorMessage) {
            errorMessage = error.error.errorMessage;
          } else if (error.error?.error_description) {
            errorMessage = error.error.error_description;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (error.message) {
            errorMessage = error.message;
          } else {
            errorMessage = this.languageService.translate('auth.login_failed_generic');
          }

          this.snackBar.open(errorMessage, '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
