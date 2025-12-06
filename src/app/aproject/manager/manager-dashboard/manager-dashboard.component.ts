import { Component, signal } from '@angular/core';
import { AcUserOverviewComponent } from "./ac-user-overview/ac-user-overview.component";
import { AcUserStatusComponent } from "./ac-user-status/ac-user-status.component";
import { AcStatsComponent } from "./ac-stats/ac-stats.component";
import { ApiDashboardServices } from '../../../services/dashboard.service';
import { AcEmployeeComponent } from "./ac-employee/ac-employee.component";
import { AcBoardComponent } from "./ac-board/ac-board.component";

@Component({
    selector: 'app-manager-dashboard',
    imports: [AcStatsComponent, AcEmployeeComponent, AcBoardComponent],
    templateUrl: './manager-dashboard.component.html',
    styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboard {

    data:any;

    constructor(private dashboardService: ApiDashboardServices) {
        this.dashboardService.getManagerDashboardStats().subscribe({
            next: (res) => {
                this.data = res;
            },
            error: (error) => {
                console.error('Error loading statistics:', error);
                this.data = null;
            }
        });
    }
}