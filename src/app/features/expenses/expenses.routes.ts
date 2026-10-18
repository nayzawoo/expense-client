import { Routes } from '@angular/router';

/** Lazy placeholder — feature UI owned by `feat/expense-client-expenses`. */
export const EXPENSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./expenses-placeholder.page').then((m) => m.ExpensesPlaceholderPage),
  },
];
