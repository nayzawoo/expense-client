import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import {
  CreateUserPayload,
  HouseholdUser,
  TemporaryPasswordPayload,
  UpdateUserPayload,
} from './user.models';

/**
 * Household users HTTP client for expense-api (admin).
 * Session cookies + CSRF come from core interceptors / AuthService.
 */
@Injectable()
export class UserApi {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private householdId(): string {
    const id = this.auth.household()?.id;
    if (!id) {
      throw new Error('Household is not loaded');
    }
    return id;
  }

  private base(): string {
    return apiV1(`/households/${this.householdId()}/users`);
  }

  list(): Observable<HouseholdUser[]> {
    return this.http.get<HouseholdUser[]>(this.base());
  }

  get(userId: string): Observable<HouseholdUser> {
    return this.http.get<HouseholdUser>(`${this.base()}/${userId}`);
  }

  create(body: CreateUserPayload): Observable<HouseholdUser> {
    return this.http.post<HouseholdUser>(this.base(), body);
  }

  update(userId: string, body: UpdateUserPayload): Observable<HouseholdUser> {
    return this.http.patch<HouseholdUser>(`${this.base()}/${userId}`, body);
  }

  assignTemporaryPassword(userId: string, body: TemporaryPasswordPayload): Observable<void> {
    return this.http.post<void>(`${this.base()}/${userId}/temporary-password`, body);
  }
}
