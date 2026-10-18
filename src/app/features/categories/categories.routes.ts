import { Routes } from '@angular/router';
import { CategoryApi } from './data/category.api';
import { provideCategoriesI18n } from './data/categories.i18n';

/** Lazy-loaded category feature routes (export only — shell wires path). */
export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    providers: [CategoryApi, provideCategoriesI18n()],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/category-list.page').then((m) => m.CategoryListPage),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./pages/category-form.page').then((m) => m.CategoryFormPage),
      },
      {
        path: ':id/edit',
        loadComponent: () =>
          import('./pages/category-form.page').then((m) => m.CategoryFormPage),
      },
    ],
  },
];
