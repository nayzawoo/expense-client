import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

export function provideI18n(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ...provideTranslateService({
      fallbackLang: 'en',
    }),
    ...provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json',
    }),
  ]);
}
