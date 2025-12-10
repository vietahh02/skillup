import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of, throwError} from 'rxjs';
import {catchError, switchMap} from 'rxjs/operators';
import {API_URLS} from '../app.config';
import {KeycloakService} from './keycloak.service';
import {Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {generateUUID} from '../utils/uuid.util';

@Injectable({
  providedIn: 'root'
})
export class ApiAuthServices {
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'token_expiry';
  private readonly PERMISSIONS_KEY = 'permissions';
  private readonly PERMISSIONS_OTP = 'permissions_otp';
  private readonly PAGE_SETTINGS_KEY = 'pageSettings';
  private readonly PARTNER_ID_KEY = 'partnerId';
  private readonly PARTNER_NAME_KEY = 'partnerName';
  private readonly CLIENT_ID_KEY = 'client_id';
  private readonly ROLE_KEY = 'role';
  private refreshTimer: any = null;
  private isRefreshing = false;
  private isLoggingOut = false;
  private refreshTokenPromise: Observable<any> | null = null;
  private userInfoSubject = new BehaviorSubject<any>(null);
  public userInfo$ = this.userInfoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    // Emit initial user info if token exists
    const initialUserInfo = this.getUserInfo();
    if (initialUserInfo) {
      this.userInfoSubject.next(initialUserInfo);
    }
  }

  login(username: string, password: string): Observable<any> {
    // Clear token cũ trước khi login (không navigate)
    this.clearLocalStorage(false);

    const body = {
      requestId: generateUUID(),
      client: 'CMS',
      version: '1.0',
      keyword: '',
      username: username,
      password: password
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': 'application/json'
    });

    return this.http.post<any>(API_URLS.AUTH_LOGIN, body, { headers }).pipe(
      switchMap((response: any) => {
        if (response?.result?.access_token) {
          const result = response.result;

          this.setToken(result.access_token);
          if (result.refresh_token) {
            this.setRefreshToken(result.refresh_token);
          }

          if (result.permissions) {
            const permissions = result.permissions.map((permission: any) => permission.value);
            localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(permissions));
            localStorage.setItem(this.PERMISSIONS_OTP, JSON.stringify(result.permissions));
          }

          if (result.pageSettings) {
            localStorage.setItem(this.PAGE_SETTINGS_KEY, JSON.stringify(result.pageSettings));
          }

          if (result.partnerId) {
            localStorage.setItem(this.PARTNER_ID_KEY, result.partnerId);
          }

          if (result.partnerName) {
            localStorage.setItem(this.PARTNER_NAME_KEY, result.partnerName);
          }

          if (result.clientId) {
            localStorage.setItem(this.CLIENT_ID_KEY, result.clientId);
          }

          if (result.access_token) {
            this.setRole();
          }

          const expiresIn = result.expires_in || 300;
          const expiryTime = Date.now() + (expiresIn * 1000);
          localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

          this.scheduleTokenRefresh(expiresIn - 60);

          this.keycloakService['keycloak'].token = result.access_token;
          this.keycloakService['keycloak'].refreshToken = result.refresh_token;
          this.keycloakService['keycloak'].authenticated = true;
          this.keycloakService['isAuthenticatedSubject'].next(true);

          const userInfo = this.getUserInfo();
          this.userInfoSubject.next(userInfo);

          return of(result);
        } else {
          return throwError(() => new Error(response?.errorMessage || 'Login failed'));
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  setRole(): void {
    const token = this.getToken();
    if (!token) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      localStorage.setItem(this.ROLE_KEY, JSON.stringify(payload.realm_access?.roles || []));
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() < exp;
    } catch {
      return false;
    }
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }

    this.isRefreshing = false;
    this.refreshTokenPromise = null;

    if (this.router.url.includes('/login')) {
      this.clearLocalStorage();
      this.isLoggingOut = false;
      return;
    }

    const headers = new HttpHeaders({
      'accept': 'application/json'
    });

    this.http.get<any>(API_URLS.AUTH_LOGOUT, { headers }).subscribe({
      next: () => {
        this.clearLocalStorage();
        this.isLoggingOut = false;
      },
      error: (error) => {
        console.error('Logout API error:', error);
        this.clearLocalStorage();
        this.isLoggingOut = false;
      }
    });
  }

  private clearLocalStorage(shouldNavigate: boolean = true): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    localStorage.removeItem(this.PERMISSIONS_KEY);
    localStorage.removeItem(this.PERMISSIONS_OTP);
    localStorage.removeItem(this.PAGE_SETTINGS_KEY);
    localStorage.removeItem(this.PARTNER_ID_KEY);
    localStorage.removeItem(this.PARTNER_NAME_KEY);
    localStorage.removeItem(this.CLIENT_ID_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.keycloakService['keycloak'].authenticated = false;
    this.keycloakService['isAuthenticatedSubject'].next(false);

    // Chỉ navigate nếu được yêu cầu và chưa ở trang login
    if (shouldNavigate && !this.router.url.includes('/login')) {
      this.router.navigate(['/login']);
    }
  }

  // Permissions
  isAdminHub() {
    const roles = localStorage.getItem(this.ROLE_KEY);
    return roles ? JSON.parse(roles).includes('hub_admin') : false;
  }

  isAdminPartner() {
    const roles = localStorage.getItem(this.ROLE_KEY);
    return roles ? JSON.parse(roles).includes('partner_admin') : false;
  }

  isAdmin() {
    return this.isAdminHub() || this.isAdminPartner();
  }

  getPermissions(): string[] {
    const permissions = localStorage.getItem(this.PERMISSIONS_KEY);
    return permissions ? JSON.parse(permissions) : [];
  }

  isPermissionGranted(permission: string): boolean {
    if (this.isAdminHub()) {
      return true;
    }
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  getPageSettings(): string[] {
    const pageSettings = localStorage.getItem(this.PAGE_SETTINGS_KEY);
    return pageSettings ? JSON.parse(pageSettings) : [];
  }

  isPageGranted(page: string): boolean {
    if (this.isAdminHub()) {
      return true;
    }
    const pageSettings = this.getPageSettings();
    return pageSettings.includes(page);
  }

  // End Permissions
  getPartnerId(): string | null {
    return localStorage.getItem(this.PARTNER_ID_KEY);
  }

  getPartnerName(): string | null {
    return localStorage.getItem(this.PARTNER_NAME_KEY);
  }

  refreshAccessToken(): Observable<any> {
    // Nếu đang refresh, trả về promise hiện tại
    if (this.isRefreshing && this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

      const token = this.getToken();
      if (!token) {
          // Không có token thì logout và redirect về login
          setTimeout(() => {
              if (!this.isLoggingOut) {
                  this.logout();
              }
          }, 100);
          return throwError(() => new Error('No token available'));
    }

    this.isRefreshing = true;

    const headers = new HttpHeaders({
        'accept': 'application/json',
        'Authorization': `Bearer ${token}`
    });

      this.refreshTokenPromise = this.http.post<any>(API_URLS.AUTH_REFRESH, {}, {headers}).pipe(
          switchMap(response => {
              const result = response?.body?.result || response?.result || response;

              if (result?.access_token) {
                  this.setToken(result.access_token);
                  if (result.refresh_token) {
                      this.setRefreshToken(result.refresh_token);
                  }

                  if (result.clientId) {
                      localStorage.setItem(this.CLIENT_ID_KEY, result.clientId);
                  }

                  if (result.permissions) {
                      localStorage.setItem(this.PERMISSIONS_KEY, JSON.stringify(result.permissions));
                  }

                  if (result.pageSettings) {
                      localStorage.setItem(this.PAGE_SETTINGS_KEY, JSON.stringify(result.pageSettings));
          }

                  if (result.partnerId) {
                      localStorage.setItem(this.PARTNER_ID_KEY, result.partnerId);
          }

                  if (result.partnerName) {
                      localStorage.setItem(this.PARTNER_NAME_KEY, result.partnerName);
                  }

                  if (result.access_token) {
                      this.setRole();
                  }

          const userInfo = this.getUserInfo();
          this.userInfoSubject.next(userInfo);

                  const expiresIn = result.expires_in || 300;
          const expiryTime = Date.now() + (expiresIn * 1000);
          localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());

          this.scheduleTokenRefresh(expiresIn - 60);

                  this.keycloakService['keycloak'].token = result.access_token;
                  if (result.refresh_token) {
                      this.keycloakService['keycloak'].refreshToken = result.refresh_token;
                  }

                  this.isRefreshing = false;
                  this.refreshTokenPromise = null;

                  return of(result.access_token);
              } else {
                  console.error('No access_token in response. Response:', response, 'Result:', result);
                  this.isRefreshing = false;
                  this.refreshTokenPromise = null;
                  setTimeout(() => {
                      if (!this.isLoggingOut) {
                          this.logout();
                      }
                  }, 100);
                  return throwError(() => new Error('No access token in response'));
        }
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.refreshTokenPromise = null;

          setTimeout(() => {
              if (!this.isLoggingOut) {
                  this.logout();
              }
          }, 100);

        return throwError(() => error);
      })
    );

    return this.refreshTokenPromise;
  }


  isTokenExpiringSoon(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) {
      return true; // Nếu không có expiry time, coi như sắp hết hạn
    }

    const expiry = parseInt(expiryTime, 10);
    const now = Date.now();
    const timeUntilExpiry = expiry - now;

    return timeUntilExpiry < 60000;
  }


  isTokenExpired(): boolean {
    const expiryTime = localStorage.getItem(this.TOKEN_EXPIRY_KEY);
    if (!expiryTime) {
      return true;
    }

    const expiry = parseInt(expiryTime, 10);
    return Date.now() >= expiry;
  }


  private scheduleTokenRefresh(secondsUntilRefresh: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (secondsUntilRefresh > 0) {
      this.refreshTimer = setTimeout(() => {
          const token = this.getToken();
          if (token) {
          this.refreshAccessToken().subscribe({
            next: () => {
            },
            error: (error) => {
            }
          });
          } else {
              if (!this.isLoggingOut) {
                  this.logout();
              }
        }
      }, secondsUntilRefresh * 1000);
    }
  }


    getValidToken(): Observable<string | null> {
    const token = this.getToken();

    if (!token) {
      return of(null);
    }

    if (this.isTokenExpiringSoon()) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        return this.refreshAccessToken().pipe(
          switchMap(() => {
            const newToken = this.getToken();
            return of(newToken);
          }),
          catchError(() => {
            return of(null);
          })
        );
      }
    }

    return of(token);
  }


    getUserInfo(): any | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        email: payload.email,
        name: payload.name,
        preferredUsername: payload.preferred_username,
        givenName: payload.given_name,
        familyName: payload.family_name,
        emailVerified: payload.email_verified,
        roles: payload.realm_access?.roles || [],
        sub: payload.sub
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }


    isPartnerAdmin(): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.roles) {
      return false;
    }
    return userInfo.roles.includes('partner_admin');
  }


    isHubAdmin(): boolean {
    const userInfo = this.getUserInfo();
    if (!userInfo || !userInfo.roles) {
      return false;
    }
    return userInfo.roles.includes('hub_admin');
  }


    getUserRoles(): string[] {
    const userInfo = this.getUserInfo();
    return userInfo?.roles || [];
  }

    changePassword(oldPassword: string, newPassword: string): Observable<any> {
        const body = {
            oldPassword: oldPassword,
            newPassword: newPassword
        };

        const headers = new HttpHeaders({
            'accept': 'application/json',
            'Content-Type': 'application/json'
        });

        return this.http.post<any>(API_URLS.AUTH_CHANGE_PASSWORD, body, {headers});
    }
}
