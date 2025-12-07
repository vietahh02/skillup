import { Component } from '@angular/core';
import { NgClass, DatePipe, CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToggleService } from '../../../context/toggle.service';
import { AuthService } from '../../../context/auth.service';
import { Observable } from 'rxjs';
import { UserInfo } from '../../../models/user.models';
import { MatTooltip } from "@angular/material/tooltip";

@Component({
    selector: 'app-header-manager',
    imports: [RouterLink, NgClass, MatMenuModule, MatIconModule, MatButtonModule, DatePipe, CommonModule, MatTooltip],
    templateUrl: './header-manager.component.html',
    styleUrls: ['./header-manager.component.scss']
})
export class HeaderManagerComponent {

    isToggled = false;
    currentUser$: Observable<UserInfo | null>;
    currentDate: Date;
    
    constructor(
        private toggleService: ToggleService,
        private authService: AuthService,
        private router: Router
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
        this.currentDate = new Date();
        this.currentUser$ = this.authService.currentUser$;
    }
    
    maxLengthText(text: string) : boolean {
        return text.length > 20;
    }

    formatText(text: string) : string {
        return this.maxLengthText(text) ? text.substring(0, 20) + '...' : text;
    }

    toggle() {
        this.toggleService.toggle();
    }

    login() {
        this.router.navigate(['/login']);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    getUserInitials(name: string): string {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

}