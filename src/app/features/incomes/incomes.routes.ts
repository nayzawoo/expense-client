import { Routes } from '@angular/router';

export const INCOMES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/income-list.page').then((m) => m.IncomeListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/income-create.page').then((m) => m.IncomeCreatePage),
  },
];
