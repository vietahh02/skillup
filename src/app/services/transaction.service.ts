import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {API_URLS} from '../app.config';
import {Transaction, TransactionPagePayload, TransactionPageResponse} from '../models/transaction.model';

@Injectable({
    providedIn: 'root'
})
export class ApiTransactionServices {

    constructor(private http: HttpClient) {
    }

    getTransactionPage(payload: TransactionPagePayload): Observable<TransactionPageResponse<Transaction>> {
        const {page, size, sort, ...bodyPayload} = payload;
        const params: any = {};
        if (page !== undefined && page !== null) params.page = page;
        if (size !== undefined && size !== null) params.size = size;
        if (sort !== undefined && sort !== null) params.sort = sort;

        return this.http.post<any>(API_URLS.TRANSACTION, bodyPayload, {params}).pipe(
            map((data: any) => {
                if (data.result) {
                    return data.result;
                }
                return data;
            })
        );
    }

    getTransactionDetail(id: string | number): Observable<Transaction> {
        return this.http.get<any>(`${API_URLS.TRANSACTION}/${id}`).pipe(
            map((data: any) => {
                if (data.result) {
                    return data.result;
                }
                return data;
            })
        );
    }

    exportTransactions(payload: TransactionPagePayload): Observable<Blob> {
        const {page, size, sort, ...bodyPayload} = payload;
        return this.http.post(`${API_URLS.TRANSACTION}/export`, bodyPayload, {
            responseType: 'blob'
        });
    }
}

