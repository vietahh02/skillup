import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, timer, Observable, throwError } from 'rxjs';
import { ApiAuthServices } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, catchError, share } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private cookieService = inject(CookieService);

  private refreshTokenInProgress = false;
  private refreshTokenSubject = new BehaviorSubject<any>(null);
  private refreshTokenObservable: Observable<string> | null = null;
  
  constructor(private apiAuthService: ApiAuthServices, private snack: MatSnackBar) {}

  /**
   * Kiểm tra xem token có hết hạn không
   */
  isTokenExpired(token: string | null): boolean {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      return Date.now() > expiry;
    } catch (error) {
      return true;
    }
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Lấy role từ claim đúng
      return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || null;
    } catch (e) {
      console.error('Invalid token', e);
      return null;
    }
  }
  

  /**
   * Refresh token và trả về Observable để có thể đợi kết quả
   */
  refreshTokenObservable$(): Observable<any> {
    // Nếu đang refresh, trả về observable hiện tại
    if (this.refreshTokenObservable) {
      return this.refreshTokenObservable;
    }

    // Tạo observable mới cho việc refresh
    this.refreshTokenObservable = this.apiAuthService.refreshToken().pipe(
      tap((response: any) => {
        this.setToken(response.accessToken, response.accessTokenExpiry);
        this.refreshTokenInProgress = false;
        this.refreshTokenSubject.next(response.accessToken as string | null);
        this.setupAutoRefresh();
        this.refreshTokenObservable = null; // Reset observable
      }),
      catchError((error: any) => {
        this.refreshTokenInProgress = false;
        this.refreshTokenObservable = null; // Reset observable
        // this.authService.clearTokens(); // Clear tokens on refresh failure
        return throwError(() => error);
      }),
      share() // Share the observable to prevent multiple API calls
    );

    this.refreshTokenInProgress = true;
    return this.refreshTokenObservable;
  }

  /**
   * Lấy token hợp lệ, tự động refresh nếu cần
   */
  getValidToken(): void {
    const token = this.getToken();
    
    if (!token) {
      return;
    }

    if (this.isTokenExpired(token)) {
      this.refreshTokenObservable$().subscribe();
    }

  }

  /**
   * Thiết lập auto refresh timer
   */
  setupAutoRefresh(): void {
    const token = this.getToken();
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      const now = Date.now();
      
      // Refresh token 5 phút trước khi hết hạn
      const refreshTime = expiry - now - (2 * 60 * 1000);
      const refreshTimeInSeconds = refreshTime / 1000;
      console.log('refreshTime', refreshTimeInSeconds, 'seconds');
      
      if (refreshTime > 0) {
        timer(refreshTime).subscribe(() => {
          this.refreshTokenObservable$().subscribe();
        });
      }else {
        this.refreshTokenObservable$().subscribe();
      }
    } catch (error) {
      console.error('Error setting up auto refresh:', error);
    } 
  }

  setToken(token: string, accessTokenExpiry: string) {
    this.cookieService.set(
      'accessToken',
      token,
      { 
        path: '/',
        secure: true,
        sameSite: 'None',
        expires: new Date(Number(accessTokenExpiry) * 1000) || 7 * 24 * 60 * 60 * 1000
      }
    );
  }

  getToken(): string | null {
    return this.cookieService.get('accessToken');
  }

  clearTokens() {
    this.cookieService.delete('accessToken');
  }

}
