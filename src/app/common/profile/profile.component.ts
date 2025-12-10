import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '../../utils/translate.pipe';
import { CommonModule } from '@angular/common';
import { MatIcon } from "@angular/material/icon";
import { MatProgressBar } from "@angular/material/progress-bar";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatOption, MatSelect } from '@angular/material/select';
import { LanguageService } from '../../services/language.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiProfileServices } from '../../services/profile.service';
import { Profile, ProfileUpdateDto } from '../../models/profile.model';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslatePipe, MatIcon, MatProgressBar, ReactiveFormsModule, MatOption, MatSelect],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnDestroy {
    isSubmitting = false;
    loading = false;

    profileForm: FormGroup;
    profile?: Profile;
    avatarUrl?: string;
    avatarFile?: File;
    previewAvatarUrl?: string;

    languageOptions = [
        { value: 'en', label: 'English' },
        { value: 'my', label: 'Myanmar' },
    ];

    constructor(
        private fb: FormBuilder,
        private snack: MatSnackBar,
        private translate: LanguageService, 
        private api: ApiProfileServices,
    ) {
        this.profileForm = this.fb.group({
            fullName: ['', [Validators.required, Validators.maxLength(255)]],
            email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
            phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{1,3}?[-.\s()]?[0-9]{1,4}[-.\s()]?[0-9]{3,4}[-.\s()]?[0-9]{3,4}$/)
            ]],
            language: ['', [Validators.required]],
        });
    }

    ngOnInit() {
        this.loadProfile();
    }

    loadProfile() {
        this.loading = true;
        this.api.getProfile().pipe(finalize(() => {
            this.loading = false;
        })).subscribe({
            next: (res) => {
                this.profile = res;
                this.profileForm.patchValue({
                    fullName: this.profile?.fullName,
                    email: this.profile?.email,
                    phoneNumber: this.profile?.phoneNumber,
                    partnerName: this.profile?.partnerName,
                    language: this.profile?.language,
                });
            },
            error: (e) => {
                this.snack.open(e?.error?.errorMessage || this.translate.translate('profile.failedToLoadProfile'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            }
        });
    }

    onFileChange(event: any) {
        const file = event.target.files[0];
        if (file) {
            if (this.previewAvatarUrl) {
                URL.revokeObjectURL(this.previewAvatarUrl);
            }
            this.previewAvatarUrl = URL.createObjectURL(file);
            this.avatarFile = file;
        }
    }

    onSubmit() {
        this.profileForm.markAllAsTouched();
        if (this.profileForm.invalid) {
            this.snack.open(this.translate.translate('common.formInvalid'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            return;
        }
        this.loading = true;
        this.isSubmitting = true;
        const formVal = this.profileForm.getRawValue();
        const profile: any = {
            fullName: formVal.fullName,
            email: formVal.email,
            phoneNumber: formVal.phoneNumber,
            language: formVal.language,
        };

        const payload: ProfileUpdateDto = {
            request: profile,
            file: this.avatarFile,
        };
        
        this.api.updateProfile(payload).pipe(finalize(() => {
            this.loading = false;
            this.isSubmitting = false;
        })).subscribe({
            next: () => {
                this.snack.open(this.translate.translate('profile.profileUpdatedSuccessfully'), '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                if (this.previewAvatarUrl) {
                    URL.revokeObjectURL(this.previewAvatarUrl);
                    this.previewAvatarUrl = undefined;
                }
                this.avatarFile = undefined;
                this.loadProfile();
            },
            error: (e) => {
                this.snack.open(e?.error?.errorMessage || this.translate.translate('profile.failedToUpdateProfile'), '', { duration: 2200, panelClass: ['error-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
            }
        });
    }

    ngOnDestroy() {
        if (this.previewAvatarUrl) {
            URL.revokeObjectURL(this.previewAvatarUrl);
        }
    }
}