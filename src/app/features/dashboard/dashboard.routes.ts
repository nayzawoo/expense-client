import { Routes } from '@angular/router';
import { DashboardApi } from './data/dashboard.api';
import { provideDashboardI18n } from './data/dashboard.i18n';

/** Lazy-loaded dashboard feature routes (export only — shell wires path). */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    providers: [DashboardApi, provideDashboardI18n()],
    loadComponent: () => import('./pages/dashboard.page').then((m) => m.DashboardPage),
  },
];
