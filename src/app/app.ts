import { Component, signal } from '@angular/core';
import { ToggleService } from './common/context/toggle.service';
import { CommonModule, ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { MatProgressBar } from "@angular/material/progress-bar";
import { LoadingService } from './common/context/loading.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, CommonModule, MatProgressBar],
    templateUrl: './app.html',
    styleUrl: './app.scss'
})
export class App {

    private previousUrl: string | null = null;

    protected readonly title = signal('Skill Up');

    isToggled = false;
    loading = false;

    constructor(
        public router: Router,
        private toggleService: ToggleService,
        private loadingService: LoadingService,
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
        this.loadingService.isLoading$.subscribe(loading => {
            this.loading = loading;
        });
    }

}