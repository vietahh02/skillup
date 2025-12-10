import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {RevenueChartPayload, WalletBalance} from '../models/dashboard-v2.model';

@Injectable({
    providedIn: 'root'
})
export class ApiDashboardV2Services {

    constructor(private http: HttpClient) {
    }

    getRevenueData(payload: RevenueChartPayload): Observable<any> {
        // TODO: Replace with actual API call
        // return this.http.post<any>(`${API_URLS.DASHBOARD_V2}/revenue`, payload).pipe(
        //   map((data: any) => data.result)
        // );
        return of({result: []});
    }

    getWalletBalance(): Observable<WalletBalance> {
        // TODO: Replace with actual API call
        // return this.http.get<any>(`${API_URLS.DASHBOARD_V2}/wallet-balance`).pipe(
        //   map((data: any) => data.result)
        // );
        return of({
            currentBalance: 0,
            pendingRequests: [],
            totalPendingAmount: 0,
            status: 'normal'
        });
    }
}

