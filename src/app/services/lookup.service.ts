import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import { DocumentModel } from '../models/document.models';
import { Level } from '../models/lookup.model';
import { CourseType } from '../models/lookup.model';

@Injectable({
  providedIn: 'root'
})
export class ApiLookupServices {

  constructor(private http: HttpClient) { }

  getCourseTypes(): Observable<CourseType[]> {
    return this.http.get<CourseType[]>(`${API_URLS.GET_COURSE_TYPES}`);
  }

  getLevels(): Observable<Level[]> {
    return this.http.get<Level[]>(`${API_URLS.GET_LEVELS}`);
  }

}