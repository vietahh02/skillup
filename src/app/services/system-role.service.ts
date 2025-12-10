import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { CreateRoleDto, Role, RoleDetail, RolePagePayload, RolePageResponse } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class ApiRoleSystemServices {

  constructor(private http: HttpClient) { }

  getRolePage(payload: RolePagePayload): Observable<RolePageResponse<Role[]>> {
    return this.http.get<any>(API_URLS.SYSTEM_ROLE, { params: payload } as any).pipe(switchMap((data: any) => of(data.result)));
  }

  createRole(payload: CreateRoleDto): Observable<RolePageResponse<any>> {
    return this.http.post<any>(API_URLS.SYSTEM_ROLE, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  updateRole(id: string | number, payload: CreateRoleDto): Observable<RolePageResponse<any>> {
    return this.http.put<any>(`${API_URLS.SYSTEM_ROLE}/${id}`, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  deleteRole(id: string | number): Observable<RolePageResponse<any>> {
    return this.http.delete<any>(`${API_URLS.SYSTEM_ROLE}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  getRoleDetail(id: string | number): Observable<RoleDetail> {
    return this.http.get<any>(`${API_URLS.SYSTEM_ROLE}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  enableRole(id: string | number): Observable<RolePageResponse<any>> {
    return this.http.patch<any>(`${API_URLS.SYSTEM_ROLE}/enable/${id}`, {}).pipe(switchMap((data: any) => of(data.result)));
  }

  disableRole(id: string | number): Observable<RolePageResponse<any>> {
    return this.http.patch<any>(`${API_URLS.SYSTEM_ROLE}/disable/${id}`, {}).pipe(switchMap((data: any) => of(data.result)));
  }

}
