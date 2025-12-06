import { Component } from '@angular/core';
import { EcommerceStatsComponent } from '../ecommerce-stats/ecommerce-stats.component';
import { AudienceOverviewComponent } from '../audience-overview/audience-overview.component';
import { ApiDashboardServices } from '../../../services/dashboard.service';

@Component({
    selector: 'app-ecommerce',
    imports: [EcommerceStatsComponent, AudienceOverviewComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboard {

    data: any;

    constructor(private dashboardService: ApiDashboardServices) {}

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.dashboardService.getDashboardAdmin().subscribe((res: any) => {
            this.data = res;
        }, error => {
            this.loadData();
        });
    }
}