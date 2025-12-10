import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiAuthServices } from '../services/auth.service';

export const pageGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiAuthServices);
  const router = inject(Router);

  if (authService.isAdminHub()) {
    return true;
  }

  if (authService.isPageGranted(route.data['page'])) {
    return true;
  }

  router.navigate(['/']);
  return false;
};

