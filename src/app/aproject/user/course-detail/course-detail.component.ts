import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-course-detail',
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule, MatCheckboxModule, MatExpansionModule, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule],
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.scss'],
})
export class CourseDetail {
    
    constructor() {}

    toggleReply(feedbackId: string): void {
        const replyElement = document.getElementById(`reply-${feedbackId}`);
        if (replyElement) {
            if (replyElement.style.display === 'none' || replyElement.style.display === '') {
                replyElement.style.display = 'block';
                replyElement.classList.add('show');
            } else {
                replyElement.style.display = 'none';
                replyElement.classList.remove('show');
            }
        }
    }

    loadMoreComments(feedbackId: string): void {
        // Logic to load more comments
        console.log(`Loading more comments for ${feedbackId}`);
        // Here you would typically call a service to fetch more comments
        // and update the UI accordingly
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
            }
        }
    }
}

