import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiAuthServices } from '../services/auth.service';
import { TokenService } from './token.service';
import { UserInfo } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private role = '';

  constructor(private apiAuthService: ApiAuthServices, private tokenService: TokenService) {}

  initializeAuth() {
    const token = this.tokenService.getToken();

    if (this.tokenService.isTokenExpired(token)) {
      this.tokenService.refreshTokenObservable$().subscribe(
        (response: any) => {
          this.loadUserInfo();
        },
        (error: any) => {
          console.error('Error refreshing token:', error);
          // this.tokenService.clearTokens();
        });
    }else {
      this.loadUserInfo();
    }
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  setAvatarCurrentUser(avatarUrl: string | null): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      this.currentUserSubject.next({ ...currentUser, avatarUrl: avatarUrl ?? undefined });
    }
  }

  updateUserInfo(payload: any): void {
    this.apiAuthService.updateUserInfo(payload).subscribe((response) => {
      this.loadUserInfo();
    });
  }

  getCurrentUser(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  loadUserInfo() : void {
    this.apiAuthService.getUserInfo().subscribe(
      (userInfo: UserInfo) => {
        console.log('userInfo', userInfo);
        this.currentUserSubject.next(userInfo);
        this.role = userInfo.roles[0];
      },
      error => {
        console.error('Error loading user info:', error);
        // this.clearTokens();
      }
    );
  }

  logout() {
    this.tokenService.clearTokens();
    this.currentUserSubject.next(null);
  }
}
