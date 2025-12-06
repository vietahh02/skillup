import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';
import { DocumentModel } from '../models/document.models';

@Injectable({
  providedIn: 'root'
})
export class ApiDocumentServices {

  constructor(private http: HttpClient) { }

  getDocuments(courseId: number | string): Observable<DocumentModel[]> {
    return this.http.get<DocumentModel[]>(`${API_URLS.GET_DOCUMENTS}/${courseId}`);
  }

  uploadDocument(courseId: number | string, document: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('courseId', courseId.toString());
    document.forEach(file => {
      formData.append('files', file);
    });
    return this.http.post<any>(`${API_URLS.UPLOAD_DOCUMENT}`, formData);
  }

  deleteDocument(documentId: number): Observable<any> {
    return this.http.delete(`${API_URLS.DELETE_DOCUMENT}/${documentId}`);
  }

  downloadDocument(documentId: number): Observable<any> {
    return this.http.get(`${API_URLS.DOWNLOAD_DOCUMENT}/${documentId}/download`);
  }

}