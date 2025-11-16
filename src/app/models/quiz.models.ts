import { QuestionType } from "../enums/api.enums";

export interface QuestionTypeOption {
    value: QuestionType;
    label: string;
}

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