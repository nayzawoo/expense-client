import { Routes } from '@angular/router';
import { UserApi } from './data/user.api';
import { provideUsersI18n } from './data/users.i18n';

/** Lazy-loaded household users feature routes (export only — shell wires path). */
export const USERS_ROUTES: Routes = [
  {
    path: '',
    providers: [UserApi, provideUsersI18n()],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/user-list.page').then((m) => m.UserListPage),
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/user-form.page').then((m) => m.UserFormPage),
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./pages/user-form.page').then((m) => m.UserFormPage),
      },
    ],
  },
];
