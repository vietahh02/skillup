import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ManagerChatSidebarComponent } from './manager-chat-sidebar/manager-chat-sidebar.component';

@Component({
    selector: 'app-manager-chat',
    imports: [RouterLink, MatCardModule, MatButtonModule, MatMenuModule, ManagerChatSidebarComponent],
    templateUrl: './manager-chat.component.html',
    styleUrls: ['./manager-chat.component.scss']
})
export class ManagerChatComponent {
    
}