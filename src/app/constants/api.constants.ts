import { environment } from '../../environments/environment';

const BASE_URLS: any = environment.baseUrl;

const BASE_POINTS = {
  AUTH: BASE_URLS.SKILL_UP + "/Auth",
  USER: BASE_URLS.SKILL_UP + "/Users",
  COURSE: BASE_URLS.SKILL_UP + "/Course",
  LESSON: BASE_URLS.SKILL_UP + "/Lessons",
  SUB_LESSON: BASE_URLS.SKILL_UP + "/SubLessons",
  QUIZ: BASE_URLS.SKILL_UP + "/Quizzes",
  DOCUMENT: BASE_URLS.SKILL_UP + "/Documents",
  AI: BASE_URLS.SKILL_UP + "/AI",
  LOOKUP: BASE_URLS.SKILL_UP + "/Lookups",
  FEEDBACK: BASE_URLS.SKILL_UP + "/Feedback",
  COMMENT: BASE_URLS.SKILL_UP + "/Comment",
  PROGRESS: BASE_URLS.SKILL_UP + "/progress",
  ENROLLMENT: BASE_URLS.SKILL_UP + "/Enrollment",
  LEARNING_PATH: BASE_URLS.SKILL_UP + "/learning-paths",
  LEARNING_PATH_ITEM: BASE_URLS.SKILL_UP + "/learning-path-items",
  LEARNING_PATH_ENROLLMENT: BASE_URLS.SKILL_UP + "/learning-path-enrollments",
  DASHBOARD: BASE_URLS.SKILL_UP + "/Dashboard",
  SETTINGS: BASE_URLS.SKILL_UP + "/settings",
}

export const API_URLS = {
  
  //API Auth
  LOGIN: BASE_POINTS.AUTH + "/login",
  LOGIN_GOOGLE: BASE_POINTS.AUTH + "/google",
  LOGOUT: BASE_POINTS.AUTH + "/logout-all",
  REFRESH_TOKEN: BASE_POINTS.AUTH + "/refresh-token",
  REFRESH_TOKEN_ONLY: BASE_POINTS.AUTH + "/refresh-token-only",
  REVOKE_TOKEN: BASE_POINTS.AUTH + "/revoke-token",
  CHANGE_PASSWORD: BASE_POINTS.AUTH + "/me/change-password",
  FORGOT_PASSWORD: BASE_POINTS.AUTH + "/forgot-password",
  VERIFY_OTP: BASE_POINTS.AUTH + "/verify-otp",
  RESET_PASSWORD: BASE_POINTS.AUTH + "/reset-password",
  USER_INFO: BASE_POINTS.USER + "/me",
  UPDATE_USER_INFO: BASE_POINTS.USER + "/me/update-with-avatar",

  //Api User
  GET_USERS_ADMIN_LIST: BASE_POINTS.USER,
  GET_USERS_MANAGER_LIST: BASE_POINTS.USER + "/manager",
  GET_USER_BY_ID: BASE_POINTS.USER,
  CREATE_USER: BASE_POINTS.USER,
  UPDATE_USER: BASE_POINTS.USER,
  UPDATE_USER_ROLE_STATUS: BASE_POINTS.USER ,
  DELETE_USER: BASE_POINTS.USER + "/delete",
  UPLOAD_AVATAR: BASE_POINTS.USER,
  DOWNLOAD_TEMPLATE: BASE_POINTS.USER + "/import-template",
  IMPORT_EXCEL: BASE_POINTS.USER + "/import-excel",
  LEVELS: BASE_POINTS.USER + "/levels",

  //API Lesson
  GET_LESSONS: BASE_POINTS.COURSE,
  LESSON: BASE_POINTS.LESSON,
  REORDER_LESSONS: BASE_POINTS.LESSON + "/reorder",

  //API SubLesson
  SUB_LESSON: BASE_POINTS.SUB_LESSON,

  //API Course
  GET_COURSES_CREATOR_ADMIN_MANAGER: BASE_POINTS.COURSE + "/creator-admin-manager",
  GET_COURSES_CREATOR_LECTURER: BASE_POINTS.COURSE + "/lecturer/me",
  GET_COURSES: BASE_POINTS.COURSE + "/get-all",
  COURSE: BASE_POINTS.COURSE,
  GET_COURSES_USER_VIEW: BASE_POINTS.COURSE + "/user/view",
  COURSE_ENROLLMENT: BASE_POINTS.COURSE + "/me",
  CREATE_ENROLLMENT: BASE_POINTS.ENROLLMENT,
  GET_COURSE_LECTURER: BASE_POINTS.COURSE + "/lecturer",
  GET_COURSE_EMPLOYEE: BASE_POINTS.COURSE + "/Employee",


  //API Quiz
  GET_QUIZZES: BASE_POINTS.QUIZ, // GET /api/Quizzes (paginated)
  GET_QUIZ_BY_ID: BASE_POINTS.QUIZ, // GET /api/Quizzes/{quizId}
  GET_QUIZ_BY_COURSE: BASE_POINTS.QUIZ + "/by-course", // GET /api/Quizzes/by-course/{courseId}
  CREATE_QUIZ: BASE_POINTS.QUIZ, // POST /api/Quizzes
  UPDATE_QUIZ: BASE_POINTS.QUIZ, // PUT /api/Quizzes/{quizId}
  DELETE_QUIZ: BASE_POINTS.QUIZ, // DELETE /api/Quizzes/{quizId}
  RESTORE_QUIZ: BASE_POINTS.QUIZ, // PATCH /api/Quizzes/{quizId}/restore

  // Quiz Questions
  GET_QUIZ_QUESTIONS: BASE_POINTS.QUIZ, // GET /api/Quizzes/{quizId}/questions
  CREATE_QUESTION: BASE_POINTS.QUIZ, // POST /api/Quizzes/{quizId}/questions
  BATCH_CREATE_QUESTIONS: BASE_POINTS.QUIZ, // POST /api/Quizzes/{quizId}/questions/batch
  GET_QUESTION_BY_ID: BASE_POINTS.QUIZ + "/questions", // GET /api/Quizzes/questions/{questionId}
  UPDATE_QUESTION: BASE_POINTS.QUIZ + "/questions", // PUT /api/Quizzes/questions/{questionId}
  DELETE_QUESTION: BASE_POINTS.QUIZ + "/questions", // DELETE /api/Quizzes/questions/{questionId}

  // Answer Options
  GET_QUESTION_OPTIONS: BASE_POINTS.QUIZ + "/questions", // GET /api/Quizzes/questions/{questionId}/options
  CREATE_OPTION: BASE_POINTS.QUIZ + "/questions", // POST /api/Quizzes/questions/{questionId}/options
  GET_OPTION_BY_ID: BASE_POINTS.QUIZ + "/options", // GET /api/Quizzes/options/{optionId}
  UPDATE_OPTION: BASE_POINTS.QUIZ + "/options", // PUT /api/Quizzes/options/{optionId}
  DELETE_OPTION: BASE_POINTS.QUIZ + "/options", // DELETE /api/Quizzes/options/{optionId}

  // Quiz Attempts
  START_QUIZ_ATTEMPT: BASE_POINTS.QUIZ, // POST /api/Quizzes/{quizId}/start
  SUBMIT_QUIZ_ATTEMPT: BASE_POINTS.QUIZ + "/attempts", // POST /api/Quizzes/attempts/{attemptId}/submit
  GET_USER_ATTEMPTS: BASE_POINTS.QUIZ + "/attempts", // GET /api/Quizzes/attempts
  GET_ATTEMPT_DETAIL: BASE_POINTS.QUIZ + "/attempts", // GET /api/Quizzes/attempts/{attemptId}
  GET_QUIZ_SUMMARY: BASE_POINTS.QUIZ, // GET /api/Quizzes/{quizId}/summary

  //API Document
  UPLOAD_DOCUMENT: BASE_POINTS.DOCUMENT + "/upload-multiple",
  GET_DOCUMENTS: BASE_POINTS.DOCUMENT + "/course",
  GET_DOCUMENT_BY_ID: BASE_POINTS.DOCUMENT,
  UPDATE_DOCUMENT: BASE_POINTS.DOCUMENT,
  DELETE_DOCUMENT: BASE_POINTS.DOCUMENT,
  DOWNLOAD_DOCUMENT: BASE_POINTS.DOCUMENT,

  //API AI
  GET_AI_CHAT: BASE_POINTS.AI + "/chat",
  GENERATE_QUIZ_FROM_COURSE: BASE_POINTS.AI + "/generate-quiz-from-course",

  //API Lookup
  GET_COURSE_TYPES: BASE_POINTS.LOOKUP + "/course-types",
  GET_LEVELS: BASE_POINTS.LOOKUP + "/user-levels",
  ACTIVATE_COURSE_TYPE: BASE_POINTS.LOOKUP + "/course-types", // PATCH /api/lookups/course-types/{id}/activate
  ACTIVATE_USER_LEVEL: BASE_POINTS.LOOKUP + "/user-levels", // PATCH /api/lookups/user-levels/{id}/activate

  //API Feedback
  FEEDBACKS: BASE_POINTS.FEEDBACK,
  COMMENTS: BASE_POINTS.COMMENT,

  //API Progress
  GET_PROGRESS: BASE_POINTS.PROGRESS + "/sub-lessons",

  //API Learning Paths
  GET_LEARNING_PATHS: BASE_POINTS.LEARNING_PATH, // GET /api/learning-paths
  GET_LEARNING_PATH_BY_ID: BASE_POINTS.LEARNING_PATH, // GET /api/learning-paths/{id}
  CREATE_LEARNING_PATH: BASE_POINTS.LEARNING_PATH, // POST /api/learning-paths
  UPDATE_LEARNING_PATH: BASE_POINTS.LEARNING_PATH, // PUT /api/learning-paths/{id}
  DELETE_LEARNING_PATH: BASE_POINTS.LEARNING_PATH, // DELETE /api/learning-paths/{id}
  UPDATE_LEARNING_PATH_STATUS: BASE_POINTS.LEARNING_PATH, // PATCH /api/learning-paths/{id}/status
  RESTORE_LEARNING_PATH: BASE_POINTS.LEARNING_PATH, // PATCH /api/learning-paths/{id}/restore

  // Learning Path Items (Courses in Path)
  GET_LEARNING_PATH_ITEMS: BASE_POINTS.LEARNING_PATH, // GET /api/learning-paths/{learningPathId}/items
  CREATE_LEARNING_PATH_ITEM: BASE_POINTS.LEARNING_PATH, // POST /api/learning-paths/{learningPathId}/items
  UPDATE_LEARNING_PATH_ITEM: BASE_POINTS.LEARNING_PATH_ITEM, // PUT /api/learning-path-items/{id}
  DELETE_LEARNING_PATH_ITEM: BASE_POINTS.LEARNING_PATH_ITEM, // DELETE /api/learning-path-items/{id}
  REORDER_LEARNING_PATH_ITEM: BASE_POINTS.LEARNING_PATH_ITEM, // PATCH /api/learning-path-items/{id}/order

  // Learning Path Enrollments (NEW)
  CREATE_LEARNING_PATH_ENROLLMENT: BASE_POINTS.LEARNING_PATH_ENROLLMENT, // POST /api/learning-path-enrollments
  GET_MY_LEARNING_PATH_ENROLLMENTS: BASE_POINTS.LEARNING_PATH_ENROLLMENT + "/my-enrollments", // GET /api/learning-path-enrollments/my-enrollments
  DELETE_LEARNING_PATH_ENROLLMENT: BASE_POINTS.LEARNING_PATH_ENROLLMENT, // DELETE /api/learning-path-enrollments/{id}
  GET_LEARNING_PATH_PROGRESS_SUMMARY: BASE_POINTS.LEARNING_PATH, // GET /api/learning-paths/{learningPathId}/progress/summary
  GET_LEARNING_PATH_STATISTICS: BASE_POINTS.LEARNING_PATH + "/statistics", // GET /api/learning-paths/statistics

  // Learning Path Enrollment Management (for Manager)
  GET_ENROLLMENT_STATISTICS: BASE_POINTS.LEARNING_PATH_ENROLLMENT + "/statistics", // GET /api/learning-path-enrollments/statistics
  GET_ALL_ENROLLMENTS: BASE_POINTS.LEARNING_PATH_ENROLLMENT + "/all", // GET /api/learning-path-enrollments/all
  EXPORT_USER_PROGRESS_EXCEL: BASE_POINTS.LEARNING_PATH_ENROLLMENT + "/export-excel", // GET /api/learning-path-enrollments/export-excel

  // Manager Dashboard
  GET_MANAGER_DASHBOARD_STATS: BASE_POINTS.DASHBOARD + "/statistics", // GET /api/Dashboard/statistics
  GET_MANAGER_DASHBOARD_MONTHLY_ENROLLMENT_STATS: BASE_POINTS.DASHBOARD + "/monthly-enrollment-stats", // GET /api/Dashboard/monthly-enrollment-stats
  GET_MANAGER_DASHBOARD_MONTHLY_USER_STATS: BASE_POINTS.DASHBOARD + "/monthly-user-stats", // GET /api/Dashboard/monthly-user-stats
  GET_MANAGER_DASHBOARD_COURSE_TYPE_DISTRIBUTION: BASE_POINTS.DASHBOARD + "/course-type-distribution", // GET /api/Dashboard/course-type-distribution
  GET_MANAGER_DASHBOARD_COURSE_STATUS_DISTRIBUTION: BASE_POINTS.DASHBOARD + "/course-status-distribution", // GET /api/Dashboard/course-status-distribution

  // Settings Management (Admin only)
  GET_AI_KEY: BASE_POINTS.SETTINGS + "/ai-key", // GET /api/settings/ai-key
  UPDATE_AI_KEY: BASE_POINTS.SETTINGS + "/ai-key", // PUT /api/settings/ai-key
  DASHBOARD_ADMIN: BASE_POINTS.DASHBOARD + "/admin",

  // Settings Management (Manager only)
  GET_COURSE_MANAGER_TYPES: BASE_POINTS.SETTINGS + "/course-types", // GET /api/settings/course-types
  GET_USER_MANAGER_LEVELS: BASE_POINTS.SETTINGS + "/user-levels", // GET /api/settings/user-levels

  //API Report
  GET_USER_REPORT: BASE_POINTS.USER + "/employees/detail-statistics", // GET /api/Users/employees/detail-statistics
  EXPORT_USER_REPORT_EXCEL: BASE_POINTS.USER + "/employees/detail-statistics/export-excel", // GET /api/Users/employees/detail-statistics/export-excel
}