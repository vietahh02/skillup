import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ApiFeedbackServices } from '../../../../../services/feedback.service';
import { AuthService } from '../../../../../context/auth.service';
import { Feedback, FeedbackComment } from '../../../../../models/feedback.model';
import { UserInfo } from '../../../../../models/user.models';
import { ConfirmDialogComponent } from '../../../../../common/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-feedbacks-course',
    imports: [CommonModule, MatCardModule, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
    templateUrl: './feedbacks-course.component.html',
    styleUrls: ['./feedbacks-course.component.scss'],
})
export class FeedbacksCourseComponent {
    
    constructor(
        private feedbackService: ApiFeedbackServices,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private authService: AuthService
    ) {}

    @Input() courseId!: string | number;
    @Input() status: string | undefined;
    feedbacks: Feedback[] = [];
    currentUser: UserInfo | null = null;

    totalFeedbacks: number = 0;
    page = 1;
    pageSize = 10;
    commentContents: { [key: number]: string } = {}; // Store comment content for each feedback
    maxCommentLength: number = 1000;

    ngOnInit(): void {
        this.authService.currentUser$.subscribe(user => {
            if (user) {
                this.currentUser = user;
            }
        });
        this.loadFeedbacks();
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

    loadFeedbacks(): void {
        this.feedbackService.getFeedbacks(Number(this.courseId), this.page, this.pageSize).subscribe((feedbacks: any) => {
            this.feedbacks = [...this.feedbacks, ...feedbacks.items];
            this.totalFeedbacks = feedbacks.total;
        });
    }

    loadMoreFeedbacks(): void {
        this.page++;
        this.loadFeedbacks();
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


