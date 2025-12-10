import { Component, signal } from '@angular/core';
import { ToggleService } from './common/header/toggle.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { HeaderComponent } from './common/header/header.component';
import { FooterComponent } from './common/footer/footer.component';
import { SidebarComponent } from './common/sidebar/sidebar.component';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { CustomizerSettingsService } from './customizer-settings/customizer-settings.service';
// import { CustomizerSettingsComponent } from './customizer-settings/customizer-settings.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule, SidebarComponent, HeaderComponent, FooterComponent],
    templateUrl: './app.html',
    styleUrls: ['./app.scss']
})
export class App {

    private previousUrl: string | null = null;

    protected readonly title = signal('IT Management System');

    isToggled = false;

    constructor(
        public router: Router,
        private toggleService: ToggleService,
        private viewportScroller: ViewportScroller,
        public themeService: CustomizerSettingsService
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