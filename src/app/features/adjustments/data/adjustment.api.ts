import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { createIdempotencyKey } from '../../../shared';
import type {
  AccountOption,
  AdjustmentDto,
  ReconcileRequest,
  VoidAdjustmentRequest,
} from './adjustment.models';

/**
 * Adjustments + account reconciliation against expense-api.
 * Session cookies + CSRF come from core interceptors / AuthService.
 */
@Injectable()
export class AdjustmentApi {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private householdId(): string {
    const id = this.auth.household()?.id;
    if (!id) {
      throw new Error('Household is not loaded');
    }
    return id;
  }

  private adjustmentsBase(): string {
    return apiV1(`/households/${this.householdId()}/adjustments`);
  }

  list(): Observable<AdjustmentDto[]> {
    return this.http.get<AdjustmentDto[]>(this.adjustmentsBase());
  }

  get(adjustmentId: string): Observable<AdjustmentDto> {
    return this.http.get<AdjustmentDto>(`${this.adjustmentsBase()}/${adjustmentId}`);
  }

  reconcile(accountId: string, request: ReconcileRequest): Observable<AdjustmentDto> {
    return this.http.post<AdjustmentDto>(
      apiV1(`/households/${this.householdId()}/accounts/${accountId}/reconciliations`),
      request,
      { headers: this.writeHeaders() },
    );
  }

  voidAdjustment(
    adjustmentId: string,
    version: number,
    request: VoidAdjustmentRequest,
  ): Observable<AdjustmentDto> {
    return this.http.post<AdjustmentDto>(
      `${this.adjustmentsBase()}/${adjustmentId}/void`,
      request,
      { headers: this.writeHeaders(version) },
    );
  }

  listAccounts(): Observable<AccountOption[]> {
    return this.http.get<AccountOption[]>(apiV1(`/households/${this.householdId()}/accounts`));
  }

  private writeHeaders(ifMatchVersion?: number): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Idempotency-Key': createIdempotencyKey(),
    });
    if (ifMatchVersion != null) {
      headers = headers.set('If-Match', String(ifMatchVersion));
    }
    return headers;
  }
}
