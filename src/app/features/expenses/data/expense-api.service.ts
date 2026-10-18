import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { createIdempotencyKey } from '../../../shared';
import type {
  AccountOption,
  BeneficiaryOption,
  CategoryOption,
  CreateExpenseRequest,
  ExpenseDto,
  ReplaceExpenseRequest,
  VoidExpenseRequest,
} from './expense.models';

/**
 * expense-api expenses + form reference data.
 * Session cookies + CSRF ride global interceptors; mutations add Idempotency-Key / If-Match.
 */
@Injectable({ providedIn: 'root' })
export class ExpenseApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<ExpenseDto[]> {
    return this.withHousehold((id) =>
      this.http.get<ExpenseDto[]>(apiV1(`/households/${id}/expenses`)),
    );
  }

  get(expenseId: string): Observable<ExpenseDto> {
    return this.withHousehold((id) =>
      this.http.get<ExpenseDto>(apiV1(`/households/${id}/expenses/${expenseId}`)),
    );
  }

  create(request: CreateExpenseRequest): Observable<ExpenseDto> {
    return this.withHousehold((id) =>
      this.http.post<ExpenseDto>(apiV1(`/households/${id}/expenses`), request, {
        headers: this.writeHeaders(),
      }),
    );
  }

  replace(
    expenseId: string,
    version: number,
    request: ReplaceExpenseRequest,
  ): Observable<ExpenseDto> {
    return this.withHousehold((id) =>
      this.http.put<ExpenseDto>(apiV1(`/households/${id}/expenses/${expenseId}`), request, {
        headers: this.writeHeaders(version),
      }),
    );
  }

  voidExpense(
    expenseId: string,
    version: number,
    request: VoidExpenseRequest,
  ): Observable<ExpenseDto> {
    return this.withHousehold((id) =>
      this.http.post<ExpenseDto>(
        apiV1(`/households/${id}/expenses/${expenseId}/void`),
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

  listCategories(status = 'ACTIVE'): Observable<CategoryOption[]> {
    return this.withHousehold((id) =>
      this.http.get<CategoryOption[]>(apiV1(`/households/${id}/categories`), {
        params: { status },
      }),
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
