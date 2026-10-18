import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import {
  AuthService,
  LanguageService,
  credentialsInterceptor,
  csrfInterceptor,
  provideI18n,
} from './core';

function bootstrapApp(): () => Promise<unknown> {
  return () => {
    const language = inject(LanguageService);
    const auth = inject(AuthService);
    language.init();
    return firstValueFrom(auth.bootstrapSession());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([credentialsInterceptor, csrfInterceptor])),
    provideAnimationsAsync(),
    provideI18n(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false,
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng, utilities',
          },
        },
      },
      ...(environment.primeNgLicenseKey
        ? { license: environment.primeNgLicenseKey }
        : {}),
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: bootstrapApp,
    },
  ],
};
