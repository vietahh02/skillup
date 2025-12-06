export interface Course {
    courseId: number;
    courseName: string;
    description: string;
    status: CourseStatus;
    courseType: CourseType;
    imageUrl: string | null;
    duration: number | null;
    rejectionReason: string | null;
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
    courseId: number;
    name: string;
    description: string;
    status: string;
    courseType: string;
    courseTypeId: number;
    targetLevel: string;
    targetLevelId: number;
    imageUrl: string;
    duration: number;
    createdBy: number;
    createdByName: string;
    progressPct?: number;
    lecturerImageUrl?: string;
    completedLessons?: number;
    totalLessons?: number;
    createdAt: string;
    deadline: string;
    isEnrolled: boolean;
    lessons: Lesson[];
    quiz: Quiz;
    documents: DocumentItem[];
}

export interface CourseCreateEdit {
    name: string;
    description?: string;
    courseTypeId: number | string;
    targetLevelId: number | string;
    duration: number;
    imageUrl: File;
}

export interface Lesson {
    lessonId: number;
    courseId: number;
    title: string;
    description: string;
    contentType: string;
    url: string;
    publicId: string;
    orderIndex: number;
    totalDuration: number;
    totalSubLessons: number;
    completedSubLessons: number;
    progressPct: number;
    progressStatus: string;
    subLessons: SubLesson[];
}

export interface SubLesson {
    id: number;
    title: string;
    description: string;
    duration: number;
    orderIndex: number;
    contentType: string;
    contentUrl: string;
    publicId: string;
    fileSizeBytes: number;
    createdBy: number;
    createdAt: string;
    updatedAt: string;
    isCompleted: boolean;
    completedAt: string;
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

export interface SubLessonCreateEdit {
    title: string;
    videoUrl?: string;
    videoFile: File | null;
    duration?: string;
    description?: string;
}

export interface CourseUserView {
    courseId: number;
    courseName: string;
    level: string;
    totalLesson: number;
    totalDuration: number;
    creatorName: string;
    imageUrl: string;
    isEnrolled: boolean;
}

export interface reorder {
    courseId: number;
    lessons: {
        lessonId: number;
        orderIndex: number;
    }[]
}

export interface DocumentItem {
    documentId: number;
    courseId: number;
    courseName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileSizeFormatted: string;
    fileUrl: string;
    publicId: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
  }
  
  /* ------------ QUIZZES ------------ */
  
  export interface Quiz {
    quizId: number;
    courseId: number;
    courseName: string;
    title: string;
    passScore: number;
    attemptLimit: number;
    createdAt: string;
    updatedAt: string;
    questions: Question[];
    isCompleted?: boolean;
    userScore?: number;
  }
  
  export interface Question {
    questionId: number;
    quizId: number;
    title: string;
    questionType: string | number;
    points: number;
    orderIndex: number;
    answerOptions: AnswerOption[];
  }
  
  export interface AnswerOption {
    optionId: number;
    questionId: number;
    content: string;
    isCorrect: boolean;
  }

export interface CourseEnrollment {
    courseId: number;
    name: string;
    description: string;
    courseTypeId: number;
    targetLevelId: number;
    image: string;
    createdByName: string;
    startDay: string;
    endDate: string;
    progressPct: number;
    isEnrolled: boolean;
}