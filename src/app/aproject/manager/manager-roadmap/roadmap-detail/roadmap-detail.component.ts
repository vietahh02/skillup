import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

interface RoadmapDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  instructor: string;
  skills: string[];
  selectedCourses: Course[];
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  averageProgress: number;
  createdDate: string;
  status: 'active' | 'inactive' | 'draft';
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  category: string;
  skills: string[];
  order: number;
}

@Component({
  selector: 'app-roadmap-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatToolbarModule,
    MatChipsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './roadmap-detail.component.html',
  styleUrl: './roadmap-detail.component.scss'
})
export class RoadmapDetailComponent implements OnInit {
  roadmap: RoadmapDetail | null = null;
  roadmapId: string | null = null;
  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.roadmapId = this.route.snapshot.paramMap.get('id');
    if (this.roadmapId) {
      this.loadRoadmapDetail();
    }
  }

  private loadRoadmapDetail(): void {
    // Simulate API call to load roadmap detail
    setTimeout(() => {
      this.roadmap = {
        id: this.roadmapId!,
        title: 'Full Stack Web Development',
        description: 'A comprehensive roadmap covering frontend and backend development using modern technologies. Students will learn Angular, Node.js, databases, and deployment strategies.',
        category: 'Full-Stack',
        level: 'Intermediate',
        duration: '16 weeks',
        instructor: 'Multiple Instructors',
        skills: ['Angular', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'REST API', 'Database Design', 'PostgreSQL'],
        selectedCourses: [
          {
            id: 'angular-basics',
            title: 'Angular Fundamentals',
            description: 'Learn the basics of Angular framework including components, services, and routing.',
            instructor: 'John Smith',
            duration: '40 hours',
            level: 'Beginner',
            category: 'Frontend',
            skills: ['Angular', 'TypeScript', 'HTML', 'CSS'],
            order: 0
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
            order: 1
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
            order: 2
          }
        ],
        totalUsers: 125,
        activeUsers: 89,
        completedUsers: 23,
        averageProgress: 67,
        createdDate: '2024-10-15',
        status: 'active'
      };
      
      this.isLoading = false;
    }, 800);
  }

  goBack(): void {
    this.router.navigate(['/manager/roadmaps']);
  }

  editRoadmap(): void {
    this.router.navigate(['/manager/roadmaps/edit', this.roadmapId]);
  }

  getLevelClass(level: string): string {
    return level.toLowerCase();
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getTotalDuration(): string {
    if (!this.roadmap?.selectedCourses) return '0 hours';
    
    const totalHours = this.roadmap.selectedCourses.reduce((sum, course) => {
      const hours = parseInt(course.duration.split(' ')[0]) || 0;
      return sum + hours;
    }, 0);
    
    return `${totalHours} hours`;
  }
}
