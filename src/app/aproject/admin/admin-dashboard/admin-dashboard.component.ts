import { Component } from '@angular/core';
import { EcommerceStatsComponent } from '../ecommerce-stats/ecommerce-stats.component';
import { AudienceOverviewComponent } from '../audience-overview/audience-overview.component';

@Component({
    selector: 'app-ecommerce',
    imports: [EcommerceStatsComponent, AudienceOverviewComponent],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboard {}