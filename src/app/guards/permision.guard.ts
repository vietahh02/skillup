import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiAuthServices } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiAuthServices);
  const router = inject(Router);

  if (authService.isAdminHub()) {
    return true;
  }

  if (authService.isPermissionGranted(route.data['permission'])) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

