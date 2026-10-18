import { Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-page-placeholder',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <section class="mx-auto flex max-w-lg flex-col gap-3 px-4 py-16 text-center">
      <h1 class="text-2xl font-semibold text-surface-900">{{ titleKey() | translate }}</h1>
      <p class="text-surface-600">{{ messageKey() | translate }}</p>
    </section>
  `,
})
export class PagePlaceholderComponent {
  readonly titleKey = input('placeholder.title');
  readonly messageKey = input.required<string>();
}
