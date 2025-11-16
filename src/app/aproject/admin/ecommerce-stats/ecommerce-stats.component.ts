import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-ecommerce-stats',
    imports: [MatCardModule, MatMenuModule, MatButtonModule],
    templateUrl: './ecommerce-stats.component.html',
    styleUrls: ['./ecommerce-stats.component.scss']
})
export class EcommerceStatsComponent {

    constructor() {}


}