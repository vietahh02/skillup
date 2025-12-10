import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { CreateUserDto, User, UserDetail, UserPagePayload, UserPageResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiUserSystemServices {

  constructor(private http: HttpClient) { }

  getUserPage(payload: UserPagePayload): Observable<UserPageResponse<User>> {
    return this.http.get<any>(API_URLS.SYSTEM_USER, { params: payload as any }).pipe(switchMap((data: any) => of(data.result)));
  }

  createUser(payload: CreateUserDto): Observable<UserPageResponse<any>> {
    return this.http.post<any>(API_URLS.SYSTEM_USER, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  updateUser(id: string | number, payload: CreateUserDto): Observable<UserPageResponse<any>> {
    return this.http.put<any>(`${API_URLS.SYSTEM_USER}/${id}`, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  deleteUser(id: string | number): Observable<UserPageResponse<any>> {
    return this.http.delete<any>(`${API_URLS.SYSTEM_USER}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  getUserDetail(id: string | number): Observable<UserDetail> {
    return this.http.get<any>(`${API_URLS.SYSTEM_USER}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  enableUser(id: string | number): Observable<UserPageResponse<any>> {
    return this.http.patch<any>(`${API_URLS.SYSTEM_USER_ENABLE}/${id}`, {});
  }

  disableUser(id: string | number): Observable<UserPageResponse<any>> {
    return this.http.patch<any>(`${API_URLS.SYSTEM_USER_DISABLE}/${id}`, {});
  }

  resetPassword(id: string | number): Observable<UserPageResponse<any>> {
    return this.http.patch<any>(`${API_URLS.SYSTEM_USER_RESET_PASSWORD}/${id}`, {}).pipe(switchMap((data: any) => of(data.result)));
  }

}
