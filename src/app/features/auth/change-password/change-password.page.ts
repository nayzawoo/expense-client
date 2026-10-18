import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Message } from 'primeng/message';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';

/** Shell for forced password change (`mustChangePassword`); full form in a later slice. */
@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [TranslatePipe, Message, LanguageSwitcherComponent],
  template: `
    <div class="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">{{ 'auth.changePasswordTitle' | translate }}</h1>
        <app-language-switcher />
      </div>
      <p class="text-surface-600">{{ 'auth.changePasswordHint' | translate }}</p>
      <p-message severity="info" styleClass="w-full">{{ 'auth.placeholderNote' | translate }}</p-message>
    </div>
  `,
})
export class ChangePasswordPage {}
