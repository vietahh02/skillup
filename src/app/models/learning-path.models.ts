// Learning Path Models

// Learning Path (Roadmap)
export interface LearningPath {
  learningPathId: number;
  name: string;
  description: string;
  level?: string;                       // Level name (Beginner, Intermediate, Advanced) - from backend
  levelId?: number;                     // Level ID - foreign key
  duration?: number;                    // Duration in hours
  totalEnrolledUsers?: number;          // Number of users enrolled
  averageProgress?: number;             // Average progress % of all users
  status?: 'Active' | 'Inactive' | 'Draft';  // Learning path status
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
  levelId?: number;    // Level ID (foreign key)
  // duration is auto-calculated by backend from sum of course durations
}

// Level lookup model
export interface Level {
  levelId: number;
  name: string;
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
  enrollmentType?: 'assigned' | 'self-enrolled'; // Added from BE
  items?: LearningPathItem[];
}

export interface EnrollLearningPathRequest {
  learningPathId: number;
  userId?: number;  // Optional, backend can get from token
  enrollmentType?: 'assigned' | 'self-enrolled'; // Optional, BE auto-sets based on who enrolls
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
  enrollmentType?: 'assigned' | 'self-enrolled'; // Added from BE
}

// Paginated Response for Detailed Enrollments
export interface DetailedEnrollmentsResponse {
  items: DetailedEnrollment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
