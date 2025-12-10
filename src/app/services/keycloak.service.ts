import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
  private keycloak: Keycloak;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.keycloak = new Keycloak({
      url: environment.keycloakConfig.url,
      realm: environment.keycloakConfig.realm,
      clientId: environment.keycloakConfig.clientId
    });
  }

  async init(): Promise<boolean> {
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
        pkceMethod: 'S256'
      });
      
      this.isAuthenticatedSubject.next(authenticated);
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      return false;
    }
  }

  async loginWithRedirect(): Promise<void> {
    await this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  async logout(): Promise<void> {
    await this.keycloak.logout({
      redirectUri: window.location.origin + '/login'
    });
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getRefreshToken(): string | undefined {
    return this.keycloak.refreshToken;
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshed = await this.keycloak.updateToken(30);
      if (refreshed) {
        this.isAuthenticatedSubject.next(true);
      }
      return refreshed;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated || false;
  }

  getUserInfo(): any {
    if (this.keycloak.tokenParsed) {
      return {
        username: this.keycloak.tokenParsed['preferred_username'],
        email: this.keycloak.tokenParsed['email'],
        name: this.keycloak.tokenParsed['name'],
        roles: this.keycloak.realmAccess?.roles || []
      };
    }
    return null;
  }

  hasRole(role: string): boolean {
    return this.keycloak.hasRealmRole(role);
  }

  getKeycloakInstance(): Keycloak {
    return this.keycloak;
  }
}

