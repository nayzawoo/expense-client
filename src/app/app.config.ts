import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  APP_INITIALIZER,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
    provideI18n(),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: bootstrapApp,
    },
  ],
};
