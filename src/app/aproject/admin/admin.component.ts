import { Component, signal } from '@angular/core';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { HeaderAdminComponent } from '../../common/admin/header-admin/header-admin.component';
import { FooterComponent } from '../../common/footer/footer.component';
import { SidebarAdminComponent } from '../../common/admin/sidebar-admin/sidebar-admin.component';
import { ToggleService } from '../../context/toggle.service';

@Component({
    selector: 'app-admin',
    imports: [RouterOutlet, CommonModule, HeaderAdminComponent, FooterComponent, SidebarAdminComponent],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class Admin {

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