import { Routes } from '@angular/router';

/** Lazy placeholder — feature UI owned by `feat/expense-client-categories` (dashboard slice). */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./dashboard-placeholder.page').then((m) => m.DashboardPlaceholderPage),
  },
];
