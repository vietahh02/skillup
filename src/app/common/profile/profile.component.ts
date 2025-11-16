import { Component, inject, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { UserProfile } from '../../models/auth.models';
import { ApiAuthServices } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiUserServices } from '../../services/user.service';
import { AuthService } from '../context/auth.service';
@Component({
    selector: 'app-profile',
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule, RouterLinkActive, MatFormFieldModule, MatInputModule,MatIconModule,
        MatDatepickerModule,
        MatNativeDateModule,ReactiveFormsModule,MatSelectModule,CommonModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnDestroy {
    private fb = inject(FormBuilder);
    profileForm = this.fb.group({
        fullName: ['', [Validators.required]],
        email: [{value: '', disabled: true}, [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[\+]?[0-9]{10,15}$/)]],
        location: ['', [Validators.required]],
        dateOfBirth: [null as Date | null, [Validators.required]],
        gender: ['', [Validators.required]],
        level: ['', [Validators.required]],
        avatar: [null as File | null, [Validators.required]],
    });

    constructor(private apiAuthService: ApiAuthServices, private snack: MatSnackBar,
        private apiUser : ApiUserServices, private authService : AuthService
    ) {}

    userProfile: UserProfile | null = null;
    previewUrl: string | null = null;
    selectedFile: File | null = null;

    ngOnInit() {
        this.loadUserProfile();
    }

    genderList = [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' },
        { value: 'Other', label: 'Other' },
    ];

    private loadUserProfile() {
        this.apiAuthService.getUserInfo().subscribe((userProfile: UserProfile) => {
            this.userProfile = userProfile;
            this.profileForm.patchValue({
                fullName: userProfile.fullName || '',
                email: userProfile.email || '',
                phone: userProfile.phone || '',
                location: userProfile.location,
                dateOfBirth: userProfile.dateOfBirth ? new Date(userProfile.dateOfBirth) : null,
                gender: userProfile.gender || '',
                level: userProfile.level || '',
                avatar: userProfile.avatarUrl ? new File([], userProfile.avatarUrl) : null,
            });
            this.previewUrl = null;
            this.selectedFile = null;
        });
    }

    onSubmit() {
        this.profileForm.markAllAsTouched();
        if (this.selectedFile) {
            this.apiUser.uploadAvatar(this.selectedFile!).subscribe((response) => {
                this.snack.open("Update profile successfully", '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
                this.loadUserProfile();
                this.authService.setAvatarCurrentUser(response.url);
            });
        }

        this.apiAuthService.updateUserInfo(this.profileForm.value).subscribe((response) => {
            this.authService.updateUserInfo(this.profileForm.value);
            this.snack.open("Update profile successfully", '', { duration: 2200, panelClass: ['success-snackbar', 'custom-snackbar'], horizontalPosition: 'right', verticalPosition: 'top' });
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            
            // Check if file is an image
            if (file.type.startsWith('image/')) {
                this.selectedFile = file;
                
                // Create preview URL
                if (this.previewUrl) {
                    URL.revokeObjectURL(this.previewUrl);
                }
                this.previewUrl = URL.createObjectURL(file);
            } else {
                alert('Please select a valid image file.');
                input.value = '';
            }
        }
    }

    clearPreview(): void {
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
        }
        this.previewUrl = null;
        this.selectedFile = null;
        
        // Clear the file input
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    ngOnDestroy(): void {
        // Clean up preview URL to prevent memory leaks
        if (this.previewUrl) {
            URL.revokeObjectURL(this.previewUrl);
        }
    }

}