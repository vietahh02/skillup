import { Component } from '@angular/core';
import { AcUserOverviewComponent } from "./ac-user-overview/ac-user-overview.component";
import { AcUserStatusComponent } from "./ac-user-status/ac-user-status.component";

@Component({
    selector: 'app-manager-dashboard',
    imports: [AcUserOverviewComponent, AcUserStatusComponent],
    templateUrl: './manager-dashboard.component.html',
    styleUrls: ['./manager-dashboard.component.scss']
})
export class ManagerDashboard {}