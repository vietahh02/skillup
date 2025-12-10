import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SidebarManagerComponent } from "../../common/manager/sidebar-manager/sidebar-manager.component";
import { HeaderManagerComponent } from "../../common/manager/header-manager/header-manager.component";
import { ToggleService } from '../../context/toggle.service';
import { FooterComponent } from '../../common/footer/footer.component';


@Component({
    selector: 'app-manager',
    imports: [RouterOutlet, CommonModule, FooterComponent,  SidebarManagerComponent, HeaderManagerComponent],
    templateUrl: './manager.component.html',
    styleUrl: './manager.component.scss'
})
export class Manager {

    private previousUrl: string | null = null;

    protected readonly title = signal('Skill Up');

    isToggled = false;

    constructor(
        public router: Router,
        private toggleService: ToggleService,
        private viewportScroller: ViewportScroller,
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                const currentUrl = event.urlAfterRedirects;
                // Scroll to top ONLY if navigating to a different route (not on refresh)
                if (this.previousUrl && this.previousUrl !== currentUrl) {
                    this.viewportScroller.scrollToPosition([0, 0]);
                }
                this.previousUrl = currentUrl;
            }
        });
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });
    }

}