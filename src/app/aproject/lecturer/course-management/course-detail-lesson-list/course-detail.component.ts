import { Component, inject, Inject } from '@angular/core';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from "@angular/material/icon";
import { MatCard, MatCardHeader, MatCardContent, MatCardModule } from "@angular/material/card";
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DocumentDialog } from './document-dialog/document-dialog.component';
import { CreateSubLesson } from './sub-lesson-dialog/dialog-creat-sublesson';
import { Lesson, SubLesson } from '../../../../models/course.models';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiCourseServices } from '../../../../services/course.service';

const ELEMENT_DATA: Lesson[] = [
  { 
    id: 1, 
    title: 'Introduction about Angular', 
    description: 'Basic concepts and getting started with Angular framework',
    duration: '45 min',
    subLessons: [
      { id: 1, name: 'What is Angular?', duration: '15 min', description: 'Overview of Angular framework' },
      { id: 2, name: 'Setting up Development Environment', duration: '20 min', description: 'Install Node.js, Angular CLI and VS Code' },
      { id: 3, name: 'Creating First Angular App', duration: '10 min', description: 'Generate and run your first Angular application' }
    ]
  },
  { 
    id: 2, 
    title: 'Angular HTML Templates', 
    description: 'Learn about Angular templates, data binding and directives',
    duration: '60 min',
    subLessons: [
      { id: 4, name: 'Template Syntax', duration: '20 min', description: 'Understanding Angular template syntax' },
      { id: 5, name: 'Data Binding', duration: '25 min', description: 'One-way and two-way data binding' },
      { id: 6, name: 'Structural Directives', duration: '15 min', description: 'Using *ngIf, *ngFor and other directives' }
    ]
  },
  { 
    id: 3, 
    title: 'Angular SCSS Styling', 
    description: 'Styling Angular components with SCSS and CSS',
    duration: '40 min',
    subLessons: [
      { id: 7, name: 'Component Styles', duration: '15 min', description: 'Understanding component-scoped styles' },
      { id: 8, name: 'SCSS Features', duration: '25 min', description: 'Variables, mixins and nested styles' }
    ]
  },
  { 
    id: 4, 
    title: 'Angular TypeScript', 
    description: 'Working with TypeScript in Angular applications',
    duration: '50 min',
    subLessons: [
      { id: 9, name: 'TypeScript Basics', duration: '20 min', description: 'Types, interfaces and classes' },
      { id: 10, name: 'Angular Components', duration: '30 min', description: 'Creating and managing Angular components' }
    ]
  }
];

@Component({
  selector: 'app-drag-table',
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
  imports: [MatCardModule, MatButtonModule, MatMenuModule, MatTableModule, MatPaginatorModule, MatIcon, DragDropModule, CommonModule, FormsModule, RouterLink, MatDialogModule, MatFormFieldModule, MatInputModule, MatDividerModule, MatTooltipModule, MatExpansionModule, MatChipsModule, ReactiveFormsModule]
})
export class LecturerCourseDetail {
  constructor(public dialog: MatDialog, public router: Router, private route: ActivatedRoute) {}
  id!: string;

  dataSource = new MatTableDataSource(ELEMENT_DATA);
  searchTerm = '';
  lessons: Lesson[] = ELEMENT_DATA;

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id')!;
    console.log(this.id);
  }

  drop(event: CdkDragDrop<Lesson[]>) {
    const prev = this.dataSource.data;
    moveItemInArray(prev, event.previousIndex, event.currentIndex);
    this.dataSource.data = [...prev];
  }

  dropLesson(event: CdkDragDrop<Lesson[]>) {
    moveItemInArray(this.lessons, event.previousIndex, event.currentIndex);
    this.lessons = [...this.lessons];
  }

  dropSubLesson(event: CdkDragDrop<SubLesson[]>, lesson: Lesson) {
    if (lesson.subLessons) {
      moveItemInArray(lesson.subLessons, event.previousIndex, event.currentIndex);
      this.lessons = [...this.lessons];
    }
  }

  detailLesson(lesson:any) {
    this.router.navigate([`lecturer/courses/lesson/${lesson.id}`])
  }

  finalQuiz() {
    this.router.navigate([`lecturer/courses/${this.id}/quiz`])
  }

  openAddEventDialog(enterAnimationDuration: string, exitAnimationDuration: string, lesson?: any): void {
    this.dialog.open(CreateCourse, {
        width: '600px',
        enterAnimationDuration,
        exitAnimationDuration,
        data:{
          lesson, 
          courseId: this.id
        }
    });
  }

  openDocumentDialog(): void {
    this.dialog.open(DocumentDialog, {
      width: '1000px',
      enterAnimationDuration: '300ms',
      exitAnimationDuration: '200ms',
      data: {
        courseId: this.id
      }
    });
  }

  openSubLessonDialog(enterAnimationDuration: string, exitAnimationDuration: string, lesson: Lesson, subLesson?: SubLesson): void {
    const dialogRef = this.dialog.open(CreateSubLesson, {
        width: '600px',
        enterAnimationDuration,
        exitAnimationDuration,
        data: {
          lesson,
          courseId: this.id
        }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleSubLessonResult(lesson, result, subLesson);
      }
    });
  }

  private handleSubLessonResult(lesson: Lesson, subLessonData: any, existingSubLesson?: SubLesson): void {
    if (!lesson.subLessons) {
      lesson.subLessons = [];
    }

    if (existingSubLesson) {
      const index = lesson.subLessons.findIndex(sl => sl.id === existingSubLesson.id);
      if (index !== -1) {
        lesson.subLessons[index] = { ...existingSubLesson, ...subLessonData };
      }
    } else {
      const newSubLesson: SubLesson = {
        id: Date.now(),
        ...subLessonData
      };
      lesson.subLessons.push(newSubLesson);
    }

    this.lessons = [...this.lessons];
  }

  search() {}
}

@Component({
    selector: 'create-course',
    templateUrl: './dialog-create-lesson.html',
    styleUrls: ['./course-detail.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class CreateCourse {

    constructor(
        public dialogRef: MatDialogRef<CreateCourse>, @Inject(MAT_DIALOG_DATA) public data: any,
        private snack: MatSnackBar,
        private courseService: ApiCourseServices,
        private route: ActivatedRoute
    ) {}

    courseId!: number | string;

    fb = inject(FormBuilder);
    lessonForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', []],
    });
    isEdit = false;
    
    ngOnInit() {
      this.courseId = this.data.courseId;
      if (this.data.lesson) {
        this.isEdit = true;
        this.lessonForm.patchValue({
          name: this.data.lesson.name,
          description: this.data.lesson.description,
        });
      }
    }

    onSubmit() {
      this.lessonForm.markAllAsTouched();
      if (!this.lessonForm.valid) return;

      const payload = {
        title: this.lessonForm.value.name,
        description: this.lessonForm.value.description,
      } as Lesson;
      this.courseService.createLesson(this.courseId, payload).subscribe({
        next: (lesson: Lesson) => {
          this.snack.open('Lesson created successfully', '', {
            duration: 3000,
            panelClass: ['success-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          this.snack.open('Failed to create lesson', '', {
            duration: 3000,
            panelClass: ['error-snackbar', 'custom-snackbar'],
            horizontalPosition: 'right',
            verticalPosition: 'top'
          });
        }
      });
    }

    close(){
        this.dialogRef.close(true);
    }

}
