import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {API_URLS} from '../app.config';
import {Reconciliation, ReconciliationPagePayload, ReconciliationPageResponse} from '../models/reconciliation.model';

@Injectable({
    providedIn: 'root'
})
export class ApiReconciliationServices {

    constructor(private http: HttpClient) {
    }

    getReconciliationPage(payload: ReconciliationPagePayload): Observable<ReconciliationPageResponse<Reconciliation>> {
        const {page, size, sort, ...bodyPayload} = payload;
        const params: any = {};
        if (page !== undefined && page !== null) params.page = page;
        if (size !== undefined && size !== null) params.size = size;
        if (sort !== undefined && sort !== null) params.sort = sort;

        return this.http.post<any>(API_URLS.RECONCILIATION, bodyPayload, {params}).pipe(
            map((data: any) => {
                if (data.result) {
                    return data.result;
                }
                return data;
            })
        );
    }

    getReconciliationDetail(id: string | number): Observable<Reconciliation> {
        return this.http.get<any>(`${API_URLS.RECONCILIATION}/${id}`).pipe(map((data: any) => data.result));
    }

    downloadReconciliationFile(id: string | number): Observable<any> {
        return this.http.get(`${API_URLS.RECONCILIATION}/${id}/download`, {responseType: 'blob'});
    }

    reprocessReconciliation(id: string | number): Observable<any> {
        return this.http.post<any>(`${API_URLS.RECONCILIATION}/${id}/reprocess`, {});
    }
}

