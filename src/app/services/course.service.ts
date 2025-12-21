import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import { Course, CourseCreateEdit, CoursePaginatedResponse, CourseDetail, Lesson, SubLesson, SubLessonCreateEdit, CourseUserView, reorder, CourseEnrollment, reorderSubLessons } from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ApiCourseServices {

  constructor(private http: HttpClient) { }

  getCourseListManager(page: number = 1, pageSize: number = 10, searchTerm?: string, maxLevelId?: number, status?: string): Observable<CoursePaginatedResponse<Course>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    if (maxLevelId !== undefined && maxLevelId !== null) {
      params = params.set('maxLevelId', maxLevelId.toString());
    }

    if (status && status.trim()) {
      params = params.set('status', status.trim());
    }

    return this.http.get<CoursePaginatedResponse<Course>>(API_URLS.COURSE, { params });
  }

  getCourseListCreator(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<CoursePaginatedResponse<Course>> {
    let params = new HttpParams()
      .set('pageNumber', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<CoursePaginatedResponse<Course>>(API_URLS.GET_COURSES_CREATOR_LECTURER, { params });
  }

  getCourseById(courseId: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${API_URLS.COURSE}/${courseId}`);
  }

  createCourse(course: CourseCreateEdit): Observable<Course> {
    const formData = new FormData();
    formData.append('Name', course.name);
    formData.append('Description', course.description as string);
    formData.append('CourseTypeId', course.courseTypeId.toString());
    formData.append('TargetLevelId', course.targetLevelId.toString());
    formData.append('Duration', course.duration.toString());
    formData.append('Image', course.imageUrl);
    return this.http.post<Course>(API_URLS.COURSE, formData);
  }

  updateCourse(courseId: number, course: CourseCreateEdit): Observable<Course> {
    const formData = new FormData();
    formData.append('Name', course.name);
    formData.append('Description', course.description as string);
    formData.append('CourseTypeId', course.courseTypeId.toString());
    formData.append('TargetLevelId', course.targetLevelId.toString());
    formData.append('Duration', course.duration.toString());
    formData.append('Image', course.imageUrl);
    return this.http.put<Course>(`${API_URLS.COURSE}/${courseId}`, formData);
  }

  getLessons(courseId: number | string): Observable<Lesson[]> {
    return this.http.get<Lesson[]>(`${API_URLS.GET_LESSONS}/${courseId}/lessons`);
  }

  createLesson(courseId: number | string, lesson: Lesson): Observable<Lesson> {
    return this.http.post<Lesson>(`${API_URLS.GET_LESSONS}/${courseId}/lessons`, lesson);
  }

  detailLesson(lessonId: number | string): Observable<Lesson> {
    return this.http.get<Lesson>(`${API_URLS.LESSON}/${lessonId}`);
  }

  updateLesson(lessonId: number, lesson: Lesson): Observable<Lesson> {
    const formData = new FormData();
    formData.append('Title', lesson.title);
    formData.append('Description', lesson.description as string);
    return this.http.put<Lesson>(`${API_URLS.LESSON}/${lessonId}`, formData);
  }

  deleteLesson(lessonId: number | string): Observable<void> {
    return this.http.delete<void>(`${API_URLS.LESSON}/${lessonId}`);
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${API_URLS.COURSE}/${courseId}`);
  }

  getLevels(): Observable<string[]> {
    return this.http.get<string[]>(API_URLS.LEVELS);
  }

  createSubLesson(subLesson: SubLessonCreateEdit, lessonId: number | string): Observable<SubLesson> {
    const formData = new FormData();
    formData.append('LessonId', lessonId.toString());
    formData.append('Title', subLesson.title);
    formData.append('File', subLesson.videoFile as File);
    formData.append('Description', subLesson.description as string);
    return this.http.post<SubLesson>(API_URLS.SUB_LESSON, formData);
  }

  updateSubLesson(subLessonId: number | string, subLesson: SubLessonCreateEdit, isDeleteVideo: boolean): Observable<SubLesson> {
    const formData = new FormData();
    formData.append('Title', subLesson.title);
    if (subLesson.videoFile && !isDeleteVideo) {
      formData.append('File', subLesson.videoFile as File);
    }
    formData.append('Description', subLesson.description as string);
    return this.http.put<SubLesson>(`${API_URLS.SUB_LESSON}/${subLessonId}`, formData);
  }

  detailSubLesson(subLessonId: number | string): Observable<SubLesson> {
    return this.http.get<SubLesson>(`${API_URLS.SUB_LESSON}/${subLessonId}`);
  }

  deleteSubLesson(subLessonId: number | string): Observable<void> {
    return this.http.delete<void>(`${API_URLS.SUB_LESSON}/${subLessonId}`);
  }

  getCoursesUserView(page: number = 1, pageSize: number = 16): Observable<any> {    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<any>(API_URLS.GET_COURSES_USER_VIEW, { params });
  }

  reorderLessons(reorder: reorder): Observable<any> {
    return this.http.patch<any>(API_URLS.REORDER_LESSONS, reorder);
  }

  reorderSubLessons(reorder: reorderSubLessons): Observable<any> {
    return this.http.patch<any>(API_URLS.REORDER_SUB_LESSONS, reorder);
  }

  getCourseEnrollment(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (searchTerm && searchTerm.trim()) {
      params = params.set('q', searchTerm.trim());
    }
    return this.http.get<any>(API_URLS.COURSE_ENROLLMENT, { params });
  }

  getProgress(courseId: number): Observable<any> {
    const payload = {
      "isCompleted": true
    }
    return this.http.put<any>(`${API_URLS.GET_PROGRESS}/${courseId}`, payload);
  }

  createEnrollment(payload: { userId: number | string, courseId: number | string }): Observable<any> {
    return this.http.post<any>(API_URLS.CREATE_ENROLLMENT, payload);
  }

  completeCourse(courseId: number): Observable<any> {
    return this.http.post<any>(`${API_URLS.COURSE}/${courseId}/submit`, {});
  }
  
  changeStatus(courseId: number, status: string, reason?: string): Observable<any> {
    return this.http.patch<any>(`${API_URLS.COURSE}/${courseId}/status`, { status, rejectionReason: reason });
  }

  getCoursePendingCount(): Observable<any> {
    return this.http.get<any>(API_URLS.GET_COURSE_COUNT);
  }

}