import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import { Course, CourseCreateEdit, CoursePaginatedResponse, CourseDetail, Lesson, SubLesson, SubLessonCreateEdit, CourseUserView, reorder, CourseEnrollment } from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ApiFeedbackServices {

  constructor(private http: HttpClient) { }

  getFeedbacks(courseId: number, page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${API_URLS.FEEDBACKS}?courseId=${courseId}&page=${page}&pageSize=${pageSize}`);
  }

  createFeedback(feedback: any): Observable<any> {
    return this.http.post<any>(API_URLS.FEEDBACKS, feedback);
  }

  // updateFeedback(feedbackId: number, feedback: any): Observable<any> {
  //   return this.http.put<any>(`${API_URLS.FEEDBACKS}/${feedbackId}`, feedback);
  // }

  deleteFeedback(feedbackId: number): Observable<any> {
    return this.http.delete<any>(`${API_URLS.FEEDBACKS}/${feedbackId}`);
  }

  deleteComment(commentId: number): Observable<any> {
    return this.http.delete<any>(`${API_URLS.COMMENTS}/${commentId}`);
  }

  createComment(comment: any): Observable<any> {
    return this.http.post<any>(`${API_URLS.COMMENTS}`, comment);
  }
}