import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';


@Component({
    selector: 'app-admin-user',
    imports: [RouterOutlet],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss'],
})
export class AdminUserManagement {}

