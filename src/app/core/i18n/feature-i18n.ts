import { ENVIRONMENT_INITIALIZER, inject, type EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TranslateService, type TranslationObject } from '@ngx-translate/core';

/**
 * Eagerly merge feature translation trees into ngx-translate and re-apply on
 * language change so HTTP asset loads cannot wipe feature keys.
 */
export function provideFeatureI18n(en: TranslationObject, my: TranslationObject): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: ENVIRONMENT_INITIALIZER,
      multi: true,
      useValue: () => {
        const translate = inject(TranslateService);
        const apply = (): void => {
          translate.setTranslation('en', en, true);
          translate.setTranslation('my', my, true);
        };
        apply();
        translate.onLangChange.subscribe(() => apply());
      },
    },
  ]);
}
