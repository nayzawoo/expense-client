import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AppLanguage, LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, TranslatePipe],
  template: `
    <label class="sr-only" [attr.for]="selectId">{{ 'nav.language' | translate }}</label>
    <select
      [id]="selectId"
      class="ui-input min-w-28 py-1.5"
      [ngModel]="language.current()"
      (ngModelChange)="onChange($event)"
      [attr.aria-label]="'nav.language' | translate"
    >
      @for (lang of languages; track lang.code) {
        <option [ngValue]="lang.code">{{ lang.label }}</option>
      }
    </select>
  `,
})
export class LanguageSwitcherComponent {
  readonly language = inject(LanguageService);
  readonly selectId = `lang-${Math.random().toString(36).slice(2, 8)}`;

  readonly languages: { code: AppLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'my', label: 'မြန်မာ' },
  ];

  onChange(code: AppLanguage): void {
    this.language.use(code);
  }
}
