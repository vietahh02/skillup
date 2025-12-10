import { Component, inject } from '@angular/core';
import { ToggleService } from '../header/toggle.service';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { CustomizerSettingsService } from '../../customizer-settings/customizer-settings.service';
import { TranslatePipe } from '../../utils/translate.pipe';
import { ApiAuthServices } from '../../services/auth.service';
import { PAGES, PATHS, PERMISSIONS } from '../../utils/shared/constants/auth.constants';

@Component({
    selector: 'app-sidebar',
    imports: [CommonModule, RouterLink, NgClass, NgScrollbarModule, MatExpansionModule, RouterLinkActive, TranslatePipe],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

    authService = inject(ApiAuthServices);  
    pages = PAGES;
    permissions = PERMISSIONS;
    path = PATHS;
    
    panelOpenState = false;

    isToggled = false;

    isHovered = false;

    constructor(
        private toggleService: ToggleService,
        public themeService: CustomizerSettingsService
    ) {
        this.toggleService.isToggled$.subscribe(isToggled => {
            this.isToggled = isToggled;
        });                                                                                                                                                                                                                                                                                                                                        
    }

    checkChangeLogo() {
        return this.isToggled === true && this.isHovered === false ? 'img/logoiconlarge.png' : 'img/logo-hub.png';
    }

    checkChangeLogoSize() {
        return this.isToggled === true && this.isHovered === true ? 'logo-sidebar' : '';
    }

    onSidebarMouseEnter(): void {
        this.isHovered = true;
    }

    onSidebarMouseLeave(): void {
        this.isHovered = false;
    }

    toggle(): void {
        this.toggleService.toggle();
    }

    toggleSidebarTheme() {
        this.themeService.toggleSidebarTheme();
    }

    toggleHideSidebarTheme() {
        this.themeService.toggleHideSidebarTheme();
    }

}