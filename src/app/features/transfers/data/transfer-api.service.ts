import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { createIdempotencyKey } from '../../../shared';
import type {
  AccountOption,
  CreateTransferRequest,
  TransferDto,
  VoidTransferRequest,
} from './transfer.models';

@Injectable({ providedIn: 'root' })
export class TransferApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  list(): Observable<TransferDto[]> {
    return this.withHousehold((id) =>
      this.http.get<TransferDto[]>(apiV1(`/households/${id}/transfers`)),
    );
  }

  create(request: CreateTransferRequest): Observable<TransferDto> {
    return this.withHousehold((id) =>
      this.http.post<TransferDto>(apiV1(`/households/${id}/transfers`), request, {
        headers: this.writeHeaders(),
      }),
    );
  }

  voidTransfer(
    transferId: string,
    version: number,
    request: VoidTransferRequest,
  ): Observable<TransferDto> {
    return this.withHousehold((id) =>
      this.http.post<TransferDto>(
        apiV1(`/households/${id}/transfers/${transferId}/void`),
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
