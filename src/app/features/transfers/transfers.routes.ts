import { Routes } from '@angular/router';

export const TRANSFERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/transfer-list.page').then((m) => m.TransferListPage),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/transfer-create.page').then((m) => m.TransferCreatePage),
  },
];
