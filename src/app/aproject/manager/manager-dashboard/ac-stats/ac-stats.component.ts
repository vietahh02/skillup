import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-ac-stats',
    imports: [MatCardModule, MatMenuModule, MatButtonModule],
    templateUrl: './ac-stats.component.html',
    styleUrls: ['./ac-stats.component.scss']
})
export class AcStatsComponent {
    @Input() data:any;

    constructor() {}


}