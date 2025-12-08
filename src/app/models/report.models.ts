export interface CourseInfo {
    total: number;
    completed: number;
    inProgress: number;
    failed: number;
  }
  
  export interface UserReport {
    userId: number;
    avatarUrl: string;
    fullName: string;
    email: string;
    level: string;
    course: CourseInfo;
    completionRate: number;
    learningTime: number;
    quizScore: number;
    lastActivity: string;
    status: string;
  }
  