import { Injectable } from '@angular/core';
import { BehaviorSubject, timer, Observable, throwError } from 'rxjs';
import { ApiAuthServices } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { tap, catchError, share } from 'rxjs/operators';
// import { CookieService } from 'ngx-cookie-service';

@Injectable({ providedIn: 'root' })
export class TokenService {

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
    // Nếu không có refresh token, throw error
    // const refreshToken = this.getRefreshToken() || "";
    // if (!refreshToken) {
    //   return throwError(() => new Error('No refresh token available'));
    // }

    // Nếu đang refresh, trả về observable hiện tại
    if (this.refreshTokenObservable) {
      return this.refreshTokenObservable;
    }

    // Tạo observable mới cho việc refresh
    this.refreshTokenObservable = this.apiAuthService.refreshToken().pipe(
      tap((response: any) => {
        this.setToken(response.accessToken);
        
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }

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
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      this.snack.open('No token available', '', { 
        duration: 3000, 
        panelClass: ['error-snackbar', 'custom-snackbar'], 
        horizontalPosition: 'right', 
        verticalPosition: 'top' 
      });
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
      const refreshTime = expiry - now - (1.7 * 60 * 1000);
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

  setToken(token: string, accessTokenExpiry?: string) {
    localStorage.setItem('access_token', token);
    // this.cookieService.set(
    //   'accessToken',
    //   token,
    //   { 
    //     path: '/',
    //     secure: true,
    //     sameSite: 'None',
    //     expires: 7 // ngày
    //   }
    // );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setRefreshToken(refreshToken: string) {
    localStorage.setItem('refresh_token', refreshToken);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

}
