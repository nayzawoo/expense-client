import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import { DashboardPayload } from './dashboard.models';

/** Dashboard report client for expense-api session auth. */
@Injectable()
export class DashboardApi {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  get(asOf?: string): Observable<DashboardPayload> {
    const householdId = this.auth.household()?.id;
    if (!householdId) {
      throw new Error('Household is not loaded');
    }
    const params = asOf ? { asOf } : undefined;
    return this.http.get<DashboardPayload>(
      apiV1(`/households/${householdId}/reports/dashboard`),
      { params },
    );
  }
}
