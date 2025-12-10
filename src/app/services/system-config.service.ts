import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { ActionSetting, ActionSettingUpdate, ConfigPagePayload, PageSetting, PageSettingUpdate } from '../models/config.model';
import { RolePagePayload } from '../models/role.model';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigServices {

  constructor(private http: HttpClient) { }

  getActions(payload: ConfigPagePayload): Observable<ActionSetting[]> {
    return this.http.get<any>(API_URLS.SYSTEM_CONFIG_ACTION, { params: payload as any }).pipe(switchMap((data: any) => of(data.result)));
  }

  getPages(payload: ConfigPagePayload): Observable<PageSetting[]> {
    return this.http.get<any>(API_URLS.SYSTEM_CONFIG_PAGE, { params: payload as any }).pipe(switchMap((data: any) => of(data.result)));
  }

  updateActions(payload: ActionSettingUpdate[]): Observable<any> {
    return this.http.put<any>(API_URLS.SYSTEM_CONFIG_ACTION_UPDATE, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  updatePages(payload: PageSettingUpdate): Observable<any> {
    return this.http.put<any>(API_URLS.SYSTEM_CONFIG_PAGE_UPDATE, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  getActionsByPartner(payload: RolePagePayload): Observable<ActionSetting[]> {
    return this.http.get<any>(API_URLS.SYSTEM_CONFIG_ACTION_UPDATE, {params: payload as any}).pipe(switchMap((data: any) => of(data.result)));
  }

  getPagesByPartner(payload: RolePagePayload): Observable<PageSetting[]> {
    return this.http.get<any>(API_URLS.SYSTEM_CONFIG_PAGE_UPDATE, {params: payload as any}).pipe(switchMap((data: any) => of(data.result)));
  }

}