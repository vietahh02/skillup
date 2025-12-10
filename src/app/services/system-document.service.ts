import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../app.config';
import { CreateUpdateProductPayload, Product, ProductDetail, ProductPagePayload, ProductPageResponse, ProductPolicy, ProductPolicyPagePayload } from '../models/product.model';
import { CreateUpdateDocumentDto, DocumentDetail, DocumentPagePayload, DocumentPageResponse, SendMail } from '../models/document.model';

@Injectable({
  providedIn: 'root'
})
export class ApiDocumentServices {

  constructor(private http: HttpClient) { }

  getDocumentPage(payload: DocumentPagePayload): Observable<DocumentPageResponse<Document>> {
    return this.http.get<any>(API_URLS.SYSTEM_DOCUMENT_PAGE, { params: payload as any }).pipe(map((data: any) => data.result));
  }

  deleteDocument(id: string): Observable<any> {
    return this.http.delete<any>(`${API_URLS.SYSTEM_DOCUMENT_PAGE}/${id}`).pipe(map((data: any) => data.result));
  }

  getDocumentDetail(id: string): Observable<DocumentDetail> {
    return this.http.get<any>(`${API_URLS.SYSTEM_DOCUMENT_PAGE}/${id}`).pipe(map((data: any) => data.result));
  }

  updateDocument(id: string, payload: CreateUpdateDocumentDto): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_DOCUMENT_PAGE}/${id}`, payload).pipe(map((data: any) => data.result));
  }

  createDocument(payload: CreateUpdateDocumentDto): Observable<any> {
    return this.http.post<any>(API_URLS.SYSTEM_DOCUMENT_PAGE, payload).pipe(map((data: any) => data.result));
  }

  sendMail(payload: SendMail): Observable<any> {
    return this.http.post<any>(`${API_URLS.SYSTEM_DOCUMENT_PAGE}/send`, payload).pipe(map((data: any) => data.result));
  }

}