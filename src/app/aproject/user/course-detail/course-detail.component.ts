import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiCourseServices } from '../../../services/course.service';
import { CourseDetail } from '../../../models/course.models';
import { CommonModule } from '@angular/common';
import { Feedback, FeedbackComment } from '../../../models/feedback.model';
import { ApiFeedbackServices } from '../../../services/feedback.service';
import { ConfirmDialogComponent } from '../../../common/confirm-dialog/confirm-dialog.component';
import { UserInfo } from '../../../models/user.models';
import { AuthService } from '../../../context/auth.service';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-course-detail',
    imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatMenuModule, MatCheckboxModule, MatExpansionModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.scss'],
})
export class CourseDetailComponent {
    
    constructor(
        private courseService: ApiCourseServices, 
        private route: ActivatedRoute, 
        private feedbackService: ApiFeedbackServices,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private authService: AuthService,
        private router: Router
    ) {}

    course!: CourseDetail;
    id!: string;
    totalDuration!: number;
    feedbacks: Feedback[] = [];
    currentUser: UserInfo | null = null;

    totalFeedbacks: number = 0;
    page = 1;
    pageSize = 10;
    feedbackContent: string = '';
    maxFeedbackLength: number = 2000;
    commentContents: { [key: number]: string } = {}; // Store comment content for each feedback
    maxCommentLength: number = 1000;

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUser = user;
            }
        });

        this.id = this.route.snapshot.paramMap.get('id')!;
        this.courseService.getCourseById(Number(this.id)).subscribe((course : any) => {
            this.checkLesson(course);
            this.course = course;
            this.totalDuration = this.course.lessons.reduce((acc, lesson) => acc + lesson.totalDuration, 0);
            this.loadFeedbacks();
        });
    }

    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    checkLesson(courseDetail: CourseDetail | null): void {
        if (courseDetail?.status !== 'Approved') {
            this.router.navigate(['/']);
        }
    }
    

    toggleReply(feedbackId: string): void {
        const replyElement = document.getElementById(`reply-${feedbackId}`);
        const feedbackIdNum = Number(feedbackId);
        if (replyElement) {
            if (replyElement.style.display === 'none' || replyElement.style.display === '') {
                replyElement.style.display = 'block';
                replyElement.classList.add('show');
            } else {
                replyElement.style.display = 'none';
                replyElement.classList.remove('show');
                this.commentContents[feedbackIdNum] = ''; // Clear content when closing
            }
        }
    }

    getCommentLength(feedbackId: number): number {
        return this.commentContents[feedbackId] ? this.commentContents[feedbackId].length : 0;
    }

    isCommentValid(feedbackId: number): boolean {
        const content = (this.commentContents[feedbackId] || '').trim();
        return content.length > 0 && content.length <= this.maxCommentLength;
    }

    getTimeAgo(date: string) {
        if (!date) {
          return 'never';
        }
    
        const now = new Date();
        const dateObj = new Date(date);
        const diff = now.getTime() - dateObj.getTime();
        
        if (diff < 0) {
          return 'just now';
        }
    
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);
    
        if (years > 0) {
          return `${years} ${years > 1 ? 'years' : 'year'} ago`;
        } else if (months > 0) {
          return `${months} ${months > 1 ? 'months' : 'month'} ago`;
        } else if (days > 0) {
          return `${days} ${days > 1 ? 'days' : 'day'} ago`;
        } else if (hours > 0) {
          return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
        } else if (minutes > 0) {
          return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
        } else if (seconds > 5) {
          return `${seconds} ${seconds > 1 ? 'seconds' : 'second'} ago`;
        } else {
          return 'few seconds ago';
        }
    }

    formatSeconds(totalSeconds: number): string {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
    
        let result = "";
    
        if (hours > 0) result += `${hours}h`;
        if (minutes > 0) result += `${minutes}m`;
        if (seconds > 0 && hours === 0) result += `${seconds}s`; 
        else if (seconds > 0 && minutes === 0) result += `${seconds}s`; 
        else if (seconds > 0 && hours === 0 && minutes > 0) result += `${seconds}s`;
    
        return result || "0s";
    }
    
    loadFeedbacks(): void {
        this.feedbackService.getFeedbacks(Number(this.id), this.page, this.pageSize).subscribe((feedbacks: any) => {
            this.feedbacks = [...this.feedbacks, ...feedbacks.items];
            this.totalFeedbacks = feedbacks.total;
        });
    }

    enrollCourse(): void {
        if (this.course.isEnrolled) {
            this.router.navigate(['/course/learn', this.id]);
            return;
        }

        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Enroll Course',
                message: 'Are you sure you want to enroll this course? This action cannot be undone.',
                type: 'warning'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (!result) return;
            this.courseService.createEnrollment({ userId: this.currentUser?.userId || '', courseId: Number(this.id) }).subscribe((enrollment: any) => {
                this.course.isEnrolled = true;
                this.snackBar.open('Enrollment created successfully', '', {
                    duration: 3000,
                    panelClass: ['success-snackbar', 'custom-snackbar'],    
                });
            });
        });
    }

    loadMoreFeedbacks(): void {
        this.page++;
        this.loadFeedbacks();
    }

    createFeedback(): void {
        const content = this.feedbackContent.trim();
        
        // Validation
        if (!content) {
            this.snackBar.open('Please enter your feedback', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            return;
        }

        if (content.length > this.maxFeedbackLength) {
            this.snackBar.open(`Feedback cannot exceed ${this.maxFeedbackLength} characters`, '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            return;
        }

        this.feedbackService.createFeedback({ courseId: Number(this.id), content: content }).subscribe((feedback: Feedback) => {
            this.feedbacks = [ feedback, ...this.feedbacks];
            this.totalFeedbacks++;
            this.snackBar.open('Feedback created successfully', '', {
                duration: 3000,
                panelClass: ['success-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            this.toggleWriteFeedback();
            this.feedbackContent = '';
        }, error => {
            this.snackBar.open('Failed to create feedback', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
        });
    }

    createComment(feedback: Feedback): void {
        const content = (this.commentContents[feedback.feedbackId] || '').trim();
        
        // Validation
        if (!content) {
            this.snackBar.open('Please enter your reply', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            return;
        }

        if (content.length > this.maxCommentLength) {
            this.snackBar.open(`Reply cannot exceed ${this.maxCommentLength} characters`, '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            return;
        }

        this.feedbackService.createComment({ feedbackId: feedback.feedbackId, commentText: content }).subscribe((comment: FeedbackComment) => {
            feedback.comments = [comment, ...feedback.comments];
            this.snackBar.open('Comment created successfully', '', {
                duration: 3000,
                panelClass: ['success-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
            this.commentContents[feedback.feedbackId] = '';
            this.toggleReply(feedback.feedbackId.toString())
        }, error => {
            this.snackBar.open('Failed to create comment', '', {
                duration: 3000,
                panelClass: ['error-snackbar', 'custom-snackbar'],
                horizontalPosition: 'right',
                verticalPosition: 'top'
            });
        });
        
    }


    canDelete(userId: number): boolean {
        return this.currentUser?.userId === userId;
    }

    toggleWriteFeedback(): void {
        const writeElement = document.getElementById('write-feedback-input');
        if (writeElement) {
            if (writeElement.style.display === 'none' || writeElement.style.display === '') {
                writeElement.style.display = 'block';
                writeElement.classList.add('show');
            } else {
                writeElement.style.display = 'none';
                writeElement.classList.remove('show');
                this.feedbackContent = ''; // Clear content when closing
            }
        }
    }

    getFeedbackLength(): number {
        return this.feedbackContent ? this.feedbackContent.length : 0;
    }

    isFeedbackValid(): boolean {
        const content = this.feedbackContent.trim();
        return content.length > 0 && content.length <= this.maxFeedbackLength;
    }

    deleteFeedback(feedbackId: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Delete Feedback',
                message: 'Are you sure you want to delete this feedback? This action cannot be undone.',
                type: 'warning'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.feedbackService.deleteFeedback(feedbackId).subscribe({
                    next: () => {
                        // Remove feedback from local array
                        this.feedbacks = this.feedbacks.filter(f => f.feedbackId !== feedbackId);
                        this.totalFeedbacks--;
                        
                        this.snackBar.open('Feedback deleted successfully', '', {
                            duration: 3000,
                            panelClass: ['success-snackbar', 'custom-snackbar'],
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        });
                    },
                    error: (error) => {
                        console.error('Error deleting feedback:', error);
                        this.snackBar.open('Failed to delete feedback', '', {
                            duration: 3000,
                            panelClass: ['error-snackbar', 'custom-snackbar'],
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        });
                    }
                });
            }
        });
    }

    deleteComment(commentId: number, feedbackId: number): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Delete Comment',
                message: 'Are you sure you want to delete this comment? This action cannot be undone.',
                type: 'warning'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.feedbackService.deleteComment(commentId).subscribe({
                    next: () => {
                        // Remove comment from local array
                        const feedback = this.feedbacks.find(f => f.feedbackId === feedbackId);
                        if (feedback && feedback.comments) {
                            feedback.comments = feedback.comments.filter(c => c.commentId !== commentId);
                        }
                        
                        this.snackBar.open('Comment deleted successfully', '', {
                            duration: 3000,
                            panelClass: ['success-snackbar', 'custom-snackbar'],
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        });
                    },
                    error: (error) => {
                        console.error('Error deleting comment:', error);
                        this.snackBar.open('Failed to delete comment', '', {
                            duration: 3000,
                            panelClass: ['error-snackbar', 'custom-snackbar'],
                            horizontalPosition: 'right',
                            verticalPosition: 'top'
                        });
                    }
                });
            }
        });
    }
}


