import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_URLS } from '../app.config';
import { CreateUpdateProductPayload, Product, ProductDetail, ProductPagePayload, ProductPageResponse, ProductPolicy, ProductPolicyPagePayload } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ApiProductServices {

  constructor(private http: HttpClient) { }

  getProductPage(payload: ProductPagePayload): Observable<ProductPageResponse<Product>> {
    return this.http.get<any>(API_URLS.SYSTEM_PRODUCT_PAGE, { params: payload as any }).pipe(map((data: any) => data.result));
  }
  getProductById(id: string): Observable<ProductDetail> {
    return this.http.get<any>(`${API_URLS.SYSTEM_PRODUCT_PAGE}/${id}`).pipe(map((data: any) => data.result));
  } 

  createProduct(payload: CreateUpdateProductPayload): Observable<Product> {
    return this.http.post<any>(API_URLS.SYSTEM_PRODUCT_PAGE, payload).pipe(map((data: any) => data.result));
  }

  updateProduct(payload: CreateUpdateProductPayload): Observable<Product> {
    return this.http.put<any>(API_URLS.SYSTEM_PRODUCT_PAGE, payload).pipe(map((data: any) => data.result));
  }

  enableProduct(id: number): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_PRODUCT_PAGE}/enable/${id}`, {}).pipe(map((data: any) => data.result));
  }

  disableProduct(id: number): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_PRODUCT_PAGE}/disable/${id}`, {}).pipe(map((data: any) => data.result));
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URLS.SYSTEM_PRODUCT_PAGE}/${id}`).pipe(map((data: any) => data.result));
  }

  getPolicyPage(payload: ProductPolicyPagePayload): Observable<ProductPageResponse<ProductPolicy>> {
    return this.http.get<any>(API_URLS.SYSTEM_POLICY_PAGE, payload as any).pipe(map((data: any) => data.result));
  }

  getPolicyById(id: string | number): Observable<ProductPolicy> {
    return this.http.get<any>(`${API_URLS.SYSTEM_POLICY_PAGE}/${id}`).pipe(map((data: any) => data.result));
  }

  enablePolicy(id: number): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_POLICY_PAGE}/enable/${id}`, {}, { 
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 204) {
          return { success: true };
        }
        return response.body?.result || response.body || { success: true };
      })
    );
  }

  disablePolicy(id: number): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_POLICY_PAGE}/disable/${id}`, {}, { 
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => {
        // Handle 204 No Content as success
        if (response.status === 204) {
          return { success: true };
        }
        return response.body?.result || response.body || { success: true };
      })
    );
  }

  deletePolicy(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URLS.SYSTEM_POLICY_PAGE}/${id}`, {  
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 204) {
          return { success: true };
        }
        return response.body?.result || response.body || { success: true };
      })
    );
  }

  createPolicy(payload: any): Observable<any> {
    return this.http.post<any>(API_URLS.SYSTEM_POLICY_PAGE, payload, {  
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 204) {
          return { success: true };
        }
        return response.body?.result || response.body || { success: true };
      })
    );
  }

  updatePolicy(id: string | number, payload: any): Observable<any> {
    return this.http.put<any>(`${API_URLS.SYSTEM_POLICY_PAGE}/${id}`, payload, {  
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 204) {
          return { success: true };
        }
        return response.body?.result || response.body || { success: true };
      })
    );
  }
}