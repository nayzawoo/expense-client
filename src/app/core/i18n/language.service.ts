import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

export type AppLanguage = 'en' | 'my';

const STORAGE_KEY = 'expense_lang';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);
  private readonly currentSignal = signal<AppLanguage>(environment.defaultLanguage);

  readonly current = this.currentSignal.asReadonly();
  readonly supported: AppLanguage[] = ['en', 'my'];

  init(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    const lang: AppLanguage =
      stored === 'en' || stored === 'my' ? stored : environment.defaultLanguage;
    this.translate.addLangs(this.supported);
    this.translate.setFallbackLang('en');
    this.use(lang);
  }

  use(lang: AppLanguage): void {
    this.translate.use(lang);
    this.currentSignal.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }
}
