import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { createIdempotencyKey } from '../../../shared';
import {
  Account,
  CreateAccountRequest,
  LedgerQuery,
  LedgerResponse,
  UpdateAccountRequest,
} from './account.models';

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

  ledger(accountId: string, query: LedgerQuery = {}): Observable<LedgerResponse> {
    let params = new HttpParams();
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }
    if (query.page != null) {
      params = params.set('page', String(query.page));
    }
    if (query.size != null) {
      params = params.set('size', String(query.size));
    }
    return this.http.get<LedgerResponse>(`${this.base()}/${accountId}/ledger`, { params });
  }

  create(body: CreateAccountRequest): Observable<Account> {
    return this.http.post<Account>(this.base(), body, {
      headers: new HttpHeaders({ 'Idempotency-Key': createIdempotencyKey() }),
    });
  }

  update(accountId: string, body: UpdateAccountRequest): Observable<Account> {
    return this.http.put<Account>(`${this.base()}/${accountId}`, body);
  }
}
