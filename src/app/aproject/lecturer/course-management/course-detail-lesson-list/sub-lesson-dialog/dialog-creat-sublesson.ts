import { CommonModule } from "@angular/common";
import { Component, OnDestroy } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { ReactiveFormsModule } from "@angular/forms";
import { FormsModule } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { FormBuilder } from "@angular/forms";
import { Validators } from "@angular/forms";
import { Inject } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
    selector: 'create-sublesson',
    templateUrl: './dialog-create-sublesson.html',
    styleUrls: ['./dialog-create-sublesson.scss'],
    imports: [CommonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIcon, ReactiveFormsModule, FormsModule]
})
export class CreateSubLesson implements OnDestroy {
    subLessonForm: FormGroup;
    selectedVideo: File | null = null;
    selectedVideoUrl: string | null = null;
    
    constructor(
        public dialogRef: MatDialogRef<CreateSubLesson>, 
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private snack: MatSnackBar
    ) {
        this.subLessonForm = this.fb.group({
            name: ['', Validators.required],
            videoFile: [null as File | null, Validators.required],
            description: [''],
        });
    }

    ngOnInit() {
        console.log('SubLesson dialog data:', this.data);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.subLessonForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        if (this.subLessonForm.valid) {
            this.dialogRef.close(this.subLessonForm.value);
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.subLessonForm.controls).forEach(key => {
                this.subLessonForm.get(key)?.markAsTouched();
            });
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    /**
     * Handle video file selection and preview
     */
    onVideoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // Validate file type
            if (!file.type.startsWith('video/')) {
                this.snack.open('Please select a valid video file', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar']
                });
                return;
            }

            // Validate file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                this.snack.open('Video file size must be less than 100MB', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar']
                });
                return;
            }

            this.selectedVideo = file;
            
            // Create preview URL
            this.selectedVideoUrl = URL.createObjectURL(file);
            
            // Update form control
            this.subLessonForm.patchValue({ videoFile: file });
            this.subLessonForm.get('videoFile')?.updateValueAndValidity();
        }
    }

    /**
     * Remove selected video
     */
    removeVideo(): void {
        if (this.selectedVideoUrl) {
            URL.revokeObjectURL(this.selectedVideoUrl);
        }
        
        this.selectedVideo = null;
        this.selectedVideoUrl = null;
        this.subLessonForm.patchValue({ videoFile: null });
        
        // Reset file input
        const fileInput = document.getElementById('videoFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    /**
     * Format file size for display
     */
    getFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Clean up object URLs on component destroy
     */
    ngOnDestroy(): void {
        if (this.selectedVideoUrl) {
            URL.revokeObjectURL(this.selectedVideoUrl);
        }
    }
}
