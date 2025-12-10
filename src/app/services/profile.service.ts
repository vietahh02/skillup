import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { ProfileUpdateDto } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ApiProfileServices {

  constructor(private http: HttpClient) { }

  updateProfile(payload: ProfileUpdateDto): Observable<any> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(payload.request));
    if (payload.file) {
      formData.append('file', payload.file);
    }
    return this.http.post(API_URLS.PROFILE_UPDATE, formData).pipe(switchMap((data: any) => of(data.result)));
  }
  
  getProfile(): Observable<any> {
    return this.http.get(API_URLS.PROFILE_DETAIL).pipe(switchMap((data: any) => of(data.result)));
  }

  getAvatar(): Observable<any> {
    return this.http.get(API_URLS.PROFILE_AVATAR).pipe(switchMap((data: any) => of(data.result)));
  }
}