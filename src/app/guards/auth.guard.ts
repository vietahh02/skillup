import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { ApiAuthServices } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiAuthServices);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

