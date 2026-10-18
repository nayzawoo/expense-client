import { Routes } from '@angular/router';

/**
 * Lazy-loaded by shell (`app.routes.ts` → path `expenses`).
 * Keep route definitions inside this feature only.
 */
export const EXPENSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/expense-list.page').then((m) => m.ExpenseListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/expense-create.page').then((m) => m.ExpenseCreatePage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/expense-edit.page').then((m) => m.ExpenseEditPage),
  },
];
