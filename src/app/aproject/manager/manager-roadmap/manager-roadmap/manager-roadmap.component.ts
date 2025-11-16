import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCard, MatCardContent, MatCardHeader } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatDivider } from "@angular/material/divider";

interface RoadmapManagement {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  courses: number;
  instructor: string;
  totalUsers: number;
  activeUsers: number;
  completedUsers: number;
  averageProgress: number;
  createdDate: string;
  status: 'active' | 'inactive' | 'draft';
  skills: string[];
  selectedCourses?: any[];
  selectedCourseIds?: string[];
}

interface UserRoadmapProgress {
  userId: string;
  userName: string;
  userImage: string;
  roadmapId: string;
  roadmapTitle: string;
  progress: number;
  startDate: string;
  status: 'enrolled' | 'in-progress' | 'completed' | 'paused';
}

@Component({
  selector: 'app-manager-roadmap',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatMenuModule,
    MatPaginatorModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
    CommonModule,
    MatDivider
],
  templateUrl: './manager-roadmap.component.html',
  styleUrls: ['./manager-roadmap.component.scss']
})
export class ManagerRoadmapComponent {
  constructor(private router: Router) {}

  // Roadmap Management Table
  displayedColumns: string[] = ['roadmap', 'category', 'users', 'progress', 'status', 'created', 'actions'];
  dataSource = new MatTableDataSource<RoadmapManagement>(ROADMAP_DATA);
  searchTerm = '';

  // User Progress Table  
  displayedProgressColumns: string[] = ['user', 'roadmap', 'progress', 'status', 'startDate', 'actions'];
  progressDataSource = new MatTableDataSource<UserRoadmapProgress>(USER_PROGRESS_DATA);
  progressSearchTerm = '';

  // View state
  currentView: 'roadmaps' | 'progress' = 'roadmaps';

  @ViewChild('roadmapPaginator') roadmapPaginator!: MatPaginator;
  @ViewChild('progressPaginator') progressPaginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.roadmapPaginator;
    this.progressDataSource.paginator = this.progressPaginator;
  }

  // View switching
  switchView(view: 'roadmaps' | 'progress'): void {
    this.currentView = view;
  }

  // Search functionality
  searchRoadmaps(): void {
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      this.dataSource.filter = searchLower;
    } else {
      this.dataSource.filter = '';
    }
  }

  searchProgress(): void {
    if (this.progressSearchTerm.trim()) {
      const searchLower = this.progressSearchTerm.toLowerCase();
      this.progressDataSource.filter = searchLower;
    } else {
      this.progressDataSource.filter = '';
    }
  }

  // Roadmap actions
  createRoadmap(): void {
    this.router.navigate(['/manager/roadmaps/create']);
  }

  editRoadmap(roadmap: RoadmapManagement): void {
    this.router.navigate(['/manager/roadmaps/edit', roadmap.id]);
  }

  viewRoadmapDetail(roadmap: RoadmapManagement): void {
    this.router.navigate(['/manager/roadmaps/detail', roadmap.id]);
  }

  toggleRoadmapStatus(roadmap: RoadmapManagement): void {
    roadmap.status = roadmap.status === 'active' ? 'inactive' : 'active';
  }

  deleteRoadmap(roadmap: RoadmapManagement): void {
    if (confirm(`Are you sure you want to delete "${roadmap.title}"?`)) {
      const index = this.dataSource.data.indexOf(roadmap);
      if (index > -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource._updateChangeSubscription();
      }
    }
  }

  // User progress actions
  viewUserProgress(userProgress: UserRoadmapProgress): void {
    this.router.navigate(['/manager/users', userProgress.userId]);
  }

  resetUserProgress(userProgress: UserRoadmapProgress): void {
    if (confirm(`Reset progress for ${userProgress.userName}?`)) {
      userProgress.progress = 0;
      userProgress.status = 'enrolled';
      userProgress.startDate = new Date().toLocaleDateString();
    }
  }

  removeUserFromRoadmap(userProgress: UserRoadmapProgress): void {
    if (confirm(`Remove ${userProgress.userName} from ${userProgress.roadmapTitle}?`)) {
      const index = this.progressDataSource.data.indexOf(userProgress);
      if (index > -1) {
        this.progressDataSource.data.splice(index, 1);
        this.progressDataSource._updateChangeSubscription();
      }
    }
  }

  // Utility methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'text-soft-success';
      case 'inactive': return 'text-soft-danger';
      case 'draft': return 'text-soft-warning';
      case 'completed': return 'text-soft-success';
      case 'in-progress': return 'text-soft-primary';
      case 'paused': return 'text-soft-warning';
      case 'enrolled': return 'text-soft-info';
      default: return '';
    }
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'Beginner': return 'text-soft-success';
      case 'Intermediate': return 'text-soft-warning';
      case 'Advanced': return 'text-soft-danger';
      default: return '';
    }
  }

  // Statistics
  get totalRoadmaps(): number {
    return this.dataSource.data.length;
  }

  get activeRoadmaps(): number {
    return this.dataSource.data.filter(r => r.status === 'active').length;
  }

  get totalEnrolledUsers(): number {
    return this.dataSource.data.reduce((sum, r) => sum + r.totalUsers, 0);
  }

  get averageCompletionRate(): number {
    const roadmaps = this.dataSource.data.filter(r => r.totalUsers > 0);
    if (roadmaps.length === 0) return 0;
    
    const totalRate = roadmaps.reduce((sum, r) => {
      return sum + (r.completedUsers / r.totalUsers * 100);
    }, 0);
    
    return Math.round(totalRate / roadmaps.length);
  }
}

// Sample Data
const ROADMAP_DATA: RoadmapManagement[] = [
  {
    id: 'frontend-angular',
    title: 'Frontend Development with Angular',
    description: 'Master modern frontend development using Angular framework and TypeScript',
    category: 'Frontend',
    level: 'Intermediate',
    duration: '16 weeks',
    courses: 8,
    instructor: 'John Smith',
    totalUsers: 45,
    activeUsers: 32,
    completedUsers: 8,
    averageProgress: 67,
    createdDate: '2024-01-15',
    status: 'active',
    skills: ['Angular', 'TypeScript', 'HTML', 'CSS']
  },
  {
    id: 'backend-nodejs',
    title: 'Backend Development with Node.js',
    description: 'Build robust backend APIs and services using Node.js and Express',
    category: 'Backend',
    level: 'Intermediate',
    duration: '12 weeks',
    courses: 6,
    instructor: 'Sarah Johnson',
    totalUsers: 38,
    activeUsers: 28,
    completedUsers: 12,
    averageProgress: 72,
    createdDate: '2024-02-10',
    status: 'active',
    skills: ['Node.js', 'Express.js', 'MongoDB']
  },
  {
    id: 'fullstack-mean',
    title: 'Full-Stack MEAN Development',
    description: 'Complete web application development using MEAN stack',
    category: 'Full-Stack',
    level: 'Advanced',
    duration: '20 weeks',
    courses: 10,
    instructor: 'Michael Chen',
    totalUsers: 25,
    activeUsers: 18,
    completedUsers: 3,
    averageProgress: 45,
    createdDate: '2024-03-05',
    status: 'active',
    skills: ['MongoDB', 'Express.js', 'Angular', 'Node.js']
  },
  {
    id: 'mobile-react-native',
    title: 'Mobile Development with React Native',
    description: 'Create cross-platform mobile applications',
    category: 'Mobile',
    level: 'Advanced',
    duration: '16 weeks',
    courses: 8,
    instructor: 'Lisa Anderson',
    totalUsers: 20,
    activeUsers: 15,
    completedUsers: 2,
    averageProgress: 38,
    createdDate: '2024-03-20',
    status: 'inactive',
    skills: ['React Native', 'JavaScript', 'Mobile APIs']
  },
  {
    id: 'web-fundamentals',
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of web development',
    category: 'Frontend',
    level: 'Beginner',
    duration: '8 weeks',
    courses: 4,
    instructor: 'Emily Davis',
    totalUsers: 65,
    activeUsers: 45,
    completedUsers: 18,
    averageProgress: 78,
    createdDate: '2023-12-01',
    status: 'active',
    skills: ['HTML', 'CSS', 'JavaScript', 'Git']
  }
];

const USER_PROGRESS_DATA: UserRoadmapProgress[] = [
  {
    userId: '1',
    userName: 'Alice Johnson',
    userImage: 'img/user/user1.jpg',
    roadmapId: 'frontend-angular',
    roadmapTitle: 'Frontend Development with Angular',
    progress: 85,
    startDate: '2024-10-01',
    status: 'in-progress'
  },
  {
    userId: '2',
    userName: 'Bob Smith',
    userImage: 'img/user/user2.jpg',
    roadmapId: 'backend-nodejs',
    roadmapTitle: 'Backend Development with Node.js',
    progress: 100,
    startDate: '2024-09-15',
    status: 'completed'
  },
  {
    userId: '3',
    userName: 'Carol Wilson',
    userImage: 'img/user/user3.jpg',
    roadmapId: 'web-fundamentals',
    roadmapTitle: 'Web Development Fundamentals',
    progress: 45,
    startDate: '2024-10-15',
    status: 'paused'
  },
  {
    userId: '4',
    userName: 'David Brown',
    userImage: 'img/user/user4.jpg',
    roadmapId: 'fullstack-mean',
    roadmapTitle: 'Full-Stack MEAN Development',
    progress: 30,
    startDate: '2024-10-20',
    status: 'in-progress'
  },
  {
    userId: '5',
    userName: 'Eva Martinez',
    userImage: 'img/user/user5.jpg',
    roadmapId: 'frontend-angular',
    roadmapTitle: 'Frontend Development with Angular',
    progress: 0,
    startDate: '2024-11-01',
    status: 'enrolled'
  }
];
