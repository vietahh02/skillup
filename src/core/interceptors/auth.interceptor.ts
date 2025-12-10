import {HttpInterceptorFn} from '@angular/common/http';
import {inject} from '@angular/core';
import {ApiAuthServices} from '../../app/services/auth.service';
import {catchError, switchMap, throwError} from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(ApiAuthServices);

  const excludedUrls = [
    '/protocol/openid-connect/token',
    '/auth/login',
      '/auth/refresh',
    '/assets/',
    'assets/i18n'
  ];

  const shouldExclude = excludedUrls.some(url => req.url.includes(url));
  if (shouldExclude) {
    return next(req);
  }

  if (authService.isTokenExpired()) {
    if (!window.location.pathname.includes('/login')) {
      authService.logout();
    }
    return throwError(() => new Error('Token expired'));
  }

    if (authService.isTokenExpiringSoon()) {
        const token = authService.getToken();
        if (token) {
            return authService.refreshAccessToken().pipe(
                switchMap((newToken: string) => {
                    // Sử dụng token mới từ refreshAccessToken() response
                    if (newToken) {
                        const clonedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`
                            }
                        });
                        return next(clonedReq);
                    }
                    const fallbackToken = authService.getToken();
                    if (fallbackToken) {
                        const clonedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${fallbackToken}`
                            }
                        });
                        return next(clonedReq);
                    }
                    return throwError(() => new Error('Failed to get new token'));
                }),
                catchError(error => {
                    if (!window.location.pathname.includes('/login')) {
                        authService.logout();
                    }
                    return throwError(() => error);
                })
            );
        }
    }

  const token = authService.getToken();
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(clonedReq).pipe(
      catchError(error => {
        if (error.status === 401 && !window.location.pathname.includes('/login')) {
            const currentToken = authService.getToken();
            if (currentToken) {
                return authService.refreshAccessToken().pipe(
                    switchMap((newToken: string) => {
                        if (newToken) {
                            const retryReq = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${newToken}`
                                }
                            });
                            return next(retryReq);
                        }
                        const fallbackToken = authService.getToken();
                        if (fallbackToken) {
                            const retryReq = req.clone({
                                setHeaders: {
                                    Authorization: `Bearer ${fallbackToken}`
                                }
                            });
                            return next(retryReq);
                        }
                        return throwError(() => new Error('Failed to get new token'));
                    }),
                    catchError(refreshError => {
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }
          authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};

