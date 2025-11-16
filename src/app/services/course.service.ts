import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import { Course, CoursePaginatedResponse, Lesson } from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ApiCourseServices {

  constructor(private http: HttpClient) { }

  getCourseListCreator(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<CoursePaginatedResponse<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<CoursePaginatedResponse<Course>>(API_URLS.GET_COURSES_CREATOR, { params });
  }

  getCourseById(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${API_URLS.GET_COURSE_BY_ID}/${courseId}`);
  }

  createCourse(course: Course): Observable<Course> {
    return this.http.post<Course>(API_URLS.CREATE_COURSE, course);
  }

  getLessons(courseId: number): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${API_URLS.GET_LESSONS}/${courseId}`);
  }

  createLesson(courseId: number | string, lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(`${API_URLS.GET_LESSONS}/${courseId}/lessons`, lesson);
  }

  // updateLesson(courseId: number, lessonId: number, lesson: Lesson): Observable<Lesson> {
  //   return this.http.put<Lesson>(`${API_URLS.UPDATE_LESSON}/${courseId}/lessons/${lessonId}`, lesson);
  // }

  // deleteLesson(courseId: number, lessonId: number): Observable<void> {
  //   return this.http.delete<void>(`${API_URLS.DELETE_LESSON}/${courseId}/lessons/${lessonId}`);
  // }
}