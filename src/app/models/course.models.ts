import { QuestionType } from "../enums/api.enums";
import { Quiz } from "./quiz.models";

export interface Course {
    courseId: number;
    name: string;
    description: string;
    status: CourseStatus;
    courseType: CourseType;
    imageUrl: string | null;
    duration: number | null;
    level: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
    lessons: Lesson[];
}

export interface CoursePaginatedResponse<T> {
    page: number;
    pageSize: number;
    total: number;
    items: T[];
}

enum CourseStatus {
    APPROVED = "Approved",
    PENDING = "Pending",
    DRAFT = "Draft",
    REJECTED = "Rejected"
  }
  
  enum CourseType {
    ONBOARDING = "Onboarding",
    TECHNICAL = "Technical",
    SOFT_SKILLS = "SoftSkills",
    MANAGEMENT = "Management"
  }

export interface CourseDetail {
    id: number;
    name: string;
    description: string;
    image: string;
    duration: number;
    category: string;
    level: string;
}

export interface CourseCreateEdit {
    name: string;
    description?: string;
    image: File | null;
    duration: number;
    category: string;
    level: string;
}

export interface Lesson {
    id?: number;
    title: string;
    description?: string;
    duration?: string;
    subLessons?: SubLesson[];
}

export interface SubLesson {
    id: number;
    name: string;
    videoUrl?: string;
    videoFile?: File;
    duration?: string;
    description?: string;
    // quizId?: number;
}

export interface SubLessonCreateEdit {
    name: string;
    videoFile: File | null;
    description?: string;
    // quizId?: number;
}


export interface CourseDetailManager {
    id: number;
    name: string;
    description: string;
    image: string;
    duration: number;
    category: string;
    level: string;
    quizzes?: Quiz[];
}
