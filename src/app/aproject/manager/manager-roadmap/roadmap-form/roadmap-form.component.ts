import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  skills: string[];
  isSelected: boolean;
  order?: number;
}

@Component({
  selector: 'app-roadmap-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule,
    MatCheckboxModule,
    MatTabsModule,
    MatCardModule,
    MatToolbarModule,
    DragDropModule
  ],
  templateUrl: './roadmap-form.component.html',
  styleUrl: './roadmap-form.component.scss'
})
export class RoadmapFormComponent implements OnInit {
  roadmapForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  roadmapId: string | null = null;
  
  // Course selection
  courseSearchTerm = '';
  allCourses: Course[] = SAMPLE_COURSES;
  filteredCourses: Course[] = [...SAMPLE_COURSES];
  selectedCourses: Course[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roadmapForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['', [Validators.required]],
      level: ['', [Validators.required]],
      duration: [''],
      instructor: ['']
    });
  }

  ngOnInit(): void {
    this.roadmapId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.roadmapId;

    if (this.isEditMode) {
      this.loadRoadmapData();
    }

    this.filteredCourses = [...this.allCourses];
  }

  // Course selection getters
  get selectedCourseCount(): number {
    return this.selectedCourses.length;
  }

  get allFilteredCoursesSelected(): boolean {
    return this.filteredCourses.length > 0 && 
           this.filteredCourses.every(course => course.isSelected);
  }

  // Course selection methods
  onCategoryChange(): void {
    const selectedCategory = this.roadmapForm.get('category')?.value;
    if (selectedCategory) {
      this.filteredCourses = this.allCourses.filter(course => 
        course.category === selectedCategory || course.category === 'General'
      );
    } else {
      this.filteredCourses = [...this.allCourses];
    }
  }

  filterCourses(): void {
    let filtered = [...this.allCourses];
    
    // Filter by category if selected
    const selectedCategory = this.roadmapForm.get('category')?.value;
    if (selectedCategory) {
      filtered = filtered.filter(course => 
        course.category === selectedCategory || course.category === 'General'
      );
    }
    
    // Filter by search term
    if (this.courseSearchTerm.trim()) {
      const searchLower = this.courseSearchTerm.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }
    
    this.filteredCourses = filtered;
  }

  toggleAllCourses(): void {
    const shouldSelect = !this.allFilteredCoursesSelected;
    this.filteredCourses.forEach(course => {
      course.isSelected = shouldSelect;
    });
    this.updateSelectedCourses();
  }

  onCourseSelection(): void {
    this.updateSelectedCourses();
    this.updateFormFromSelectedCourses();
  }

  private updateSelectedCourses(): void {
    this.selectedCourses = this.allCourses
      .filter(course => course.isSelected)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  private updateFormFromSelectedCourses(): void {
    if (this.selectedCourses.length > 0) {
      // Auto-calculate duration based on selected courses
      const totalHours = this.selectedCourses.reduce((sum, course) => {
        const hours = parseInt(course.duration.split(' ')[0]) || 0;
        return sum + hours;
      }, 0);
      
      const weeks = Math.ceil(totalHours / 40); // Assuming 40 hours per week
      this.roadmapForm.patchValue({
        duration: `${weeks} weeks`
      });

      // Set instructor if all courses have the same instructor
      const instructors = [...new Set(this.selectedCourses.map(c => c.instructor))];
      if (instructors.length === 1) {
        this.roadmapForm.patchValue({
          instructor: instructors[0]
        });
      }
    }
  }

  // Drag and drop for reordering selected courses
  dropCourse(event: CdkDragDrop<Course[]>): void {
    moveItemInArray(this.selectedCourses, event.previousIndex, event.currentIndex);
    
    // Update order property
    this.selectedCourses.forEach((course, index) => {
      course.order = index;
    });
  }

  removeCourse(courseToRemove: Course): void {
    courseToRemove.isSelected = false;
    this.updateSelectedCourses();
    this.updateFormFromSelectedCourses();
  }

  getLevelClass(level: string): string {
    return level.toLowerCase();
  }

  private loadRoadmapData(): void {
    // Simulate loading existing roadmap data
    // In real app, this would be an API call
    setTimeout(() => {
      const mockData = {
        title: 'Full Stack Web Development',
        description: 'Complete full stack development roadmap',
        category: 'Full-Stack',
        level: 'Intermediate',
        duration: '16 weeks',
        instructor: 'Multiple Instructors',
        selectedCourseIds: ['angular-basics', 'nodejs-api', 'database-design']
      };

      this.roadmapForm.patchValue(mockData);
      
      // Mark selected courses
      this.allCourses.forEach((course, index) => {
        if (mockData.selectedCourseIds.includes(course.id)) {
          course.isSelected = true;
          course.order = mockData.selectedCourseIds.indexOf(course.id);
        }
      });
      
      this.updateSelectedCourses();
      this.onCategoryChange();
    }, 500);
  }

  onSubmit(): void {
    if (this.roadmapForm.valid && this.selectedCourses.length > 0) {
      this.isSubmitting = true;
      
      // Collect skills from selected courses
      const allSkills = new Set<string>();
      this.selectedCourses.forEach(course => {
        course.skills.forEach(skill => allSkills.add(skill));
      });

      const formData = {
        ...this.roadmapForm.value,
        skills: Array.from(allSkills),
        selectedCourses: this.selectedCourses,
        selectedCourseIds: this.selectedCourses.map(c => c.id),
        courses: this.selectedCourses.length,
        id: this.roadmapId || this.generateId(),
        createdDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        totalUsers: 0,
        activeUsers: 0,
        completedUsers: 0,
        averageProgress: 0
      };

      // Simulate API call
      setTimeout(() => {
        console.log('Roadmap saved:', formData);
        this.router.navigate(['/manager/roadmaps']);
        this.isSubmitting = false;
      }, 1500);
    }
  }

  onCancel(): void {
    this.router.navigate(['/manager/roadmaps']);
  }

  private generateId(): string {
    return Date.now().toString();
  }
}

// Sample Courses Data
const SAMPLE_COURSES: Course[] = [
  {
    id: 'angular-basics',
    title: 'Angular Fundamentals',
    description: 'Learn the basics of Angular framework including components, services, and routing.',
    instructor: 'John Smith',
    duration: '40 hours',
    level: 'Beginner',
    category: 'Frontend',
    skills: ['Angular', 'TypeScript', 'HTML', 'CSS'],
    isSelected: false
  },
  {
    id: 'angular-advanced',
    title: 'Advanced Angular Concepts',
    description: 'Deep dive into advanced Angular topics like state management, testing, and performance optimization.',
    instructor: 'John Smith',
    duration: '60 hours',
    level: 'Advanced',
    category: 'Frontend',
    skills: ['Angular', 'RxJS', 'NgRx', 'Testing'],
    isSelected: false
  },
  {
    id: 'nodejs-api',
    title: 'Node.js API Development',
    description: 'Build RESTful APIs using Node.js, Express.js, and modern backend technologies.',
    instructor: 'Sarah Johnson',
    duration: '50 hours',
    level: 'Intermediate',
    category: 'Backend',
    skills: ['Node.js', 'Express.js', 'MongoDB', 'REST API'],
    isSelected: false
  },
  {
    id: 'react-fundamentals',
    title: 'React Development Basics',
    description: 'Master React fundamentals including components, hooks, and state management.',
    instructor: 'David Wilson',
    duration: '45 hours',
    level: 'Beginner',
    category: 'Frontend',
    skills: ['React', 'JavaScript', 'JSX', 'Hooks'],
    isSelected: false
  },
  {
    id: 'database-design',
    title: 'Database Design & Management',
    description: 'Learn database design principles and work with SQL and NoSQL databases.',
    instructor: 'Michael Chen',
    duration: '35 hours',
    level: 'Intermediate',
    category: 'Backend',
    skills: ['SQL', 'MongoDB', 'Database Design', 'PostgreSQL'],
    isSelected: false
  },
  {
    id: 'python-ml',
    title: 'Python for Machine Learning',
    description: 'Introduction to machine learning using Python and popular ML libraries.',
    instructor: 'Dr. Jennifer Martinez',
    duration: '70 hours',
    level: 'Advanced',
    category: 'Data Science',
    skills: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
    isSelected: false
  },
  {
    id: 'react-native-mobile',  
    title: 'React Native Mobile Development',
    description: 'Build cross-platform mobile applications using React Native.',
    instructor: 'Lisa Anderson',
    duration: '55 hours',
    level: 'Intermediate',
    category: 'Mobile',
    skills: ['React Native', 'JavaScript', 'Mobile Development', 'Expo'],
    isSelected: false
  },
  {
    id: 'docker-containers',
    title: 'Docker & Containerization',
    description: 'Learn containerization with Docker and deployment strategies.',
    instructor: 'Robert Taylor',
    duration: '30 hours',
    level: 'Intermediate',
    category: 'DevOps',
    skills: ['Docker', 'Containerization', 'DevOps', 'Deployment'],
    isSelected: false
  },
  {
    id: 'web-security',
    title: 'Web Application Security',
    description: 'Essential security practices for web applications and APIs.',
    instructor: 'Emma Thompson',
    duration: '40 hours',
    level: 'Advanced',
    category: 'General',
    skills: ['Security', 'Authentication', 'Authorization', 'OWASP'],
    isSelected: false
  },
  {
    id: 'git-version-control',
    title: 'Git & Version Control',
    description: 'Master Git version control and collaborative development workflows.',
    instructor: 'Alex Rodriguez',
    duration: '20 hours',
    level: 'Beginner',
    category: 'General',
    skills: ['Git', 'GitHub', 'Version Control', 'Collaboration'],
    isSelected: false
  }
];
