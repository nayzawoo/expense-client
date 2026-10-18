import { Routes } from '@angular/router';

/** Lazy placeholder — feature UI owned by `feat/expense-client-categories`. */
export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./categories-placeholder.page').then((m) => m.CategoriesPlaceholderPage),
  },
];
