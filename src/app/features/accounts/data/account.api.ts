import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { createIdempotencyKey } from '../../../shared';
import { Account, CreateAccountRequest } from './account.models';

@Injectable()
export class AccountApi {
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
    return apiV1(`/households/${this.householdId()}/accounts`);
  }

  list(): Observable<Account[]> {
    return this.http.get<Account[]>(this.base());
  }

  get(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.base()}/${accountId}`);
  }

  create(body: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(this.base(), body, {
      headers: new HttpHeaders({ 'Idempotency-Key': createIdempotencyKey() }),
    });
  }
}
