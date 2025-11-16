import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { API_URLS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ApiAuthServices {

  constructor(private http: HttpClient) { }

  login(payload: any): Observable<any> {
    return this.http.post<any>(API_URLS.LOGIN, payload);
  }

  getUserInfo(): Observable<any> {
    return this.http.get<any>(API_URLS.USER_INFO);
  }

  updateUserInfo(payload: any): Observable<any> {
    return this.http.put<any>(API_URLS.USER_INFO, payload);
  }

  refreshToken(refreshToken: string) {
    return this.http.post<any>(API_URLS.REFRESH_TOKEN, { refreshToken: refreshToken });
  }

  logout(): Observable<any> {
    return this.http.post<any>(API_URLS.LOGOUT, {});
  }

}
