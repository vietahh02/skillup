import { CommonModule, ViewportScroller } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Event, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FooterComponent } from '../../common/footer/footer.component';
import { HeaderUserComponent } from "../../common/user/header-user/header-user.component";
import { SidebarUserComponent } from "../../common/user/sidebar-user/sidebar-user.component";
import { ToggleService } from '../../common/context/toggle.service';


@Component({
    selector: 'app-user',
    imports: [RouterOutlet, CommonModule, FooterComponent, HeaderUserComponent, SidebarUserComponent],
    templateUrl: './user.component.html',
    styleUrl: './user.component.scss'
})
export class User {

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