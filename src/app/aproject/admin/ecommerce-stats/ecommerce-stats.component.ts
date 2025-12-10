import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { DashBoardAdmin } from '../../../models/user.models';

@Component({
    selector: 'app-ecommerce-stats',
    imports: [MatCardModule, MatMenuModule, MatButtonModule],
    templateUrl: './ecommerce-stats.component.html',
    styleUrls: ['./ecommerce-stats.component.scss']
})
export class EcommerceStatsComponent {

    @Input() data!: DashBoardAdmin;  

    constructor() {}


}