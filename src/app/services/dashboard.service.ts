import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import { Course, CourseCreateEdit, CoursePaginatedResponse, CourseDetail, Lesson, SubLesson, SubLessonCreateEdit, CourseUserView, reorder, CourseEnrollment } from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class ApiDashboardServices {

  constructor(private http: HttpClient) { }

  getManagerDashboardStats(): Observable<any> {
    return this.http.get<any>(API_URLS.GET_MANAGER_DASHBOARD_STATS);
  }

  getManagerDashboardMonthlyEnrollmentStats(year: string): Observable<any> {
    return this.http.get<any>(API_URLS.GET_MANAGER_DASHBOARD_MONTHLY_ENROLLMENT_STATS, { params: new HttpParams().set('year', year) });
  }

  getManagerDashboardMonthlyUserStats(year: string): Observable<any> {
    return this.http.get<any>(API_URLS.GET_MANAGER_DASHBOARD_MONTHLY_USER_STATS, { params: new HttpParams().set('year', year) });
  }

  getManagerDashboardCourseTypeStats(): Observable<any> {
    return this.http.get<any>(API_URLS.GET_MANAGER_DASHBOARD_COURSE_TYPE_DISTRIBUTION);
  }

  getManagerDashboardCourseStatusStats(): Observable<any> {
    return this.http.get<any>(API_URLS.GET_MANAGER_DASHBOARD_COURSE_STATUS_DISTRIBUTION);
  }

  getDashboardAdmin(): Observable<any> {
    return this.http.get<any>(API_URLS.DASHBOARD_ADMIN);
  }

}