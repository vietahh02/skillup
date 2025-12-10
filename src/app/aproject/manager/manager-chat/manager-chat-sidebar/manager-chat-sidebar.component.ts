import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgScrollbarModule } from 'ngx-scrollbar';

@Component({
    selector: 'app-manager-chat-sidebar',
    imports: [MatCardModule, MatMenuModule, MatButtonModule, NgScrollbarModule],
    templateUrl: './manager-chat-sidebar.component.html',
    styleUrls: ['./manager-chat-sidebar.component.scss']
})
export class ManagerChatSidebarComponent {

    constructor() {}

}