import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../app.config';
import { CreateUpdateProductPayload, Product, ProductDetail, ProductPagePayload, ProductPageResponse, ProductPolicy, ProductPolicyPagePayload } from '../models/product.model';
import { CreateUpdateDocumentDto, DocumentDetail, DocumentPagePayload, DocumentPageResponse, SendMail } from '../models/document.model';
import { CreateUpdateHelpPayload, Help, HelpDetail, HelpPagePayload, HelpPageResponse } from '../models/help.model';

@Injectable({
  providedIn: 'root'
})
export class ApiHelpServices {

  constructor(private http: HttpClient) { }

  getHelpPage(payload: HelpPagePayload): Observable<any> {
    return this.http.get<any>(API_URLS.SYSTEM_HELP_PAGE, { params: payload as any }).pipe(map((data: any) => data.result));
  }

  deleteHelp(id: string): Observable<any> {
    return this.http.delete<any>(`${API_URLS.SYSTEM_HELP_PAGE}/${id}`).pipe(map((data: any) => data.result));
  }

  getHelpDetail(code: string): Observable<HelpDetail> {
    return this.http.get<any>(`${API_URLS.SYSTEM_HELP_PAGE}/get-code`, { params: { code: code } }).pipe(map((data: any) => data.result));
  }

  updateHelp(id: string, payload: CreateUpdateHelpPayload): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_HELP_PAGE}/${id}`, payload).pipe(map((data: any) => data.result));
  }

  createHelp(payload: CreateUpdateHelpPayload): Observable<any> {
    return this.http.post<any>(API_URLS.SYSTEM_HELP_PAGE, payload).pipe(map((data: any) => data.result));
  }

}