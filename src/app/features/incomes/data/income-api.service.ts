import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { createIdempotencyKey } from '../../../shared';
import type {
  AccountOption,
  BeneficiaryOption,
  CreateIncomeRequest,
  IncomeDto,
  VoidIncomeRequest,
} from './income.models';

@Injectable({ providedIn: 'root' })
export class IncomeApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<IncomeDto[]> {
    return this.withHousehold((id) =>
      this.http.get<IncomeDto[]>(apiV1(`/households/${id}/incomes`)),
    );
  }

  create(request: CreateIncomeRequest): Observable<IncomeDto> {
    return this.withHousehold((id) =>
      this.http.post<IncomeDto>(apiV1(`/households/${id}/incomes`), request, {
        headers: this.writeHeaders(),
      }),
    );
  }

  voidIncome(
    incomeId: string,
    version: number,
    request: VoidIncomeRequest,
  ): Observable<IncomeDto> {
    return this.withHousehold((id) =>
      this.http.post<IncomeDto>(
        apiV1(`/households/${id}/incomes/${incomeId}/void`),
        request,
        { headers: this.writeHeaders(version) },
      ),
    );
  }

  listAccounts(): Observable<AccountOption[]> {
    return this.withHousehold((id) =>
      this.http.get<AccountOption[]>(apiV1(`/households/${id}/accounts`)),
    );
  }

  listBeneficiaries(status = 'ACTIVE'): Observable<BeneficiaryOption[]> {
    return this.withHousehold((id) =>
      this.http.get<BeneficiaryOption[]>(apiV1(`/households/${id}/beneficiaries`), {
        params: { status },
      }),
    );
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

  private withHousehold<T>(fn: (householdId: string) => Observable<T>): Observable<T> {
    const household = this.auth.household();
    if (household?.id) {
      return fn(household.id);
    }
    return this.auth.loadHousehold().pipe(
      switchMap((loaded) => {
        if (!loaded?.id) {
          return throwError(() => new Error('HOUSEHOLD_REQUIRED'));
        }
        return fn(loaded.id);
      }),
    );
  }
}
