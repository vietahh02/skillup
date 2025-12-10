import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {API_URLS} from '../app.config';
import {DashboardHubData} from '../models/dashboard-hub.model';

@Injectable({
    providedIn: 'root'
})
export class ApiDashboardHubServices {
    private readonly API_URL = API_URLS.DASHBOARD_HUB || API_URLS.DASHBOARD_V2;

    constructor(private http: HttpClient) {
    }

    getDashboardData(): Observable<DashboardHubData> {
        // TODO: Replace with actual API call
        return of({
            summary: {
                totalProfit: 0,
                totalProfitChange: 0,
                totalProfitChangePercent: 0,
                activeProducts: 0,
                lowStockCount: 0
            },
            profitData: [],
            inventoryItems: []
        });
    }
}

