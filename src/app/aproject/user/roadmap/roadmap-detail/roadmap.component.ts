import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';

type PhaseStatus = 'completed' | 'in-progress' | 'upcoming';

interface PhaseMilestone {
  title: string;
  status: PhaseStatus;
}

interface RoadmapPhase {
  id: string;
  title: string;
  duration: string;
  status: PhaseStatus;
  description: string;
  progress: number;
  milestones: PhaseMilestone[];
}

interface SkillProgress {
  name: string;
  progress: number;
  color: string;
}

interface UpcomingEvent {
  title: string;
  date: string;
}

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule
  ],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss']
})
export class RoadMap {
  readonly phases: RoadmapPhase[] = [
    {
      id: 'foundation',
      title: 'Fundamentals',
      duration: '4 weeks',
      status: 'completed',
      description: 'Master the basics of web development including HTML, CSS, JavaScript and version control.',
      progress: 100,
      milestones: [
        { title: 'HTML & CSS Basics', status: 'completed' },
        { title: 'JavaScript Essentials', status: 'completed' },
        { title: 'Git & GitHub', status: 'completed' }
      ]
    },
    {
      id: 'angular',
      title: 'Angular Framework',
      duration: '6 weeks',
      status: 'in-progress',
      description: 'Build modern web applications with Angular, components, services and routing.',
      progress: 65,
      milestones: [
        { title: 'Components & Templates', status: 'completed' },
        { title: 'Services & Dependency Injection', status: 'in-progress' },
        { title: 'Routing & Navigation', status: 'upcoming' }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Topics',
      duration: '4 weeks',
      status: 'upcoming',
      description: 'Dive into state management, testing, performance optimization and best practices.',
      progress: 0,
      milestones: [
        { title: 'State Management', status: 'upcoming' },
        { title: 'Testing & QA', status: 'upcoming' },
        { title: 'Performance Tuning', status: 'upcoming' }
      ]
    },
    {
      id: 'project',
      title: 'Capstone Project',
      duration: '2 weeks',
      status: 'upcoming',
      description: 'Build a complete full-stack application and deploy it to production.',
      progress: 0,
      milestones: [
        { title: 'Project Planning', status: 'upcoming' },
        { title: 'Development & Testing', status: 'upcoming' },
        { title: 'Deployment', status: 'upcoming' }
      ]
    }
  ];

  readonly skills: SkillProgress[] = [
    { name: 'HTML & CSS', progress: 95, color: '#3b82f6' },
    { name: 'JavaScript', progress: 88, color: '#10b981' },
    { name: 'Angular', progress: 65, color: '#f59e0b' },
    { name: 'TypeScript', progress: 72, color: '#8b5cf6' }
  ];

  readonly upcomingEvents: UpcomingEvent[] = [
    {
      title: 'Angular Workshop',
      date: 'Nov 08, 2025',
    },
    {
      title: 'Project Submission',
      date: 'Nov 15, 2025',
    },
    {
      title: 'Code Review Session',
      date: 'Nov 22, 2025',
    }
  ];

  get overallProgress(): number {
    if (!this.phases.length) return 0;
    const total = this.phases.reduce((sum, phase) => sum + phase.progress, 0);
    return Math.round(total / this.phases.length);
  }

  get completedPhases(): number {
    return this.phases.filter(p => p.status === 'completed').length;
  }

  get currentPhase(): RoadmapPhase | undefined {
    return this.phases.find(p => p.status === 'in-progress');
  }

  getStatusIcon(status: PhaseStatus): string {
    return status === 'completed' ? 'check_circle' : 
           status === 'in-progress' ? 'pending' : 'radio_button_unchecked';
  }

  getStatusClass(status: PhaseStatus): string {
    return status;
  }
}

