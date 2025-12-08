import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URLS } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private http: HttpClient) {}

  getUserReport(page: number = 1, pageSize: number = 10, searchTerm: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get<any>(API_URLS.GET_USER_REPORT, { params });
  }

  exportUserReportExcel(searchTerm: string = ''): Observable<Blob> {
    let params = new HttpParams();
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }

    return this.http.get(API_URLS.EXPORT_USER_REPORT_EXCEL, { 
      params,
      responseType: 'blob'
    });
  }
}