// Learning Path Models

// Learning Path (Roadmap)
export interface LearningPath {
  learningPathId: number;
  name: string;
  description: string;
  category?: string;                    // NEW: Category (Backend, Frontend, Full-Stack, etc.)
  totalEnrolledUsers?: number;          // NEW: Number of users enrolled
  averageProgress?: number;             // NEW: Average progress % of all users
  status?: 'Active' | 'Inactive' | 'Draft';  // NEW: Learning path status
  createdBy: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// Learning Path Item (Course trong Path)
export interface LearningPathItem {
  id: number;                    // Learning path item ID
  learningPathId: number;
  courseId: number;
  courseName: string;
  description: string;
  orderIndex: number;            // Thứ tự trong path (0, 1, 2, ...)
  isMandatory: boolean;          // Bắt buộc hay optional
  progressPct?: number;          // Progress của course này (0-100) - từ backend
  enrollmentStatus?: 'NotStarted' | 'InProgress' | 'Completed';  // Enrollment status - từ backend
}

// Paginated Learning Paths Response
export interface LearningPathsResponse {
  total: number;
  items: LearningPath[];
  page: number;
  pageSize: number;
}

// Create/Update Learning Path Request
export interface CreateLearningPathRequest {
  name: string;
  description: string;
}

// Create Learning Path Item Request
export interface CreateLearningPathItemRequest {
  courseId: number;
  orderIndex: number;
  isMandatory: boolean;
  description?: string;  // Optional description for this course in the path
}

// Update Learning Path Item Request
export interface UpdateLearningPathItemRequest {
  courseId: number;
  orderIndex: number;
  isMandatory: boolean;
  description?: string;
}

// Reorder Learning Path Item Request
export interface ReorderLearningPathItemRequest {
  newOrderIndex: number;
}

// Learning Path Enrollment Models (NEW APIs)

export interface LearningPathEnrollment {
  learningPathEnrollmentId: number;
  userId: number;
  learningPathId: number;
  learningPathName: string;
  userName: string;
  status: string;
  progressPct: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  items?: LearningPathItem[];
}

export interface EnrollLearningPathRequest {
  learningPathId: number;
  userId?: number;  // Optional, backend can get from token
}

export interface LearningPathProgressSummary {
  totalCourses: number;
  completedCourses: number;
  mandatoryCourses: number;
  completedMandatory: number;
  overallProgress: number;  // Percentage
  status: 'NotStarted' | 'InProgress' | 'Completed';
}

export interface LearningPathStatistics {
  totalPaths: number;
  activePaths: number;  // Paths with at least 1 enrolled user
  totalEnrolledUsers: number;
  averageCompletionRate: number;
}

// Learning Path Enrollment Statistics (for Manager dashboard cards)
export interface LearningPathEnrollmentStatistics {
  totalEnrollments: number;      // Total user enrollments
  activeEnrollments: number;     // InProgress status
  completedEnrollments: number;  // Completed status
}

// Detailed Enrollment for User Progress Table
export interface DetailedEnrollment {
  learningPathEnrollmentId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  learningPathId: number;
  learningPathName: string;
  progressPct: number;
  status: 'NotStarted' | 'InProgress' | 'Completed';
  startedAt: string;
  completedAt?: string;
  totalCourses: number;
  completedCourses: number;
}

// Paginated Response for Detailed Enrollments
export interface DetailedEnrollmentsResponse {
  items: DetailedEnrollment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
