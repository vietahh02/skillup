import {Component, effect, OnDestroy, OnInit} from '@angular/core';
import {ToggleService} from './toggle.service';
import {DatePipe, NgClass} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {CustomizerSettingsService} from '../../customizer-settings/customizer-settings.service';
import {Language, LanguageService} from '../../services/language.service';
import {TranslatePipe} from '../../utils/translate.pipe';
import {ApiAuthServices} from '../../services/auth.service';
import {Subscription} from 'rxjs';
import {
    ChangePasswordDialogComponent
} from '../../shared/components/change-password-dialog/change-password-dialog.component';

@Component({
    selector: 'app-header',
    imports: [
        RouterLink,
        NgClass,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        DatePipe,
        TranslatePipe
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {

    isToggled = false;
    currentLanguage: Language = 'en';
    currentLanguageFlag = 'img/flag/usa.png';
    userInfo: any = null;
    private userInfoSubscription?: Subscription;

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService,
        public languageService: LanguageService,
        private authService: ApiAuthServices,
        private dialog: MatDialog,
    ) {
        this.toggleService.isToggled$.subscribe((isToggled) => {
            this.isToggled = isToggled;
        });
        this.currentDate = new Date();
        this.currentLanguage = this.languageService.getCurrentLanguage();
        this.updateFlag();

        effect(() => {
            const lang = this.languageService.getCurrentLanguageSignal()();
            this.currentLanguage = lang;
            this.updateFlag();
        });
    }

    ngOnInit(): void {
        // Load initial user info
        this.loadUserInfo();

        // Subscribe to user info changes
        this.userInfoSubscription = this.authService.userInfo$.subscribe(userInfo => {
            this.userInfo = userInfo;
        });
    }

    ngOnDestroy(): void {
        if (this.userInfoSubscription) {
            this.userInfoSubscription.unsubscribe();
        }
    }

    loadUserInfo(): void {
        this.userInfo = this.authService.getUserInfo();
    }


    updateFlag(): void {
        this.currentLanguageFlag = this.currentLanguage === 'en' ? 'img/flag/usa.png' : 'img/flag/myanmar.png';
    }

    currentDate: Date;

    changeLanguage(lang: Language): void {
        this.languageService.setLanguage(lang);
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    toggle() {
        this.toggleService.toggle();
    }

    toggleSidebarTheme() {
        this.themeService.toggleSidebarTheme();
    }

    toggleHideSidebarTheme() {
        this.themeService.toggleHideSidebarTheme();
    }

    toggleCardBorderTheme() {
        this.themeService.toggleCardBorderTheme();
    }

    toggleHeaderTheme() {
        this.themeService.toggleHeaderTheme();
    }

    toggleCardBorderRadiusTheme() {
        this.themeService.toggleCardBorderRadiusTheme();
    }

    toggleRTLEnabledTheme() {
        this.themeService.toggleRTLEnabledTheme();
    }

    logout(): void {
        this.authService.logout();
    }

    openChangePasswordDialog(): void {
        this.dialog.open(ChangePasswordDialogComponent, {
            width: '500px',
            disableClose: true,
            panelClass: 'change-password-dialog-container'
        });
    }
}
