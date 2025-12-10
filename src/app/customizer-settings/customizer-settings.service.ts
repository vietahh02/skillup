import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomizerSettingsService {

    private isDarkTheme = false;
    private isSidebarDarkTheme = false;
    private isRightSidebarTheme = false;
    private isHideSidebarTheme = false;
    private isHeaderDarkTheme = false;
    private isCardBorderTheme = false;
    private isCardBorderRadiusTheme = false;
    private isRTLEnabledTheme = false;
    private isBrowser: boolean;

    private isToggled = new BehaviorSubject<boolean>(false);
    get isToggled$() {
        return this.isToggled.asObservable();
    }

    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);

        if (this.isBrowser) {
            this.isDarkTheme = JSON.parse(localStorage.getItem('isDarkTheme')!) || false;
            this.updateDarkBodyClass();
            this.isSidebarDarkTheme = JSON.parse(localStorage.getItem('isSidebarDarkTheme')!) || false;
            this.isRightSidebarTheme = JSON.parse(localStorage.getItem('isRightSidebarTheme')!) || false;
            this.isHideSidebarTheme = JSON.parse(localStorage.getItem('isHideSidebarTheme')!) || false;
            this.isHeaderDarkTheme = JSON.parse(localStorage.getItem('isHeaderDarkTheme')!) || false;
            this.isCardBorderTheme = JSON.parse(localStorage.getItem('isCardBorderTheme')!) || false;
            this.isCardBorderRadiusTheme = JSON.parse(localStorage.getItem('isCardBorderRadiusTheme')!) || false;
            this.isRTLEnabledTheme = JSON.parse(localStorage.getItem('isRTLEnabledTheme')!) || false;
            this.updateRTLBodyClass();
        }
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        if (this.isBrowser) {
            localStorage.setItem('isDarkTheme', JSON.stringify(this.isDarkTheme));
        }
        this.updateDarkBodyClass();
    }

    private updateDarkBodyClass() {
        if (!this.isBrowser) return;
        if (this.isDarkTheme) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    toggleSidebarTheme() {
        this.isSidebarDarkTheme = !this.isSidebarDarkTheme;
        if (this.isBrowser) {
            localStorage.setItem('isSidebarDarkTheme', JSON.stringify(this.isSidebarDarkTheme));
        }
    }

    toggleRightSidebarTheme() {
        this.isRightSidebarTheme = !this.isRightSidebarTheme;
        if (this.isBrowser) {
            localStorage.setItem('isRightSidebarTheme', JSON.stringify(this.isRightSidebarTheme));
        }
    }

    toggleHideSidebarTheme() {
        this.isHideSidebarTheme = !this.isHideSidebarTheme;
        if (this.isBrowser) {
            localStorage.setItem('isHideSidebarTheme', JSON.stringify(this.isHideSidebarTheme));
        }
    }

    toggleHeaderTheme() {
        this.isHeaderDarkTheme = !this.isHeaderDarkTheme;
        if (this.isBrowser) {
            localStorage.setItem('isHeaderDarkTheme', JSON.stringify(this.isHeaderDarkTheme));
        }
    }

    toggleCardBorderTheme() {
        this.isCardBorderTheme = !this.isCardBorderTheme;
        if (this.isBrowser) {
            localStorage.setItem('isCardBorderTheme', JSON.stringify(this.isCardBorderTheme));
        }
    }

    toggleCardBorderRadiusTheme() {
        this.isCardBorderRadiusTheme = !this.isCardBorderRadiusTheme;
        if (this.isBrowser) {
            localStorage.setItem('isCardBorderRadiusTheme', JSON.stringify(this.isCardBorderRadiusTheme));
        }
    }

    toggleRTLEnabledTheme() {
        this.isRTLEnabledTheme = !this.isRTLEnabledTheme;
        if (this.isBrowser) {
            localStorage.setItem('isRTLEnabledTheme', JSON.stringify(this.isRTLEnabledTheme));
        }
        this.updateRTLBodyClass();
    }

    private updateRTLBodyClass() {
        if (!this.isBrowser) return;
        if (this.isRTLEnabledTheme) {
            document.body.classList.add('rtl-enabled');
        } else {
            document.body.classList.remove('rtl-enabled');
        }
    }

    isDark() { return this.isDarkTheme; }
    isSidebarDark() { return this.isSidebarDarkTheme; }
    isRightSidebar() { return this.isRightSidebarTheme; }
    isHideSidebar() { return this.isHideSidebarTheme; }
    isHeaderDark() { return this.isHeaderDarkTheme; }
    isCardBorder() { return this.isCardBorderTheme; }
    isCardBorderRadius() { return this.isCardBorderRadiusTheme; }
    isRTLEnabled() { return this.isRTLEnabledTheme; }

    toggle() {
        this.isToggled.next(!this.isToggled.value);
    }
}