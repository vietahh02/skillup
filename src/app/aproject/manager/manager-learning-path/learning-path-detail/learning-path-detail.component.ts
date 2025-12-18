import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LearningPathService } from '../../../../services/learning-path.service';
import { LearningPath, LearningPathItem } from '../../../../models/learning-path.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-manager-learning-path-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './learning-path-detail.component.html',
  styleUrls: ['./learning-path-detail.component.scss']
})
export class LearningPathDetailComponent implements OnInit {
  learningPath: LearningPath | null = null;
  pathItems: LearningPathItem[] = [];
  isLoading = false;
  pathId: number | null = null;

  displayedColumns: string[] = ['order', 'courseName', 'description', 'isMandatory'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private learningPathService: LearningPathService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.pathId = +params['id'];
        this.loadLearningPath();
        this.loadPathItems();
      }
    });
  }

  async loadLearningPath(): Promise<void> {
    if (!this.pathId) return;

    this.isLoading = true;
    try {
      this.learningPath = await firstValueFrom(
        this.learningPathService.getLearningPathById(this.pathId)
      );
    } catch (error) {
      this.snackBar.open('Failed to load learning path', 'Close', { duration: 3000 });
      this.router.navigate(['/manager/learning-paths']);
    } finally {
      this.isLoading = false;
    }
  }

  async loadPathItems(): Promise<void> {
    if (!this.pathId) return;

    try {
      this.pathItems = await firstValueFrom(
        this.learningPathService.getLearningPathItems(this.pathId, 'asc')
      );
    } catch (error) {
      this.snackBar.open('Failed to load courses in path', 'Close', { duration: 3000 });
    }
  }

  goBack(): void {
    this.router.navigate(['/manager/learning-paths']);
  }

  editPath(): void {
    if (this.pathId) {
      this.router.navigate(['/manager/learning-paths/edit', this.pathId]);
    }
  }
}
