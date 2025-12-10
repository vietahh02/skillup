import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { environment } from '../environments/environment';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './services/auth.interceptor';
import { AuthService } from './context/auth.service';
import { TokenService } from './context/token.service';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes), provideClientHydration(withEventReplay()),
        provideAnimationsAsync(),
        provideHttpClient(),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideAppInitializer(() => {
          const authService = inject(AuthService);
          const tokenService = inject(TokenService);
          authService.initializeAuth();
          tokenService.setupAutoRefresh();
        })
    ]
};