import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../app.config';
import { PurchaseOrder, PurchaseOrderPagePayload, PurchaseOrderPageResponse } from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class ApiPurchaseOrderServices {

  constructor(private http: HttpClient) { }

  getPurchaseOrderPage(payload: PurchaseOrderPagePayload): Observable<PurchaseOrderPageResponse<PurchaseOrder>> {
    const { page, size, sort, ...bodyPayload } = payload;
    const params: any = {};
    if (page !== undefined && page !== null) params.page = page;
    if (size !== undefined && size !== null) params.size = size;
    if (sort !== undefined && sort !== null) params.sort = sort;

    return this.http.post<any>(API_URLS.PURCHASE_ORDER, bodyPayload, { params }).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

  getPurchaseOrderDetail(id: string | number): Observable<PurchaseOrder> {
    return this.http.get<any>(`${API_URLS.PURCHASE_ORDER}/${id}`).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

  createPurchaseOrder(payload: any): Observable<any> {
    return this.http.post<any>(API_URLS.PURCHASE_ORDER_CREATE, payload).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

  updatePurchaseOrder(id: string | number, payload: any): Observable<any> {
    return this.http.put<any>(`${API_URLS.PURCHASE_ORDER}/${id}`, payload).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

  deletePurchaseOrder(id: string | number): Observable<any> {
    return this.http.delete<any>(`${API_URLS.PURCHASE_ORDER}/${id}`).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

  checkApprove(id: string | number, payload?: any): Observable<any> {
    const body = payload || {
      requestId: '',
      client: 'CMS',
      version: '1.0'
    };
    return this.http.post<any>(`${API_URLS.PURCHASE_ORDER_APPROVE}/${id}`, body).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

  approvePurchaseOrder(payload: any): Observable<any> {
    return this.http.put<any>(API_URLS.PURCHASE_ORDER_APPROVE, payload).pipe(
      map((data: any) => {
        if (data.result) {
          return data.result;
        }
        return data;
      })
    );
  }

}

