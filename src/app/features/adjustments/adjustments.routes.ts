import { Routes } from '@angular/router';
import { AdjustmentApi } from './data/adjustment.api';
import { provideAdjustmentsI18n } from './data/adjustments.i18n';

/** Lazy-loaded adjustments / reconciliation feature routes. */
export const ADJUSTMENTS_ROUTES: Routes = [
  {
    path: '',
    providers: [AdjustmentApi, provideAdjustmentsI18n()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/adjustment-list.page').then((m) => m.AdjustmentListPage),
      },
      {
        path: 'reconcile',
        loadComponent: () =>
          import('./pages/adjustment-reconcile.page').then((m) => m.AdjustmentReconcilePage),
      },
    ],
  },
];
