import { Routes } from '@angular/router';
import { BeneficiaryApi } from './data/beneficiary.api';
import { provideBeneficiariesI18n } from './data/beneficiaries.i18n';

/** Lazy-loaded beneficiary feature routes (export only — shell wires path). */
export const BENEFICIARIES_ROUTES: Routes = [
  {
    path: '',
    providers: [BeneficiaryApi, provideBeneficiariesI18n()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/beneficiary-list.page').then((m) => m.BeneficiaryListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/beneficiary-form.page').then((m) => m.BeneficiaryFormPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/beneficiary-form.page').then((m) => m.BeneficiaryFormPage),
      },
    ],
  },
];
