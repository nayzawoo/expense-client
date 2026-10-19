import { Routes } from '@angular/router';
import { AccountApi } from './data/account.api';
import { provideAccountsI18n } from './data/accounts.i18n';

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    providers: [AccountApi, provideAccountsI18n()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/account-list.page').then((m) => m.AccountListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/account-form.page').then((m) => m.AccountFormPage),
      },
      {
        path: ':accountId/ledger',
        loadComponent: () =>
          import('./pages/account-ledger.page').then((m) => m.AccountLedgerPage),
      },
    ],
  },
];
