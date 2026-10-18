import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { apiV1 } from '../api/api-base';
import { CsrfBootstrap, CurrentUser, Household, LoginRequest } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly userSignal = signal<CurrentUser | null>(null);
  private readonly householdSignal = signal<Household | null>(null);
  private readonly csrfTokenSignal = signal<string | null>(null);
  private readonly csrfHeaderSignal = signal('X-XSRF-TOKEN');
  private readonly readySignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly household = this.householdSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly mustChangePassword = computed(() => this.userSignal()?.mustChangePassword === true);
  readonly ready = this.readySignal.asReadonly();
  readonly csrfHeaderName = this.csrfHeaderSignal.asReadonly();
  readonly csrfToken = this.csrfTokenSignal.asReadonly();

  /** Bootstrap CSRF + optional session user for app start. */
  bootstrapSession(): Observable<CurrentUser | null> {
    return this.refreshCsrf().pipe(
      switchMap(() =>
        this.http.get<CurrentUser>(apiV1('/auth/me'), { withCredentials: true }).pipe(
          tap((user) => this.userSignal.set(user)),
          switchMap((user) =>
            user.mustChangePassword
              ? of(user)
              : this.loadHousehold().pipe(
                  map(() => user),
                  catchError(() => of(user)),
                ),
          ),
          catchError(() => {
            this.userSignal.set(null);
            this.householdSignal.set(null);
            return of(null);
          }),
        ),
      ),
      tap(() => this.readySignal.set(true)),
    );
  }

  refreshCsrf(): Observable<CsrfBootstrap> {
    return this.http.get<CsrfBootstrap>(apiV1('/auth/csrf'), { withCredentials: true }).pipe(
      tap((csrf) => {
        this.csrfTokenSignal.set(csrf.token);
        this.csrfHeaderSignal.set(csrf.headerName || 'X-XSRF-TOKEN');
      }),
    );
  }

  login(request: LoginRequest): Observable<CurrentUser> {
    return this.refreshCsrf().pipe(
      switchMap((csrf) =>
        this.http.post<CurrentUser>(apiV1('/auth/login'), request, {
          withCredentials: true,
          headers: new HttpHeaders({ [csrf.headerName]: csrf.token }),
        }),
      ),
      switchMap((user) =>
        // Login rotates session + CSRF; refresh before further writes.
        this.refreshCsrf().pipe(
          switchMap(() => {
            this.userSignal.set(user);
            if (user.mustChangePassword) {
              return of(user);
            }
            return this.loadHousehold().pipe(
              map(() => user),
              catchError(() => of(user)),
            );
          }),
        ),
      ),
      catchError((err) => throwError(() => err)),
    );
  }

  logout(): Observable<void> {
    const headers = this.csrfHeaders();
    return this.http
      .post<void>(apiV1('/auth/logout'), null, { withCredentials: true, headers })
      .pipe(
        catchError(() => of(void 0)),
        tap(() => {
          this.userSignal.set(null);
          this.householdSignal.set(null);
          this.csrfTokenSignal.set(null);
        }),
        switchMap(() => this.refreshCsrf().pipe(map(() => void 0), catchError(() => of(void 0)))),
      );
  }

  loadHousehold(): Observable<Household> {
    return this.http.get<Household>(apiV1('/household'), { withCredentials: true }).pipe(
      tap((household) => this.householdSignal.set(household)),
    );
  }

  csrfHeaders(): HttpHeaders {
    const token = this.csrfTokenSignal();
    const header = this.csrfHeaderSignal();
    return token ? new HttpHeaders({ [header]: token }) : new HttpHeaders();
  }
}
