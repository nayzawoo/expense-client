import { Routes } from '@angular/router';
import { authGuard } from './core';
import { ShellComponent } from './layout/shell/shell.component';
import { AUTH_ROUTES } from './features/auth/auth.routes';

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'expenses',
        loadChildren: () =>
          import('./features/expenses/expenses.routes').then((m) => m.EXPENSES_ROUTES),
      },
      {
        path: 'incomes',
        loadChildren: () =>
          import('./features/incomes/incomes.routes').then((m) => m.INCOMES_ROUTES),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.CATEGORIES_ROUTES),
      },
      {
        path: 'accounts',
        loadChildren: () =>
          import('./features/accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
