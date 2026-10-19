import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  isDevMode,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import {
  AuthService,
  LanguageService,
  credentialsInterceptor,
  csrfInterceptor,
  provideI18n,
} from './core';
import { provideAppLucideIcons } from './shared/icons/lucide-icons';

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
    provideAppLucideIcons(),
    provideI18n(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: bootstrapApp,
    },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
