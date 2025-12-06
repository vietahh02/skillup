import { QuestionType } from "../enums/api.enums";

export interface QuestionTypeOption {
    value: QuestionType;
    label: string;
}

// ========== BACKEND API MODELS ==========

// Answer Option (from backend)
export interface AnswerOption {
    optionId?: number;
    questionId?: number;
    content: string;
    isCorrect: boolean;
}

// Question (from backend)
export interface Question {
    questionId?: number;
    quizId?: number;
    title: string;
    questionType: string | number; // Backend now uses enum number (0,1,2,3), FE uses string ('single_choice', etc)
    points: number;
    orderIndex: number;
    answerOptions: AnswerOption[];
}

// Quiz Create Request
export interface QuizCreateRequest {
    courseId: number;
    title: string;
    passScore: number;
    attemptLimit: number;
    questions: Question[];
}

// Quiz Response (from backend)
export interface QuizResponse {
    quizId: number;
    courseId: number;
    courseName: string;
    title: string;
    passScore: number;
    attemptLimit: number;
    createdAt: string;
    updatedAt: string;
    questions: Question[];
}

// Batch Create Questions Request
export interface BatchCreateQuestionsRequest {
    questions: Question[];
}

// ========== LEGACY UI MODELS (keep for compatibility) ==========

export interface QuizAnswer {
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    type: QuestionType;
    question: string;
    answers: QuizAnswer[];
    textAnswer?: string;
}

export interface QuizCreateEdit {
    title: string;
    description?: string;
    duration: number;
    passScore: number;
    questions: QuizQuestion[];
}

export interface Quiz {
    id: number;
    title: string;
    description?: string;
    duration: number;
    passScore: number;
    questions: QuizQuestion[];
    courseId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface QuizSubmission {
    id: number;
    quizId: number;
    userId: number;
    answers: QuizUserAnswer[];
    score: number;
    passed: boolean;
    startedAt: string;
    submittedAt: string;
    timeSpent: number;
}

export interface QuizUserAnswer {
    questionIndex: number;
    questionType: QuestionType;
    selectedAnswerIndexes?: number[];
    textAnswer?: string;
}

export interface QuizStatistics {
    quizId: number;
    totalAttempts: number;
    passedAttempts: number;
    averageScore: number;
    averageTimeSpent: number;
    questionStatistics: QuestionStatistics[];
}

export interface QuestionStatistics {
    questionIndex: number;
    correctAnswers: number;
    totalAnswers: number;
    correctPercentage: number;
}

// ========== MANAGER QUIZ SUMMARY MODELS ==========

// Quiz Summary Response (for Manager)
export interface QuizSummary {
    quizId: number;
    title: string;
    courseId: number;
    courseName: string;
    passScore: number;
    attemptLimit: number;
    questionCount: number;
    totalPoints: number;
    userBestScore: number;
    userAttemptCount: number;
    userPassed: boolean;
    canAttempt: boolean;
}

// User Answer in Attempt
export interface UserAnswer {
    questionId: number;
    selectedOptionIds: number[];
    textAnswer?: string;
}

// Quiz Attempt Response
export interface QuizAttempt {
    attemptId: number;
    quizId: number;
    quizTitle: string;
    userId: number;
    userName: string;
    startedAt: string;
    submittedAt: string;
    score: number;
    passed: boolean;
    answers: UserAnswer[];
}

// Paginated Quiz Attempts Response
export interface QuizAttemptsResponse {
    items: QuizAttempt[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
}

// ========== STUDENT QUIZ TAKING MODELS ==========

// Answer in Attempt Detail (from backend)
export interface AttemptAnswerDetail {
    attemptAnswerId: number;
    attemptId: number;
    questionId: number;
    questionTitle: string;
    selectedOptionId: number;
    selectedOptionContent: string;
    answerText: string;
    isCorrect: boolean;
}

// Quiz Attempt Detail Response (Start Quiz Response)
export interface QuizAttemptDetail {
    attemptId: number;
    quizId: number;
    quizTitle: string;
    userId: number;
    userName: string;
    startedAt: string;
    submittedAt: string;
    score: number;
    passed: boolean;
    answers: AttemptAnswerDetail[];
}

// Submit Answer Request
export interface SubmitAnswerRequest {
    questionId: number;
    selectedOptionId: number;
    answerText?: string;
}

// Submit Quiz Request
export interface SubmitQuizRequest {
    attemptId: number;
    answers: SubmitAnswerRequest[];
}