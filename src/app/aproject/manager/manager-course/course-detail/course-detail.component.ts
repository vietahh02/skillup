import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIcon } from "@angular/material/icon";
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

interface Course {
  id: number;
  name: string;
  type: string;
  createdBy: string;
  createdDate: string;
  status: string;
  description?: string;
  lessons: Lesson[];
  documents?: Document[];
  questions: Question[];
}

interface Lesson {
  id: number;
  lessonName: string;
  description?: string;
  duration?: string;
  subLessons?: SubLesson[];
}

interface SubLesson {
  id: number;
  name: string;
  videoUrl: string;
  duration: string;
  description?: string;
}

interface Document {
  id: number;
  name: string;
  size: string;
  uploadDate: Date;
  type: string;
}

interface Question {
  id: number;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'text';
  question: string;
  answers?: Answer[];
  textAnswer?: string;
  explanation?: string;
}

interface Answer {
  id: number;
  text: string;
  isCorrect: boolean;
}

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
      MatDialogModule
    ],
    templateUrl: './course-detail.component.html',
    styleUrls: ['./course-detail.component.scss'],
    providers: [VideoPlayerDialog, QuestionDetailDialog]
})
export class ManagerCourseDetail implements OnInit {
    courseId!: string;
    course: Course | null = null;
    
    // Lessons table
    displayedColumns: string[] = ['id', 'lessonName', 'description', 'duration'];
    lessonsDataSource = new MatTableDataSource<Lesson>([]);
    
    // Documents table
    documentsDisplayedColumns: string[] = ['name', 'type', 'size', 'uploadDate'];
    documentsDataSource = new MatTableDataSource<Document>([]);

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit() {
        this.courseId = this.route.snapshot.paramMap.get('id')!;
        this.loadCourseDetail();
    }

    private loadCourseDetail() {
        // Simulate loading course data
        this.course = {
            id: parseInt(this.courseId),
            name: 'Advanced JavaScript Programming',
            type: 'Programming',
            createdBy: 'John Smith',
            createdDate: '2025-01-15',
            status: 'Pending',
            description: 'A comprehensive course covering advanced JavaScript concepts including ES6+, async programming, and modern frameworks. This course is designed for developers who want to master JavaScript and build modern web applications.',
            lessons: [
                { 
                    id: 1, 
                    lessonName: 'Introduction to ES6+', 
                    description: 'Modern JavaScript features', 
                    duration: '45 min',
                    subLessons: [
                        { id: 1, name: 'ES6 Syntax Overview', videoUrl: 'https://example.com/video1.mp4', duration: '15 min', description: 'Basic ES6 syntax introduction' },
                        { id: 2, name: 'Arrow Functions', videoUrl: 'https://example.com/video2.mp4', duration: '12 min', description: 'Understanding arrow functions' },
                        { id: 3, name: 'Template Literals', videoUrl: 'https://example.com/video3.mp4', duration: '18 min', description: 'Working with template strings' }
                    ]
                },
                { 
                    id: 2, 
                    lessonName: 'Async/Await Programming', 
                    description: 'Asynchronous JavaScript programming', 
                    duration: '60 min',
                    subLessons: [
                        { id: 4, name: 'Promises Basics', videoUrl: 'https://example.com/video4.mp4', duration: '20 min', description: 'Understanding JavaScript promises' },
                        { id: 5, name: 'Async/Await Syntax', videoUrl: 'https://example.com/video5.mp4', duration: '25 min', description: 'Modern async programming' },
                        { id: 6, name: 'Error Handling', videoUrl: 'https://example.com/video6.mp4', duration: '15 min', description: 'Handling async errors' }
                    ]
                },
                { 
                    id: 3, 
                    lessonName: 'Module Systems', 
                    description: 'ES6 modules and bundling', 
                    duration: '40 min',
                    subLessons: [
                        { id: 7, name: 'Import/Export', videoUrl: 'https://example.com/video7.mp4', duration: '20 min', description: 'ES6 module syntax' },
                        { id: 8, name: 'Module Bundling', videoUrl: 'https://example.com/video8.mp4', duration: '20 min', description: 'Using bundlers like Webpack' }
                    ]
                },
                { 
                    id: 4, 
                    lessonName: 'Advanced Functions', 
                    description: 'Closures, higher-order functions', 
                    duration: '50 min',
                    subLessons: [
                        { id: 9, name: 'Closures Deep Dive', videoUrl: 'https://example.com/video9.mp4', duration: '25 min', description: 'Understanding closures' },
                        { id: 10, name: 'Higher Order Functions', videoUrl: 'https://example.com/video10.mp4', duration: '25 min', description: 'Functions as first-class citizens' }
                    ]
                },
                { 
                    id: 5, 
                    lessonName: 'Final Project', 
                    description: 'Build a complete web application', 
                    duration: '120 min',
                    subLessons: [
                        { id: 11, name: 'Project Setup', videoUrl: 'https://example.com/video11.mp4', duration: '30 min', description: 'Setting up the project structure' },
                        { id: 12, name: 'Building Components', videoUrl: 'https://example.com/video12.mp4', duration: '45 min', description: 'Creating reusable components' },
                        { id: 13, name: 'Final Integration', videoUrl: 'https://example.com/video13.mp4', duration: '45 min', description: 'Putting everything together' }
                    ]
                }
            ],
            documents: [
                {
                    id: 1,
                    name: 'Course Syllabus.pdf',
                    size: '1.2 MB',
                    uploadDate: new Date('2024-12-15'),
                    type: 'pdf'
                },
                {
                    id: 2,
                    name: 'JavaScript Cheat Sheet.pdf',
                    size: '800 KB',
                    uploadDate: new Date('2024-12-20'),
                    type: 'pdf'
                },
                {
                    id: 3,
                    name: 'Project Requirements.docx',
                    size: '600 KB',
                    uploadDate: new Date('2024-12-25'),
                    type: 'doc'
                }
            ],
            questions: [
                {
                    id: 1,
                    type: 'single_choice',
                    question: 'Which of the following is NOT a feature introduced in ES6?',
                    explanation: 'Classes were introduced in ES6, making this the incorrect answer for what is NOT an ES6 feature.',
                    answers: [
                        { id: 1, text: 'Arrow Functions', isCorrect: false },
                        { id: 2, text: 'Template Literals', isCorrect: false },
                        { id: 3, text: 'Classes', isCorrect: true },
                        { id: 4, text: 'Callbacks', isCorrect: false }
                    ]
                },
                {
                    id: 2,
                    type: 'multiple_choice',
                    question: 'Which of the following are valid ways to handle asynchronous operations in JavaScript? (Select all that apply)',
                    explanation: 'Callbacks, Promises, and Async/Await are all valid methods for handling asynchronous operations.',
                    answers: [
                        { id: 5, text: 'Callbacks', isCorrect: true },
                        { id: 6, text: 'Promises', isCorrect: true },
                        { id: 7, text: 'Async/Await', isCorrect: true },
                        { id: 8, text: 'Synchronous Functions', isCorrect: false }
                    ]
                },
                {
                    id: 3,
                    type: 'true_false',
                    question: 'ES6 modules use the import/export syntax.',
                    explanation: 'This is true. ES6 modules indeed use import and export statements.',
                    answers: [
                        { id: 9, text: 'True', isCorrect: true },
                        { id: 10, text: 'False', isCorrect: false }
                    ]
                },
                {
                    id: 4,
                    type: 'text',
                    question: 'Explain what a closure is in JavaScript and provide a simple example.',
                    explanation: 'A closure is a function that has access to variables in its outer scope even after the outer function returns.',
                    textAnswer: 'A closure is a function that retains access to its outer scope even after the outer function has returned. Example: function outer() { let x = 10; return function inner() { return x; }; }'
                },
                {
                    id: 5,
                    type: 'single_choice',
                    question: 'What does the "this" keyword refer to in arrow functions?',
                    explanation: 'Arrow functions do not have their own "this" context and inherit it from the enclosing scope.',
                    answers: [
                        { id: 11, text: 'The function itself', isCorrect: false },
                        { id: 12, text: 'The enclosing scope', isCorrect: true },
                        { id: 13, text: 'The global object', isCorrect: false },
                        { id: 14, text: 'undefined', isCorrect: false }
                    ]
                },
                {
                    id: 6,
                    type: 'multiple_choice',
                    question: 'Which of the following are higher-order functions? (Select all that apply)',
                    explanation: 'Higher-order functions are functions that either take functions as arguments or return functions.',
                    answers: [
                        { id: 15, text: 'map()', isCorrect: true },
                        { id: 16, text: 'filter()', isCorrect: true },
                        { id: 17, text: 'reduce()', isCorrect: true },
                        { id: 18, text: 'parseInt()', isCorrect: false }
                    ]
                },
                {
                    id: 7,
                    type: 'true_false',
                    question: 'Promises can only be resolved, never rejected.',
                    explanation: 'This is false. Promises can be either resolved (fulfilled) or rejected.',
                    answers: [
                        { id: 19, text: 'True', isCorrect: false },
                        { id: 20, text: 'False', isCorrect: true }
                    ]
                },
                {
                    id: 8,
                    type: 'text',
                    question: 'What are the main benefits of using ES6 modules over traditional script tags?',
                    explanation: 'ES6 modules provide better dependency management, namespace isolation, and build tool integration.',
                    textAnswer: 'ES6 modules provide explicit dependency management, namespace isolation, static analysis capabilities, tree shaking for optimization, and better integration with modern build tools.'
                }
            ]
        };
        
        if (this.course) {
            this.lessonsDataSource.data = this.course.lessons || [];
            this.documentsDataSource.data = this.course.documents || [];
        }
    }

    approveCourse() {
        if (this.course && confirm(`Are you sure you want to approve "${this.course.name}"?`)) {
            this.course.status = 'Approved';
            // Here you would typically call an API to update the course status
            alert('Course approved successfully!');
        }
    }

    rejectCourse() {
        if (this.course) {
            const reason = prompt(`Please provide a reason for rejecting "${this.course.name}":`);
            if (reason) {
                this.course.status = 'Rejected';
                // Here you would typically call an API to update the course status
                alert('Course rejected successfully!');
            }
        }
    }

    backToCourseList() {
        this.router.navigate(['/manager/courses']);
    }

    getStatusColor(): string {
        if (!this.course) return '';
        switch (this.course.status) {
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
            data: { question, lesson: this.getLessonName(question.id) },
            panelClass: 'question-dialog-container'
        });
    }

    getLessonName(lessonId: number): string {
        const lesson = this.course?.lessons.find(l => l.id === lessonId);
        return lesson?.lessonName || 'Unknown Lesson';
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
}



