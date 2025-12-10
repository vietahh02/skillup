import {ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {environment} from '../environments/environment';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi} from '@angular/common/http';
import {provideNativeDateAdapter} from '@angular/material/core';
import {LanguageInterceptor} from '../core/interceptors/language.interceptor';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {CustomPaginatorIntl} from './common/custom-paginator/customPaginatorIntl';
import {authInterceptor} from '../core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes), provideClientHydration(withEventReplay()),
        provideAnimationsAsync(),
        provideHttpClient(
            withInterceptorsFromDi(),
            withInterceptors([authInterceptor])
        ),
        provideNativeDateAdapter(),
        { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
        { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    ]
};

const BASE_URLS: any = environment.baseUrl;

export const GATEWAY_URL = environment.baseUrl.GATEWAY_URL;
export const LOGIN_URL = environment.baseUrl.LOGIN_URL;
export const API_URLS = {
  EXAMPLE_GET: BASE_URLS.EXAMPLE + "/todos/1",

  // Application
  APPLICATION_GET_PAGE: BASE_URLS.HUB + '/application/get-page',
  APPLICATION_CREATE: BASE_URLS.HUB + '/application/create',
  APPLICATION_UPDATE: BASE_URLS.HUB + '/application/update',
  APPLICATION_DELETE: BASE_URLS.HUB + '/application/delete',
  APPLICATION_DETAIL: BASE_URLS.HUB + '/application/get-detail',

  // System User
  SYSTEM_USER: BASE_URLS.HUB + '/admin/account',
  SYSTEM_USER_ENABLE: BASE_URLS.HUB + '/admin/account/enable',
  SYSTEM_USER_DISABLE: BASE_URLS.HUB + '/admin/account/disable',
  SYSTEM_USER_RESET_PASSWORD: BASE_URLS.HUB + '/admin/account/reset-password',

  // System Role
  SYSTEM_ROLE: BASE_URLS.HUB + '/admin/roles',

  // System Config
  SYSTEM_CONFIG_ACTION: BASE_URLS.HUB + '/admin/permissions',
  SYSTEM_CONFIG_PAGE: BASE_URLS.HUB + '/page-setting',
  SYSTEM_CONFIG_ACTION_UPDATE: BASE_URLS.HUB + '/admin/partner-permissions',
  SYSTEM_CONFIG_PAGE_UPDATE: BASE_URLS.HUB + '/admin/partner-page-setting',

  // Partner
  PARTNER_MANAGEMENT: BASE_URLS.HUB + '/partners',
  PARTNER_ENABLE: BASE_URLS.HUB + '/partners/unBlock',
  PARTNER_DISABLE: BASE_URLS.HUB + '/partners/block',

  // Geo
  GEO_CITY: BASE_URLS.HUB + '/admin/geo/cities',
  GEO_TOWNSHIP: BASE_URLS.HUB + '/admin/geo/townships',

  // System Product
  SYSTEM_PRODUCT_PAGE: GATEWAY_URL + '/products',
  SYSTEM_POLICY_PAGE: GATEWAY_URL + '/policies',

  // System Stock
  SYSTEM_STOCK_PAGE: GATEWAY_URL + '/stock',

  // System Document
  SYSTEM_DOCUMENT_PAGE: BASE_URLS.HUB + '/admin/document-templates',

  // Purchase Order
  PURCHASE_ORDER: GATEWAY_URL + '/purchase-orders',
  PURCHASE_ORDER_CREATE: GATEWAY_URL + '/purchase-orders/create',
  PURCHASE_ORDER_APPROVE: GATEWAY_URL + '/purchase-orders/approve',

    // Transaction
    TRANSACTION: GATEWAY_URL + '/transactions',
    BALANCE: GATEWAY_URL + '/balance',
    RECONCILIATION: GATEWAY_URL + '/reconciliation',

    // Dashboard V2
    DASHBOARD_V2: GATEWAY_URL + '/dashboard',
    DASHBOARD_HUB: GATEWAY_URL + '/dashboard',

  LOGIN_URL: BASE_URLS.LOGIN_URL,
  AUTH_LOGIN: BASE_URLS.HUB+'/auth/login',
  AUTH_LOGOUT: BASE_URLS.HUB+'/auth/logout',
    AUTH_REFRESH: BASE_URLS.HUB + '/auth/refresh',
    AUTH_CHANGE_PASSWORD: BASE_URLS.HUB + '/auth/change-password',

  // Profile
  PROFILE_UPDATE: BASE_URLS.HUB + '/admin/account/update-profile',
  PROFILE_DETAIL: BASE_URLS.HUB + '/admin/account/get-profile',
  PROFILE_AVATAR: BASE_URLS.HUB + '/avatar',
  

  // System Help
  SYSTEM_HELP_PAGE: BASE_URLS.HUB + '/admin/help-document',

}

