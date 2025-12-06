import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { LearningPathService } from '../../../../services/learning-path.service';
import { ApiCourseServices } from '../../../../services/course.service';
import { LearningPathItem, CreateLearningPathItemRequest } from '../../../../models/learning-path.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-manager-learning-path-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTabsModule,
    MatToolbarModule,
    DragDropModule
  ],
  templateUrl: './learning-path-form.component.html',
  styleUrl: './learning-path-form.component.scss'
})
export class LearningPathFormComponent implements OnInit {
  pathForm: FormGroup;
  isEditMode = false;
  pathId: number | null = null;
  isLoading = false;
  isSaving = false;

  // Courses in the path
  pathItems: LearningPathItem[] = [];
  displayedColumns: string[] = ['order', 'courseName', 'description', 'isMandatory', 'actions'];

  // Available courses for adding
  availableCourses: any[] = [];
  filteredAvailableCourses: any[] = [];
  courseSearchTerm: string = '';

  // Course add form state (per course)
  courseNotes: { [courseId: number]: string } = {};
  courseMandatory: { [courseId: number]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private learningPathService: LearningPathService,
    private courseService: ApiCourseServices,
    private snackBar: MatSnackBar
  ) {
    this.pathForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    // Check if edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.pathId = +params['id'];
        this.loadLearningPath();
        this.loadPathItems();
      }
    });

    this.loadAvailableCourses();
  }

  async loadLearningPath(): Promise<void> {
    if (!this.pathId) return;

    this.isLoading = true;
    try {
      const path = await firstValueFrom(
        this.learningPathService.getLearningPathById(this.pathId)
      );

      this.pathForm.patchValue({
        name: path.name,
        description: path.description
      });
    } catch (error) {
      console.error('Error loading learning path:', error);
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
      this.filterAvailableCourses();
    } catch (error) {
      console.error('Error loading path items:', error);
      this.snackBar.open('Failed to load courses in path', 'Close', { duration: 3000 });
    }
  }

  async loadAvailableCourses(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.courseService.getCourseListManager(1, 1000) // Load all courses from all lecturers
      );
      this.availableCourses = response.items || [];

      // Initialize defaults
      this.availableCourses.forEach(course => {
        this.courseNotes[course.courseId] = '';
        this.courseMandatory[course.courseId] = true;
      });

      this.filterAvailableCourses();
    } catch (error) {
      console.error('Error loading courses:', error);
      this.snackBar.open('Failed to load available courses', 'Close', { duration: 3000 });
    }
  }

  filterAvailableCourses(): void {
    // Filter out courses already in the path
    const pathCourseIds = this.pathItems.map(item => item.courseId);
    let filtered = this.availableCourses.filter(course => !pathCourseIds.includes(course.courseId));

    // Apply search filter
    if (this.courseSearchTerm.trim()) {
      const searchLower = this.courseSearchTerm.toLowerCase();
      filtered = filtered.filter(course => {
        const name = this.getCourseDisplayName(course).toLowerCase();
        const desc = (course.description || '').toLowerCase();
        return name.includes(searchLower) || desc.includes(searchLower);
      });
    }

    this.filteredAvailableCourses = filtered;
  }

  filterCourses(): void {
    this.filterAvailableCourses();
  }

  isCourseinPath(courseId: number): boolean {
    return this.pathItems.some(item => item.courseId === courseId);
  }

  async save(): Promise<void> {
    if (this.pathForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.pathForm.value;

    try {
      if (this.isEditMode && this.pathId) {
        // Update existing path
        await firstValueFrom(
          this.learningPathService.updateLearningPath(this.pathId, formData)
        );
        this.snackBar.open('Learning path updated successfully', 'Close', { duration: 3000 });
      } else {
        // Create new path
        const newPath = await firstValueFrom(
          this.learningPathService.createLearningPath(formData)
        );
        this.pathId = newPath.learningPathId;
        this.isEditMode = true;

        // Update URL to edit mode without reloading
        this.router.navigate(['/manager/learning-paths/edit', this.pathId], { replaceUrl: true });

        this.snackBar.open('Learning path created successfully. Now you can add courses.', 'Close', { duration: 3000 });
      }
    } catch (error) {
      console.error('Error saving learning path:', error);
      this.snackBar.open('Failed to save learning path', 'Close', { duration: 3000 });
    } finally {
      this.isSaving = false;
    }
  }

  async addCourseToPath(course: any): Promise<void> {
    if (!this.pathId) {
      this.snackBar.open('Please save the learning path first', 'Close', { duration: 3000 });
      return;
    }

    if (this.isCourseinPath(course.courseId)) {
      return;
    }

    const newOrderIndex = this.pathItems.length;

    const itemData: CreateLearningPathItemRequest = {
      courseId: course.courseId,
      orderIndex: newOrderIndex,
      isMandatory: this.courseMandatory[course.courseId] || true,
      description: this.courseNotes[course.courseId] || undefined
    };

    try {
      await firstValueFrom(
        this.learningPathService.createLearningPathItem(this.pathId, itemData)
      );

      // Reload path items
      await this.loadPathItems();

      // Reset form for this course
      this.courseNotes[course.courseId] = '';
      this.courseMandatory[course.courseId] = true;

      this.snackBar.open('Course added to path', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error adding course:', error);
      this.snackBar.open('Failed to add course', 'Close', { duration: 3000 });
    }
  }

  async removeCourse(item: LearningPathItem): Promise<void> {
    try {
      await firstValueFrom(
        this.learningPathService.deleteLearningPathItem(item.id)
      );

      // Reload path items
      await this.loadPathItems();

      this.snackBar.open('Course removed from path', 'Close', { duration: 2000 });
    } catch (error) {
      console.error('Error removing course:', error);
      this.snackBar.open('Failed to remove course', 'Close', { duration: 3000 });
    }
  }

  // Drag and drop for reordering selected courses
  async dropCourse(event: CdkDragDrop<LearningPathItem[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // Optimistically update UI
    const previousOrder = [...this.pathItems];
    moveItemInArray(this.pathItems, event.previousIndex, event.currentIndex);

    try {
      // Update order on server
      const movedItem = this.pathItems[event.currentIndex];
      await firstValueFrom(
        this.learningPathService.reorderLearningPathItem(movedItem.id, event.currentIndex)
      );

      // Reload to get correct server state
      await this.loadPathItems();

      this.snackBar.open('Course reordered', 'Close', { duration: 2000 });
    } catch (error) {
      // Revert on error
      this.pathItems = previousOrder;
      console.error('Error reordering course:', error);
      this.snackBar.open('Failed to reorder course', 'Close', { duration: 3000 });
    }
  }

  async toggleMandatory(item: LearningPathItem): Promise<void> {
    try {
      await firstValueFrom(
        this.learningPathService.updateLearningPathItem(item.id, {
          courseId: item.courseId,
          orderIndex: item.orderIndex,
          isMandatory: !item.isMandatory,
          description: item.description
        })
      );

      // Update local item
      item.isMandatory = !item.isMandatory;

      this.snackBar.open(
        item.isMandatory ? 'Course marked as mandatory' : 'Course marked as optional',
        'Close',
        { duration: 2000 }
      );
    } catch (error) {
      console.error('Error updating course:', error);
      this.snackBar.open('Failed to update course', 'Close', { duration: 3000 });
    }
  }

  cancel(): void {
    this.router.navigate(['/manager/learning-paths']);
  }

  getCourseDisplayName(course: any): string {
    return course.courseName || course.name || course.title || 'Unnamed Course';
  }
}
