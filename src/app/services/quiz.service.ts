import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import {
  QuizCreateRequest,
  QuizResponse,
  BatchCreateQuestionsRequest,
  Question,
  AnswerOption,
  QuizSummary,
  QuizAttempt,
  QuizAttemptsResponse,
  QuizAttemptDetail,
  SubmitQuizRequest
} from '../models/quiz.models';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  constructor(private http: HttpClient) { }

  // ========== QUIZ CRUD ==========

  /**
   * Get paginated quizzes
   * GET /api/Quizzes
   */
  getQuizzes(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<any>(API_URLS.GET_QUIZZES, { params });
  }

  /**
   * Get quiz detail by ID
   * GET /api/Quizzes/{quizId}
   */
  getQuizById(quizId: number): Observable<QuizResponse> {
    return this.http.get<QuizResponse>(`${API_URLS.GET_QUIZ_BY_ID}/${quizId}`);
  }

  /**
   * Get quiz by course ID (1 course = 1 quiz)
   * GET /api/Quizzes/by-course/{courseId}
   */
  getQuizByCourseId(courseId: number): Observable<QuizResponse> {
    return this.http.get<QuizResponse>(`${API_URLS.GET_QUIZ_BY_COURSE}/${courseId}`);
  }

  /**
   * Create new quiz with questions and options
   * POST /api/Quizzes
   */
  createQuiz(quiz: QuizCreateRequest): Observable<QuizResponse> {
    return this.http.post<QuizResponse>(API_URLS.CREATE_QUIZ, quiz);
  }

  /**
   * Update existing quiz
   * PUT /api/Quizzes/{quizId}
   */
  updateQuiz(quizId: number, quiz: QuizCreateRequest): Observable<QuizResponse> {
    return this.http.put<QuizResponse>(`${API_URLS.UPDATE_QUIZ}/${quizId}`, quiz);
  }

  /**
   * Delete quiz
   * DELETE /api/Quizzes/{quizId}
   */
  deleteQuiz(quizId: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_QUIZ}/${quizId}`);
  }

  /**
   * Restore deleted quiz
   * PATCH /api/Quizzes/{quizId}/restore
   */
  restoreQuiz(quizId: number): Observable<any> {
    return this.http.patch(`${API_URLS.RESTORE_QUIZ}/${quizId}/restore`, {});
  }

  // ========== QUESTIONS ==========

  /**
   * Get quiz questions
   * GET /api/Quizzes/{quizId}/questions
   */
  getQuizQuestions(quizId: number): Observable<Question[]> {
    return this.http.get<Question[]>(`${API_URLS.GET_QUIZ_QUESTIONS}/${quizId}/questions`);
  }

  /**
   * Create single question
   * POST /api/Quizzes/{quizId}/questions
   */
  createQuestion(quizId: number, question: Question): Observable<Question> {
    return this.http.post<Question>(`${API_URLS.CREATE_QUESTION}/${quizId}/questions`, question);
  }

  /**
   * Batch create questions
   * POST /api/Quizzes/{quizId}/questions/batch
   */
  batchCreateQuestions(quizId: number, request: BatchCreateQuestionsRequest): Observable<Question[]> {
    return this.http.post<Question[]>(`${API_URLS.BATCH_CREATE_QUESTIONS}/${quizId}/questions/batch`, request);
  }

  /**
   * Get question detail
   * GET /api/Quizzes/questions/{questionId}
   */
  getQuestionById(questionId: number): Observable<Question> {
    return this.http.get<Question>(`${API_URLS.GET_QUESTION_BY_ID}/${questionId}`);
  }

  /**
   * Update question
   * PUT /api/Quizzes/questions/{questionId}
   */
  updateQuestion(questionId: number, question: Question): Observable<Question> {
    return this.http.put<Question>(`${API_URLS.UPDATE_QUESTION}/${questionId}`, question);
  }

  /**
   * Delete question
   * DELETE /api/Quizzes/questions/{questionId}
   */
  deleteQuestion(questionId: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_QUESTION}/${questionId}`);
  }

  // ========== ANSWER OPTIONS ==========

  /**
   * Get question answer options
   * GET /api/Quizzes/questions/{questionId}/options
   */
  getQuestionOptions(questionId: number): Observable<AnswerOption[]> {
    return this.http.get<AnswerOption[]>(`${API_URLS.GET_QUESTION_OPTIONS}/${questionId}/options`);
  }

  /**
   * Create answer option
   * POST /api/Quizzes/questions/{questionId}/options
   */
  createOption(questionId: number, option: AnswerOption): Observable<AnswerOption> {
    return this.http.post<AnswerOption>(`${API_URLS.CREATE_OPTION}/${questionId}/options`, option);
  }

  /**
   * Get answer option detail
   * GET /api/Quizzes/options/{optionId}
   */
  getOptionById(optionId: number): Observable<AnswerOption> {
    return this.http.get<AnswerOption>(`${API_URLS.GET_OPTION_BY_ID}/${optionId}`);
  }

  /**
   * Update answer option
   * PUT /api/Quizzes/options/{optionId}
   */
  updateOption(optionId: number, option: AnswerOption): Observable<AnswerOption> {
    return this.http.put<AnswerOption>(`${API_URLS.UPDATE_OPTION}/${optionId}`, option);
  }

  /**
   * Delete answer option
   * DELETE /api/Quizzes/options/{optionId}
   */
  deleteOption(optionId: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_OPTION}/${optionId}`);
  }

  // ========== STUDENT QUIZ TAKING ==========

  /**
   * Start quiz attempt
   * POST /api/Quizzes/{quizId}/start
   * Returns quiz attempt details with questions
   */
  startQuizAttempt(quizId: number): Observable<QuizAttemptDetail> {
    return this.http.post<QuizAttemptDetail>(`${API_URLS.START_QUIZ_ATTEMPT}/${quizId}/start`, {});
  }

  /**
   * Submit quiz attempt
   * POST /api/Quizzes/attempts/{attemptId}/submit
   * Returns quiz results with score and correct answers
   */
  submitQuizAttempt(request: SubmitQuizRequest): Observable<QuizAttemptDetail> {
    return this.http.post<QuizAttemptDetail>(
      `${API_URLS.SUBMIT_QUIZ_ATTEMPT}/${request.attemptId}/submit`,
      request
    );
  }

  /**
   * Get user quiz attempts
   * GET /api/Quizzes/attempts
   */
  getUserAttempts(page: number = 1, pageSize: number = 10): Observable<QuizAttemptsResponse> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<QuizAttemptsResponse>(API_URLS.GET_USER_ATTEMPTS, { params });
  }

  /**
   * Get quiz attempt detail
   * GET /api/Quizzes/attempts/{attemptId}
   */
  getAttemptDetail(attemptId: number): Observable<QuizAttempt> {
    return this.http.get<QuizAttempt>(`${API_URLS.GET_ATTEMPT_DETAIL}/${attemptId}`);
  }

  /**
   * Get quiz summary
   * GET /api/Quizzes/{quizId}/summary
   */
  getQuizSummary(quizId: number): Observable<QuizSummary> {
    return this.http.get<QuizSummary>(`${API_URLS.GET_QUIZ_SUMMARY}/${quizId}/summary`);
  }

  // ========== AI QUIZ GENERATION ==========

  /**
   * Generate quiz questions from course using AI
   * POST /api/AI/generate-quiz-from-course
   * Returns generated questions as JSON string
   */
  generateQuizFromCourse(courseId: number, numberOfQuestions: number): Observable<{questionsJson: string, timestamp: string}> {
    return this.http.post<{questionsJson: string, timestamp: string}>(
      API_URLS.GENERATE_QUIZ_FROM_COURSE,
      { courseId, numberOfQuestions }
    );
  }
}
