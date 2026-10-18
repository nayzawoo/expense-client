import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, apiV1 } from '../../../core';
import {
  Category,
  CategoryStatus,
  CategoryStatusPayload,
  CategoryWritePayload,
} from './category.models';

/**
 * Categories HTTP client for expense-api.
 * Session cookies + CSRF come from core interceptors / AuthService.
 */
@Injectable()
export class CategoryApi {
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
    return apiV1(`/households/${this.householdId()}/categories`);
  }

  list(status?: CategoryStatus | 'ALL'): Observable<Category[]> {
    const params =
      status === 'ALL'
        ? { status: 'ALL' }
        : status
          ? { status }
          : undefined;
    return this.http.get<Category[]>(this.base(), { params });
  }

  get(categoryId: string): Observable<Category> {
    return this.http.get<Category>(`${this.base()}/${categoryId}`);
  }

  create(body: CategoryWritePayload): Observable<Category> {
    return this.http.post<Category>(this.base(), body);
  }

  update(categoryId: string, body: Partial<CategoryWritePayload>): Observable<Category> {
    return this.http.put<Category>(`${this.base()}/${categoryId}`, body);
  }

  updateStatus(categoryId: string, body: CategoryStatusPayload): Observable<Category> {
    return this.http.patch<Category>(`${this.base()}/${categoryId}/status`, body);
  }
}
