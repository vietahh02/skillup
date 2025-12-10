import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {API_URLS} from '../app.config';
import {Balance, BalancePagePayload, BalancePageResponse, BalanceSummary} from '../models/balance.model';

@Injectable({
    providedIn: 'root'
})
export class ApiBalanceServices {

    constructor(private http: HttpClient) {
    }

    getBalancePage(payload: BalancePagePayload): Observable<BalancePageResponse<Balance>> {
        const {page, size, sort, ...bodyPayload} = payload;
        const params: any = {};
        if (page !== undefined && page !== null) params.page = page;
        if (size !== undefined && size !== null) params.size = size;
        if (sort !== undefined && sort !== null) params.sort = sort;

        return this.http.post<any>(API_URLS.BALANCE, bodyPayload, {params}).pipe(
            map((data: any) => {
                if (data.result) {
                    return data.result;
                }
                return data;
            })
        );
    }

    getBalanceSummary(payload: BalancePagePayload): Observable<BalanceSummary> {
        const {page, size, sort, ...bodyPayload} = payload;
        const params: any = {};
        if (page !== undefined && page !== null) params.page = page;
        if (size !== undefined && size !== null) params.size = size;
        if (sort !== undefined && sort !== null) params.sort = sort;

        return this.http.post<any>(`${API_URLS.BALANCE}/summary`, bodyPayload, {params}).pipe(
            map((data: any) => {
                if (data.result) {
                    return data.result;
                }
                return data;
            })
        );
    }

    exportBalances(payload: BalancePagePayload): Observable<any> {
        const {page, size, sort, ...bodyPayload} = payload;
        const params: any = {};
        if (page !== undefined && page !== null) params.page = page;
        if (size !== undefined && size !== null) params.size = size;
        if (sort !== undefined && sort !== null) params.sort = sort;

        return this.http.post<any>(`${API_URLS.BALANCE}/export`, bodyPayload, {params, responseType: 'blob' as 'json'});
    }
}

