import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { API_URLS } from '../app.config';
import { ActionSetting, ActionSettingUpdate, PageSetting, PageSettingUpdate } from '../models/config.model';
import { Stock, StockCreateUpdatePayload, StockPagePayload, StockPageResponse } from '../models/stock.model';
import { ApiAuthServices } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ApiStockServices {

  constructor(private http: HttpClient, private authService: ApiAuthServices) { }

  getStockPage(payload: StockPagePayload): Observable<StockPageResponse<any>> {
    if (this.authService.getPartnerId()) {
      payload.partnerId = this.authService.getPartnerId();
    }
    return this.http.get<any>(`${API_URLS.SYSTEM_STOCK_PAGE}/get-list`, { params: payload as any }).pipe(switchMap((data: any) => of(data.result)));
  }

  getStockDetail(id: number | string): Observable<Stock> {
    return this.http.get<any>(`${API_URLS.SYSTEM_STOCK_PAGE}/${id}`).pipe(switchMap((data: any) => of(data.result)));
  }

  updateStock(id: number | string, payload: StockCreateUpdatePayload): Observable<Stock> {
    return this.http.put<any>(`${API_URLS.SYSTEM_STOCK_PAGE}/${id}`, payload).pipe(switchMap((data: any) => of(data.result)));
  }

  createStock(payload: StockCreateUpdatePayload): Observable<Stock> {
    return this.http.post<any>(API_URLS.SYSTEM_STOCK_PAGE, payload).pipe(switchMap((data: any) => of(data.result)));
  }

}