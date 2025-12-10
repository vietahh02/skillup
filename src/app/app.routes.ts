import {Routes} from '@angular/router';
import {NotFoundComponent} from './common/not-found/not-found.component';
import {SystemConfigComponent} from './features/system-config/system-config.component';
import {SystemUserManagementComponent} from './features/system-user/user-management/user-management.component';
import {SystemRoleManagementComponent} from './features/system-role/role-management/role-management.component';

import {ProductListComponent} from './features/product-management/product-list/product-list.component';
import {PartnerListComponent} from './features/partner-management/partner-list/partner-list.component';
import {
    PartnerCreateUpdateComponent
} from './features/partner-management/partner-create-update/partner-create-update.component';
import {
    DocumentManagementComponent
} from './features/document-management/document-management/document-management.component';
import {DashboardComponent} from './features/dashboard/dashboard.component';
import {DashboardV2Component} from './features/dashboard/dashboard-v2.component';
import {DashboardHubComponent} from './features/dashboard/dashboard-hub.component';
import {LoginComponent} from './common/login/login.component';
import {PartnerDetailComponent} from './features/partner-management/partner-detail/partner-detail.component';
import {authGuard} from './guards/auth.guard';
import {ApiAuthServices} from './services/auth.service';
import {inject} from '@angular/core';
import {ProductDetailComponent} from './features/product-management/product-detail/product-detail.component';
import {
    PurchaseOrderListComponent
} from './features/purchase-order-management/purchase-order-list/purchase-order-list.component';
import {StockManagementComponent} from './features/stock-management/stock-management/stock-management.component';
import {
    NotificationListComponent
} from './features/notification-management/notification-list/notification-list.component';
import {TransactionListComponent} from './features/transaction-management/transaction-list/transaction-list.component';
import {BalanceListComponent} from './features/transaction-management/balance-list/balance-list.component';
import {
    ReconciliationListComponent
} from './features/transaction-management/reconciliation-list/reconciliation-list.component';
import {permissionGuard} from './guards/permision.guard';
import {pageGuard} from './guards/page.guard';
import {PAGES, PERMISSIONS} from './utils/shared/constants/auth.constants';
import {adminHubGuard} from './guards/admin-hub.guard';
import {adminGuard} from './guards/admin.guard';
import { CreateUpdateHelpComponent } from './features/helps/create-update-help/create-update-help.component';
import { PreviewHelpComponent } from './features/helps/preview-help/preview-help.component';
import { HelpPartnerComponent } from './features/helps/help-partner/help-partner.component';
import { ProfileComponent } from './common/profile/profile.component';
import {HelpManagementComponent} from './features/helps/help-management/help-management.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
    //{ path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => {
            const authService = inject(ApiAuthServices);
            const roles = authService.getUserRoles();
            if (roles.includes('hub_admin') || roles.includes('hub_user')) {
                return DashboardHubComponent;
            }
            return DashboardV2Component;
        }
    },
  { path: 'login', component: LoginComponent },

  // System User Management
  {
    path: 'system/user',
    loadComponent: () => SystemUserManagementComponent,
    canActivate: [authGuard, adminGuard],
    data: { page: PAGES.USER }
  },
  // System Role Management
  {
    path: 'system/role',
    loadComponent: () => SystemRoleManagementComponent,
    canActivate: [authGuard, adminGuard],
    data: { page: PAGES.ROLE }
  },
  // Partner Management
  {
    path: 'system/partner-management',
    loadComponent: () => PartnerListComponent,
    canActivate: [authGuard, pageGuard, adminHubGuard],
    data: { page: PAGES.PARTNER_LIST }
  },
  {
    path: 'system/partner-management/create',
    loadComponent: () => PartnerCreateUpdateComponent,
    canActivate: [authGuard, permissionGuard, adminHubGuard],
    data: { permission: PERMISSIONS.PARTNER_CREATE }
  },
  {
    path: 'system/partner-management/edit/:id',
    loadComponent: () => PartnerCreateUpdateComponent,
    canActivate: [authGuard, permissionGuard, adminHubGuard],
    data: { permission: PERMISSIONS.PARTNER_UPDATE }
  },
  {
    path: 'system/partner-management/:id',
    loadComponent: () => PartnerDetailComponent,
    canActivate: [authGuard, pageGuard, adminHubGuard],
    data: { page: PAGES.PARTNER_DETAIL }
  },
  // Document Management
  {
    path: 'system/document-management',
    loadComponent: () => DocumentManagementComponent,
    canActivate: [authGuard, pageGuard],
    data: { page: PAGES.CONFIG }
  },
  // Config Management
  {
    path: 'system/config',
    loadComponent: () => SystemConfigComponent,
    canActivate: [authGuard, adminGuard],
    data: { page: PAGES.CONFIG }
  },
  // Product Management
  {
    path: 'system/product-management',
    loadComponent: () => ProductListComponent,
    canActivate: [authGuard, pageGuard],
    data: { page: PAGES.PRODUCT_LIST }
  },
  {
    path: 'system/product-management/:id',
    loadComponent: () => ProductDetailComponent,
    canActivate: [authGuard, pageGuard],
    data: { page: PAGES.PRODUCT_DETAIL }
  },
  // Purchase Order Management
  {
    path: 'system/purchase-order-management',
    loadComponent: () => PurchaseOrderListComponent,
    canActivate: [authGuard, pageGuard],
    data: { page: PAGES.PURCHASE_ORDER }
  },
  // Stock Management
  {
    path: 'system/stock-management',
    loadComponent: () => StockManagementComponent,
    canActivate: [authGuard]
  },
  // Notification Management
  {
    path: 'system/notification',
    loadComponent: () => NotificationListComponent,
    canActivate: [authGuard]
  },
    // Transaction Management
    {
        path: 'system/transaction-management',
        loadComponent: () => TransactionListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'system/balance-management',
        loadComponent: () => BalanceListComponent,
        canActivate: [authGuard]
    },
    {
        path: 'system/reconciliation-management',
        loadComponent: () => ReconciliationListComponent,
        canActivate: [authGuard]
    },
    // Help Management
    {
        path: 'system/help-management',
        loadComponent: () => HelpManagementComponent,
        canActivate: [authGuard, adminHubGuard]
    },
    {
        path: 'system/help-management/create',
        loadComponent: () => CreateUpdateHelpComponent,
        canActivate: [authGuard, adminHubGuard]
    },
    {
        path: 'system/help-management/edit/:code',
        loadComponent: () => CreateUpdateHelpComponent,
        canActivate: [authGuard, adminHubGuard]
    },
    {
        path: 'system/help-management/:code',
        loadComponent: () => PreviewHelpComponent,
        canActivate: [authGuard, adminHubGuard]
    },
    {
      path: 'system/help-partner',
      loadComponent: () => HelpPartnerComponent,
      canActivate: [authGuard]
    },
    {
      path: 'profile',
      loadComponent: () => ProfileComponent,
      canActivate: [authGuard]
    },
  { path: '**', component: NotFoundComponent },
];
