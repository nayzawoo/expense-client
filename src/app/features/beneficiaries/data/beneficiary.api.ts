import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import {
  Beneficiary,
  BeneficiaryStatus,
  BeneficiaryStatusPayload,
  BeneficiaryWritePayload,
} from './beneficiary.models';

/**
 * Beneficiaries HTTP client for expense-api.
 * Session cookies + CSRF come from core interceptors / AuthService.
 */
@Injectable()
export class BeneficiaryApi {
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
    return apiV1(`/households/${this.householdId()}/beneficiaries`);
  }

  list(status?: BeneficiaryStatus | 'ALL'): Observable<Beneficiary[]> {
    const params =
      status === 'ALL'
        ? { status: 'ALL' }
        : status
          ? { status }
          : undefined;
    return this.http.get<Beneficiary[]>(this.base(), { params });
  }

  get(beneficiaryId: string): Observable<Beneficiary> {
    return this.http.get<Beneficiary>(`${this.base()}/${beneficiaryId}`);
  }

  create(body: BeneficiaryWritePayload): Observable<Beneficiary> {
    return this.http.post<Beneficiary>(this.base(), body);
  }

  update(beneficiaryId: string, body: Partial<BeneficiaryWritePayload>): Observable<Beneficiary> {
    return this.http.put<Beneficiary>(`${this.base()}/${beneficiaryId}`, body);
  }

  updateStatus(beneficiaryId: string, body: BeneficiaryStatusPayload): Observable<Beneficiary> {
    return this.http.patch<Beneficiary>(`${this.base()}/${beneficiaryId}/status`, body);
  }
}
