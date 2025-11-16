import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserAdmin, PaginatedResponse, UserDetail } from '../models/user.models';
import { API_URLS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ApiUserServices {

  constructor(private http: HttpClient) { }

  getUserAdminList(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<PaginatedResponse<UserAdmin>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<PaginatedResponse<UserAdmin>>(API_URLS.GET_USERS_ADMIN_LIST, { params });
  }

  getUserDetail(id: string | number): Observable<UserDetail> {
    return this.http.get<any>(`${API_URLS.GET_USER_BY_ID}/${id}`);
  } 

  getUserManagerList(page: number = 1, pageSize: number = 10, searchTerm?: string): Observable<PaginatedResponse<UserAdmin>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<PaginatedResponse<UserAdmin>>(API_URLS.GET_USERS_MANAGER_LIST, { params });
  }

  updateUserRole(id: string | number, role: number): Observable<any> {
    return this.http.patch<any>(`${API_URLS.UPDATE_USER_ROLE_STATUS}/${id}/roles`, { roleIds : [role] });
  }

  banUser(id: string | number, isActive: boolean): Observable<any> {
    return this.http.patch<any>(`${API_URLS.UPDATE_USER_ROLE_STATUS}/${id}/activate`, { active : isActive });
  }

  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${API_URLS.UPLOAD_AVATAR}/${2}/upload-avatar`, formData);
  }
  
  updateUserLevel(id: string | number, level: string): Observable<any> {
    return this.http.patch<any>(`${API_URLS.UPDATE_USER_ROLE_STATUS}/${id}/level`, { level });
  }

  importExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Note: Don't set Content-Type header manually for FormData
    // Browser will automatically set it with proper boundary
    return this.http.post<any>(API_URLS.IMPORT_EXCEL, formData);
  }

  downloadTemplate(): Observable<Blob> {
    return this.http.get(API_URLS.DOWNLOAD_TEMPLATE, { 
      responseType: 'blob' 
    });
  }
}
