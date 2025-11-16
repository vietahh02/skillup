import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { ToggleService } from '../../context/toggle.service';

@Component({
    selector: 'app-sidebar-manager',
    imports: [RouterLink, NgClass, NgScrollbarModule, MatExpansionModule, RouterLinkActive],
    templateUrl: './sidebar-manager.component.html',
    styleUrls: ['./sidebar-manager.component.scss']
})
export class SidebarManagerComponent {

    panelOpenState = false;

    isToggled = false;

    constructor(
        private toggleService: ToggleService,
        private router: Router
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

    isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

    toggle() {
        this.toggleService.toggle();
    }

}