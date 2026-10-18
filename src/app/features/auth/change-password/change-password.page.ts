import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';

const MIN_PASSWORD_LENGTH = 8;

function matchNewPassword(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value ?? '';
  const confirm = group.get('confirmPassword')?.value ?? '';
  if (!confirm) {
    return null;
  }
  return next === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    LanguageSwitcherComponent,
    UiAlertComponent,
    UiButtonComponent,
  ],
  template: `
    <div class="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
      <div class="flex items-center justify-between gap-3">
        <h1 class="text-2xl font-semibold">{{ 'auth.changePasswordTitle' | translate }}</h1>
        <app-language-switcher />
      </div>
      <p class="text-surface-600">{{ 'auth.changePasswordHint' | translate }}</p>

      @if (errorKey()) {
        <app-ui-alert severity="error">{{ errorKey()! | translate }}</app-ui-alert>
      }

      <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
        <label class="flex flex-col gap-1.5 text-sm font-medium text-surface-700">
          {{ 'auth.currentPassword' | translate }}
          <input
            class="ui-input"
            type="password"
            formControlName="currentPassword"
            autocomplete="current-password"
          />
        </label>

        <label class="flex flex-col gap-1.5 text-sm font-medium text-surface-700">
          {{ 'auth.newPassword' | translate }}
          <input
            class="ui-input"
            type="password"
            formControlName="newPassword"
            autocomplete="new-password"
          />
          @if (form.controls.newPassword.touched && form.controls.newPassword.invalid) {
            <span class="text-xs text-rose-700">{{ 'auth.passwordTooShort' | translate }}</span>
          }
        </label>

        <label class="flex flex-col gap-1.5 text-sm font-medium text-surface-700">
          {{ 'auth.confirmPassword' | translate }}
          <input
            class="ui-input"
            type="password"
            formControlName="confirmPassword"
            autocomplete="new-password"
          />
          @if (form.touched && form.hasError('mismatch')) {
            <span class="text-xs text-rose-700">{{ 'auth.passwordMismatch' | translate }}</span>
          }
        </label>

        <app-ui-button type="submit" [block]="true" [loading]="submitting()" [disabled]="submitting()">
          {{ 'auth.savePassword' | translate }}
        </app-ui-button>
      </form>
    </div>
  `,
})
export class ChangePasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly errorKey = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(MIN_PASSWORD_LENGTH)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchNewPassword },
  );

  submit(): void {
    this.errorKey.set(null);
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();
    this.submitting.set(true);
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/login', {
          state: { passwordChanged: true },
        });
      },
      error: (err: { status?: number }) => {
        this.submitting.set(false);
        if (err.status === 401) {
          this.errorKey.set('auth.currentPasswordWrong');
          return;
        }
        if (err.status === 400) {
          this.errorKey.set('auth.passwordTooShort');
          return;
        }
        this.errorKey.set('auth.changePasswordFailed');
      },
    });
  }
}
