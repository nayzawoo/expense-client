import { Routes } from '@angular/router';
import { guestGuard, passwordChangeGuard } from '../../core';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'change-password',
    canActivate: [passwordChangeGuard],
    loadComponent: () =>
      import('./change-password/change-password.page').then((m) => m.ChangePasswordPage),
  },
];
