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
import { SubLesson, SubLessonCreateEdit } from "../../../../../models/course.models";
import { ApiCourseServices } from "../../../../../services/course.service";

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
    isEdit = false;
    lessonId: number | string = '';
    isDeleteVideo = false;
    fileSizeBytes: number = 0;
    
    constructor(
        public dialogRef: MatDialogRef<CreateSubLesson>, 
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private snack: MatSnackBar,
        private courseService: ApiCourseServices
    ) {
        this.subLessonForm = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(200)]],
            videoFile: [null as File | null, Validators.required],
            description: ['', [Validators.required, Validators.maxLength(1000)]],
        });
    }

    ngOnInit() {
        console.log(this.data);
        this.lessonId = this.data.lesson.lessonId;
        this.isEdit = this.data.subLesson ? true : false;
        if (this.isEdit) {
            this.courseService.detailSubLesson(this.data.subLesson.id).subscribe((subLesson: SubLesson) => {
                this.subLessonForm.patchValue({
                    name: subLesson.title,
                    description: subLesson.description,
                    videoFile: new File([], subLesson.contentUrl || ''),
                });
                this.selectedVideoUrl = subLesson.contentUrl || null;
                this.selectedVideo = new File([], subLesson.contentUrl || '');
                this.fileSizeBytes = subLesson.fileSizeBytes || 0;
                (this.selectedVideo as any).name = subLesson.contentUrl?.split('/').pop() || '';
                this.subLessonForm.get('videoFile')?.updateValueAndValidity();
            });
        }

    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.subLessonForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit(): void {
        this.subLessonForm.markAllAsTouched();
        if (!this.subLessonForm.valid) {
            return;
        }
        const payload = {
            title: this.subLessonForm.value.name,
            videoFile: this.selectedVideo,
            description: this.subLessonForm.value.description,
        } as SubLessonCreateEdit;

        if (this.isEdit) {
            this.courseService.updateSubLesson(this.data.subLesson.id, payload, this.isDeleteVideo).subscribe({
                next: (subLesson: SubLesson) => {
                    this.data.load();
                    this.dialogRef.close(true);
                    this.snack.open('Sub lesson updated successfully', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                },
                error: (error: any) => {
                    this.snack.open('Failed to update sub lesson', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
        } else {
            this.courseService.createSubLesson(payload, this.lessonId).subscribe({
                next: (subLesson: SubLesson) => {
                    this.data.load();
                    this.dialogRef.close(true);
                    this.snack.open('Sub lesson created successfully', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                },
                error: (error: any) => {
                    this.snack.open('Failed to create sub lesson', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }
            });
        }
    }

    close(): void {
        this.dialogRef.close();
    }

    onVideoSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // Validate file type
            if (!file.type.startsWith('video/')) {
                this.snack.open('Please select a valid video file', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
                return;
            }

            // Validate file size (max 100MB)
            if (file.size > 100 * 1024 * 1024) {
                this.snack.open('Video file size must be less than 100MB', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                });
                return;
            }

            this.selectedVideo = file;
            this.isDeleteVideo = false; // Reset delete flag khi chọn video mới
            
            // Create preview URL
            this.selectedVideoUrl = URL.createObjectURL(file);
            
            // Update form control
            this.subLessonForm.patchValue({ videoFile: file });
            this.subLessonForm.get('videoFile')?.updateValueAndValidity();
        }
    }

    removeVideo(): void {
        if (this.selectedVideoUrl) {
            URL.revokeObjectURL(this.selectedVideoUrl);
        }
        this.fileSizeBytes = 0;
        this.isDeleteVideo = true;
        this.selectedVideo = null;
        this.selectedVideoUrl = null;
        this.subLessonForm.patchValue({ videoFile: null });
        
        // Reset file input
        const fileInput = document.getElementById('videoFile') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    getFileSize(bytes: number): string {
        bytes = this.fileSizeBytes === 0 ? bytes : this.fileSizeBytes;
        if (bytes === 0 && this.fileSizeBytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    ngOnDestroy(): void {
        if (this.selectedVideoUrl) {
            URL.revokeObjectURL(this.selectedVideoUrl);
        }
    }
}
