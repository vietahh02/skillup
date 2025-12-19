import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatCardModule } from "@angular/material/card";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VideoPlayerDialog } from './video-player-dialog/video-player-dialog';
import { QuestionDetailDialog } from './question-detail-dialog/question-detail-dialog';
import { ApiCourseServices } from '../../../../services/course.service';
import { CourseDetail, Lesson, Question, SubLesson } from '../../../../models/course.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionType } from '../../../../enums/api.enums';
import { DialogService } from '../../../../services/dialog.service';
import { InputDialogComponent, InputDialogData } from '../../../../common/input-dialog/input-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-manager-course-detail',
    imports: [
      CommonModule,
      MatCardModule, 
      MatButtonModule, 
      MatMenuModule, 
      MatTableModule, 
      MatIcon, 
      FormsModule, 
      RouterLink, 
      MatDividerModule,
      MatChipsModule,
      MatBadgeModule,
      MatExpansionModule,
      MatDialogModule,
      MatIconModule,
      MatTooltipModule
    ],
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.scss'],
    providers: [VideoPlayerDialog, QuestionDetailDialog]
})
export class ManagerCourseDetail implements OnInit {
    courseId!: string;
    courseDetail: CourseDetail | null = null;

    documentsDisplayedColumns: string[] = ['name', 'type', 'size', 'uploadDate', 'actions'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog,
        private courseService: ApiCourseServices,
        private snackBar: MatSnackBar,
        private dialogService: DialogService
    ) {}

    ngOnInit() {
        this.courseId = this.route.snapshot.paramMap.get('id')!;
        this.load();
    }

    dateformat(date: string): string {
        return date.split('T')[0];
    }

    formatDuration(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
      
        let result = '';
      
        if (h > 0) {
          result += `${h}h`;
        }
        if (m > 0) {
          result += `${m}m`;
        }
        if (s > 0 && h === 0) { 
          result += `${s}s`;
        } else if (s > 0 && h > 0 && m === 0) {
          result += `${s}s`;
        }
      
        if (result === '') {
          return '0s';
        }
      
        return result;
    }
      
    convertNumberToQuestionType(type: number | string): string {
        if (typeof type === 'string') {
            return type;
        }
    
        switch (type) {
            case 0: return QuestionType.SINGLE_CHOICE;
            case 1: return QuestionType.MULTIPLE_CHOICE;
            case 2: return QuestionType.TRUE_FALSE;
            case 3: return QuestionType.TEXT;
            default:
                return QuestionType.SINGLE_CHOICE;
        }
    }
    
    private load() {
        this.courseService.getCourseById(Number(this.courseId)).subscribe((course: CourseDetail) => {
            this.courseDetail = course;
        }, (error: any) => {
            this.snackBar.open('Failed to load course detail', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
        });
    }

    approveCourse() {
        this.dialogService.confirm({
            type: 'confirm',
            title: 'Confirmation',
            message: `Are you sure you want to approve "${this.courseDetail?.name}"?`,
            confirmText: 'Yes',
            cancelText: 'No'
          }).subscribe((ok: boolean) => {
            if (!ok) {
              return;
            }
            if (this.courseDetail) {
                this.courseService.changeStatus(Number(this.courseId), 'Approved').subscribe(() => {
                    this.load();
                    this.snackBar.open('Course approved successfully', '', {
                        duration: 3000,
                        panelClass: ['success-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                }, (error: any) => {
                    this.snackBar.open('Failed to approve course', '', {
                        duration: 3000,
                        panelClass: ['error-snackbar', 'custom-snackbar'],
                        horizontalPosition: 'right',
                        verticalPosition: 'top'
                    });
                });
            }
        });
        
    }

    rejectCourse() {
        this.dialogService.confirm({
            type: 'confirm',
            title: 'Confirmation',
            message: `Are you sure you want to reject "${this.courseDetail?.name}"?`,
            confirmText: 'Yes',
            cancelText: 'No'
          }).subscribe((ok: boolean) => {
            if (!ok) {
              return;
            }
            
            // Open input dialog to get rejection reason
            const dialogRef = this.dialog.open(InputDialogComponent, {
              width: '500px',
              disableClose: true,
              data: {
                title: 'Rejection Reason',
                message: `Please provide a reason for rejecting "${this.courseDetail?.name}":`,
                label: 'Reason',
                placeholder: 'Enter rejection reason...',
                confirmText: 'Reject',
                cancelText: 'Cancel',
                required: true
              } as InputDialogData
            });

            dialogRef.afterClosed().subscribe((reason: string | null) => {
              if (reason && reason.trim()) {
                this.courseService.changeStatus(Number(this.courseId), 'Rejected', reason).subscribe(() => {
                  this.load();
                  this.snackBar.open('Course rejected successfully', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                  });
                }, (error: any) => {
                  this.snackBar.open('Failed to reject course', '', {
                    duration: 3000,
                    panelClass: ['error-snackbar', 'custom-snackbar'],
                    horizontalPosition: 'right',
                    verticalPosition: 'top'
                  });
                });
              }
            });
        });
    }

    backToCourseList() {
        this.router.navigate(['/manager/courses']);
    }

    getStatusColor(): string {
        if (!this.courseDetail) return '';
        switch (this.courseDetail?.status) {
            case 'Approved': return 'primary';
            case 'Rejected': return 'warn';
            case 'Pending': return 'accent';
            default: return '';
        }
    }

    getFileTypeIcon(type: string): string {
        switch (type) {
            case 'pdf': return 'picture_as_pdf';
            case 'doc': return 'description';
            case 'excel': return 'grid_on';
            case 'ppt': return 'slideshow';
            default: return 'insert_drive_file';
        }
    }

    openVideoDialog(subLesson: SubLesson): void {
        this.dialog.open(VideoPlayerDialog, {
            width: '900px',
            maxWidth: '95vw',
            // maxHeight: '90vh',
            data: subLesson,
            panelClass: 'video-dialog-container'
        });
    }

    openQuestionDialog(question: Question): void {
        this.dialog.open(QuestionDetailDialog, {
            width: '800px',
            maxWidth: '95vw',
            // maxHeight: '90vh',
            data: { question, lesson: this.getLessonName(question.questionId) },
            panelClass: 'question-dialog-container'
        });
    }

    getLessonName(lessonId: number): string {
        const lesson = this.courseDetail?.lessons.find((l: Lesson) => l.lessonId === lessonId);
        return lesson?.title || 'Unknown Lesson';
    }

    getQuestionTypeIcon(type: string): string {
        switch (type) {
            case 'single_choice': return 'radio_button_checked';
            case 'multiple_choice': return 'check_box';
            case 'true_false': return 'help_outline';
            case 'text': return 'text_fields';
            default: return 'help';
        }
    }

    getQuestionTypeLabel(type: string): string {
        switch (type) {
            case 'single_choice': return 'Single Choice';
            case 'multiple_choice': return 'Multiple Choice';
            case 'true_false': return 'True/False';
            case 'text': return 'Text Answer';
            default: return 'Unknown';
        }
    }

    getQuestionTypeColor(type: string): string {
        switch (type) {
            case 'single_choice': return 'primary';
            case 'multiple_choice': return 'accent';
            case 'true_false': return 'warn';
            case 'text': return '';
            default: return '';
        }
    }

    downloadDocument(doc: any): void {
        if (!doc.fileUrl) {
            this.snackBar.open('Document URL not available', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            return;
        }

        // Create a temporary anchor element to trigger download
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.fileName || 'document';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.snackBar.open('Download started', '', {
            duration: 2000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
        });
    }
}



