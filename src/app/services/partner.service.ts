import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { CreateUpdatePartnerDto, Partner, PartnerDetail, PartnerPagePayload, PartnerPageResponse } from '../models/partner.model';

@Injectable({
  providedIn: 'root'
})
export class ApiPartnerServices {

  constructor(private http: HttpClient) { }

  getPartnerPage(payload: PartnerPagePayload): Observable<PartnerPageResponse<Partner>> {
    return this.http.get<any>(API_URLS.PARTNER_MANAGEMENT, { params: payload as any }).pipe(switchMap((data: any) => of(data.result)));
  }

  createPartner(payload: CreateUpdatePartnerDto): Observable<PartnerPageResponse<any>> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(payload.request));
    if (payload.files) {
      payload.files.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    return this.http.post<any>(API_URLS.PARTNER_MANAGEMENT, formData).pipe(switchMap((data: any) => of(data.result)));
  }

  updatePartner(id: string | number, payload: CreateUpdatePartnerDto): Observable<PartnerPageResponse<any>> {
    const formData = new FormData();
    formData.append('request', JSON.stringify(payload.request));
    if (payload.files) {
      payload.files.forEach((file: any) => {
        formData.append('files', file);
      });
    }
    return this.http.put<any>(`${API_URLS.PARTNER_MANAGEMENT}/${id}`, formData).pipe(switchMap((data: any) => of(data.result)));
  }

  deletePartner(id: string | number): Observable<PartnerPageResponse<any>> {
    return this.http.delete<any>(`${API_URLS.PARTNER_MANAGEMENT}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  getPartnerDetail(id: string | number): Observable<PartnerDetail> {
    return this.http.get<any>(`${API_URLS.PARTNER_MANAGEMENT}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  enablePartner(id: string | number): Observable<PartnerPageResponse<any>> {
    return this.http.post<any>(`${API_URLS.PARTNER_ENABLE}/${id}`, {}).pipe(switchMap((data: any) => of(data.result)));
  }

  disablePartner(id: string | number): Observable<PartnerPageResponse<any>> {
    return this.http.post<any>(`${API_URLS.PARTNER_DISABLE}/${id}`,{}).pipe(switchMap((data: any) => of(data.result)));
  }

}
