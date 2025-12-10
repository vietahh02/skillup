import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { MatChipsModule } from "@angular/material/chips";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { SubLesson } from "../../../../../models/course.models";

@Component({
    selector: 'video-player-dialog',
    templateUrl: './video-player-dialog.html',
    styleUrls: ['./video-player-dialog.scss'],
    imports: [CommonModule, MatButtonModule, MatIcon, MatDialogModule, MatChipsModule]
})
export class VideoPlayerDialog {
    showFallback = true; // Show fallback since we don't have real videos

    constructor(
        public dialogRef: MatDialogRef<VideoPlayerDialog>,
        @Inject(MAT_DIALOG_DATA) public data: SubLesson
    ) {}

    onVideoLoaded() {
        this.showFallback = false;
    }

    onVideoError() {
        this.showFallback = true;
    }

    simulatePlay() {
        alert(`Playing: ${this.data.title}\nDuration: ${this.data.duration}\n\nIn a real application, the video would start playing here.`);
    }

    toggleFullscreen() {
        // Fullscreen functionality would be implemented here
        const videoElement = document.querySelector('.video-element') as HTMLVideoElement;
        if (videoElement) {
            if (videoElement.requestFullscreen) {
                videoElement.requestFullscreen();
            }
        }
    }

    close() {
        this.dialogRef.close();
    }
}