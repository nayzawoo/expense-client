import { Routes } from '@angular/router';
import { ProfileApi } from './data/profile.api';
import { provideProfileI18n } from './data/profile.i18n';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    providers: [ProfileApi, provideProfileI18n()],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/profile.page').then((m) => m.ProfilePage),
      },
    ],
  },
];
