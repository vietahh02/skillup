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
    const formData = new FormData();
    formData.append('FullName', payload.fullName);
    formData.append('Phone', payload.phone);
    formData.append('Location', payload.location);
    formData.append('DateOfBirth', payload.dateOfBirth.toISOString());
    formData.append('Gender', payload.gender);
    if (payload.avatar) {
      formData.append('Avatar', payload.avatar);
    }
    return this.http.put<any>(API_URLS.UPDATE_USER_INFO, formData);
  }

  refreshToken(refreshToken: string) {
    return this.http.post<any>(API_URLS.REFRESH_TOKEN, { refreshToken: refreshToken });
  }

  logout(): Observable<any> {
    return this.http.post<any>(API_URLS.LOGOUT, {});
  }

  loginWithGoogle(idToken: string): Observable<any> {
    return this.http.post<any>(API_URLS.LOGIN_GOOGLE, { idToken });
  }

  changePassword(payload: { oldPassword: string, newPassword: string }): Observable<any> {
    return this.http.put<any>(API_URLS.CHANGE_PASSWORD, payload);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(API_URLS.FORGOT_PASSWORD, { email });
  }

  verifyOtp(payload: { email: string, otp: string }): Observable<any> {
    return this.http.post<any>(API_URLS.VERIFY_OTP, payload);
  }

  resetPassword(payload: { resetToken: string, newPassword: string }): Observable<any> {
    return this.http.post<any>(API_URLS.RESET_PASSWORD, payload);
  }

}
