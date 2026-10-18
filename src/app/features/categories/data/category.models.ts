/** expense-api category DTOs under `/api/v1/households/{id}/categories`. */

export type CategoryStatus = 'ACTIVE' | 'ARCHIVED';

export interface Category {
  id: string;
  name: string;
  color: string;
  iconKey: string;
  sortOrder: number;
  status: CategoryStatus;
  version: number;
}

export interface CategoryWritePayload {
  name: string;
  color: string;
  iconKey: string;
  sortOrder: number;
}

export interface CategoryStatusPayload {
  status: CategoryStatus;
}
