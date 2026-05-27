import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest, AuthUser } from '../../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';
  private readonly USER_KEY = 'auth_user';

  private tokenSignal = signal<string | null>(localStorage.getItem(this.TOKEN_KEY));
  private userSignal = signal<AuthUser | null>(this.loadUser());

  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly user = computed(() => this.userSignal());
  readonly roles = computed(() => this.userSignal()?.roles ?? []);
  readonly profiles = computed(() => this.userSignal()?.profiles ?? []);
  readonly permissions = computed(() => this.userSignal()?.permissions ?? []);
  readonly isSuperAdmin = computed(() => this.userSignal()?.superAdmin ?? false);
  readonly companyName = computed(() => this.userSignal()?.companyName ?? null);

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<AuthUser> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((res) => this.saveToken(res.token)),
        switchMap(() => this.me()),
      );
  }

  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap({
        next: (user) => {
          this.userSignal.set(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        },
        error: () => this.logout(),
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  refreshMe(): Observable<AuthUser | null> {
    if (!this.tokenSignal()) {
      return of(null);
    }
    return this.me();
  }

  requestPasswordReset(data: ForgotPasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/forgot-password`, data);
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiUrl}/auth/reset-password`, data);
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((p) => this.hasPermission(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every((p) => this.hasPermission(p));
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
