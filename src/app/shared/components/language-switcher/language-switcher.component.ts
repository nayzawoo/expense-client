import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { AppLanguage, LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, Select, TranslatePipe],
  template: `
    <p-select
      [options]="languages"
      optionLabel="label"
      optionValue="code"
      [ngModel]="language.current()"
      (ngModelChange)="onChange($event)"
      [ariaLabel]="'nav.language' | translate"
      styleClass="min-w-28"
    />
  `,
})
export class LanguageSwitcherComponent {
  readonly language = inject(LanguageService);

  readonly languages: { code: AppLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'my', label: 'မြန်မာ' },
  ];

  onChange(code: AppLanguage): void {
    this.language.use(code);
  }
}
