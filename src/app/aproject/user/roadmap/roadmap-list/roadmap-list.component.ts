import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';  
import { MatCard, MatCardContent } from "@angular/material/card";
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  image: string;
  level: string;
  duration: string;
  courses: number;
  skills: string[];
  instructor: string;
  progress?: number;
  isEnrolled?: boolean;
  category: 'Frontend' | 'Backend' | 'Full-Stack' | 'Mobile' | 'DevOps' | 'Data Science';
}

@Component({
  selector: 'app-roadmap-list',
  imports: [MatCard, MatCardContent, MatButtonModule, MatIconModule, MatProgressBarModule, FormsModule, CommonModule],
  templateUrl: './roadmap-list.component.html',
  styleUrls: ['./roadmap-list.component.scss']
})
export class RoadmapListComponent {
  constructor(private router: Router) {}

  searchTerm = '';
  selectedCategory = 'All';

  readonly categories = ['All', 'Frontend', 'Backend', 'Full-Stack', 'Mobile', 'DevOps', 'Data Science'];

  readonly roadmaps: RoadmapItem[] = [
    {
      id: 'frontend-angular',
      title: 'Frontend Development with Angular',
      description: 'Master modern frontend development using Angular framework, TypeScript, and modern web technologies.',
      image: 'img/lms/lms1.jpg',
      level: 'Intermediate',
      duration: '16 weeks',
      courses: 8,
      skills: ['Angular', 'TypeScript', 'HTML', 'CSS', 'RxJS'],
      instructor: 'John Smith',
      progress: 65,
      isEnrolled: true,
      category: 'Frontend'
    },
    {
      id: 'backend-nodejs',
      title: 'Backend Development with Node.js',
      description: 'Build robust backend APIs and services using Node.js, Express, and modern database technologies.',
      image: 'img/lms/lms2.jpg',
      level: 'Intermediate',
      duration: '12 weeks',
      courses: 6,
      skills: ['Node.js', 'Express.js', 'MongoDB', 'PostgreSQL'],
      instructor: 'Sarah Johnson',
      category: 'Backend'
    },
    {
      id: 'fullstack-mean',
      title: 'Full-Stack MEAN Development',
      description: 'Complete web application development using MongoDB, Express.js, Angular, and Node.js stack.',
      image: 'img/lms/lms3.jpg',
      level: 'Advanced',
      duration: '20 weeks',
      courses: 10,
      skills: ['MongoDB', 'Express.js', 'Angular', 'Node.js'],
      instructor: 'Michael Chen',
      category: 'Full-Stack'
    },
    {
      id: 'web-fundamentals',
      title: 'Web Development Fundamentals',
      description: 'Start your web development journey with HTML, CSS, JavaScript basics and modern development tools.',
      image: 'img/lms/lms4.jpg',
      level: 'Beginner',
      duration: '8 weeks',
      courses: 4,
      skills: ['HTML', 'CSS', 'JavaScript', 'Git'],
      instructor: 'Emily Davis',
      progress: 100,
      isEnrolled: true,
      category: 'Frontend'
    },
    {
      id: 'react-development',
      title: 'React Development Mastery',
      description: 'Build modern user interfaces with React, hooks, state management, and component patterns.',
      image: 'img/lms/lms5.jpg',
      level: 'Intermediate',
      duration: '14 weeks',
      courses: 7,
      skills: ['React', 'JavaScript', 'Redux', 'React Router'],
      instructor: 'David Wilson',
      category: 'Frontend'
    },
    {
      id: 'mobile-react-native',
      title: 'Mobile Development with React Native',
      description: 'Create cross-platform mobile applications using React Native and modern mobile development practices.',
      image: 'img/lms/lms6.jpg',
      level: 'Advanced',
      duration: '16 weeks',
      courses: 8,
      skills: ['React Native', 'JavaScript', 'Mobile APIs', 'Redux'],
      instructor: 'Lisa Anderson',
      category: 'Mobile'
    },
    {
      id: 'devops-deployment',
      title: 'DevOps & Cloud Deployment',
      description: 'Learn containerization, CI/CD pipelines, cloud deployment, and infrastructure management.',
      image: 'img/lms/lms7.jpg',
      level: 'Advanced',
      duration: '10 weeks',
      courses: 5,
      skills: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'],
      instructor: 'Robert Taylor',
      category: 'DevOps'
    },
    {
      id: 'data-science-python',
      title: 'Data Science with Python',
      description: 'Master data analysis, machine learning, and visualization using Python and popular data science libraries.',
      image: 'img/lms/lms8.jpg',
      level: 'Intermediate',
      duration: '18 weeks',
      courses: 9,
      skills: ['Python', 'Pandas', 'NumPy', 'Scikit-learn', 'Matplotlib'],
      instructor: 'Dr. Jennifer Martinez',
      category: 'Data Science'
    }
  ];

  get filteredRoadmaps(): RoadmapItem[] {
    let filtered = this.roadmaps;

    // Filter by category
    if (this.selectedCategory !== 'All') {
      filtered = filtered.filter(roadmap => roadmap.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(roadmap => 
        roadmap.title.toLowerCase().includes(searchLower) ||
        roadmap.description.toLowerCase().includes(searchLower) ||
        roadmap.skills.some(skill => skill.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }

  get enrolledRoadmaps(): RoadmapItem[] {
    return this.roadmaps.filter(roadmap => roadmap.isEnrolled);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
  }

  detailRoadmap(roadmap: RoadmapItem): void {
    this.router.navigate(['/roadmap', roadmap.id]);
  }

  enrollRoadmap(roadmap: RoadmapItem, event: Event): void {
    event.stopPropagation();
    roadmap.isEnrolled = true;
    roadmap.progress = 0;
    // Here you would typically call an API to enroll the user
  }

  continueRoadmap(roadmap: RoadmapItem, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/roadmap', roadmap.id]);
  }

  search(): void {
    // Search functionality is handled by filteredRoadmaps getter
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'Beginner': return 'text-soft-success';
      case 'Intermediate': return 'text-soft-warning';
      case 'Advanced': return 'text-soft-danger';
      default: return '';
    }
  }

  getLevelClass(level: string): string {
    switch (level) {
      case 'Beginner': return 'beginner';
      case 'Intermediate': return 'intermediate';
      case 'Advanced': return 'advanced';
      default: return '';
    }
  }

  getRoadmapIcon(category: string): string {
    const icons = {
      'Frontend': 'web',
      'Backend': 'dns',
      'Full-Stack': 'layers',
      'Mobile': 'phone_android',
      'DevOps': 'cloud_upload',
      'Data Science': 'analytics'
    };
    return icons[category as keyof typeof icons] || 'code';
  }
}
