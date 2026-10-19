import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs';
import { AuthService } from '../../../core';
import { UiAlertComponent, UiButtonComponent, UiSkeletonComponent } from '../../../shared';
import { ProfileApi } from '../data/profile.api';
import { Profile, normalizeEmail } from '../data/profile.models';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, UiAlertComponent, UiButtonComponent, UiSkeletonComponent],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header>
        <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
          {{ 'profile.title' | translate }}
        </h1>
        <p class="mt-1 text-sm text-surface-600">{{ 'profile.subtitle' | translate }}</p>
      </header>

      @if (loading()) {
        <div class="mx-auto flex w-full max-w-lg flex-col gap-3">
          <app-ui-skeleton height="4rem" />
          <app-ui-skeleton height="12rem" />
        </div>
      } @else if (loadError()) {
        <app-ui-alert severity="error">{{ loadError() }}</app-ui-alert>
      } @else {
        <form
          class="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 p-5"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          @if (success()) {
            <app-ui-alert severity="success">{{ success() }}</app-ui-alert>
          }
          @if (error()) {
            <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
          }

          <div class="flex flex-col gap-1.5">
            <label for="profile-display-name" class="text-sm font-medium text-surface-800">
              {{ 'profile.displayName' | translate }}
            </label>
            <input
              id="profile-display-name"
              class="ui-input"
              formControlName="displayName"
              autocomplete="name"
            />
            @if (form.controls.displayName.touched && form.controls.displayName.invalid) {
              <span class="text-xs text-rose-700">{{ 'profile.displayNameRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="profile-email" class="text-sm font-medium text-surface-800">
              {{ 'profile.email' | translate }}
            </label>
            <input
              id="profile-email"
              class="ui-input"
              type="email"
              formControlName="email"
              autocomplete="username"
            />
            @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
              <span class="text-xs text-rose-700">{{ 'profile.emailRequired' | translate }}</span>
            }
            @if (form.controls.email.touched && form.controls.email.errors?.['email']) {
              <span class="text-xs text-rose-700">{{ 'profile.emailInvalid' | translate }}</span>
            }
          </div>

          @if (emailChanging()) {
            <div class="flex flex-col gap-1.5">
              <label for="profile-password" class="text-sm font-medium text-surface-800">
                {{ 'profile.currentPassword' | translate }}
              </label>
              <input
                id="profile-password"
                class="ui-input"
                type="password"
                formControlName="currentPassword"
                autocomplete="current-password"
              />
              <p class="text-xs text-surface-500">{{ 'profile.currentPasswordHint' | translate }}</p>
              @if (form.controls.currentPassword.touched && form.controls.currentPassword.invalid) {
                <span class="text-xs text-rose-700">{{ 'profile.passwordRequired' | translate }}</span>
              }
            </div>
          }

          @if (profile(); as p) {
            <dl class="grid grid-cols-2 gap-3 rounded-lg bg-surface-50 px-3 py-3 text-sm">
              <div>
                <dt class="text-surface-500">{{ 'profile.role' | translate }}</dt>
                <dd class="font-medium text-surface-800">{{ roleLabel(p.role) }}</dd>
              </div>
              <div>
                <dt class="text-surface-500">{{ 'profile.status' | translate }}</dt>
                <dd class="font-medium text-surface-800">{{ statusLabel(p.status) }}</dd>
              </div>
            </dl>
          }

          <app-ui-button
            type="submit"
            [block]="true"
            [loading]="saving()"
            [disabled]="saving() || form.invalid || !dirty()"
          >
            {{ saving() ? ('profile.saving' | translate) : ('profile.save' | translate) }}
          </app-ui-button>
        </form>
      }
    </div>
  `,
})
export class ProfilePage implements OnInit {
  private readonly api = inject(ProfileApi);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly profile = signal<Profile | null>(null);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    currentPassword: [''],
  });

  private readonly formSnapshot = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.getRawValue()),
      map(() => this.form.getRawValue()),
    ),
    { initialValue: this.form.getRawValue() },
  );

  readonly emailChanging = computed(() => {
    const current = this.profile();
    const snap = this.formSnapshot();
    if (!current) {
      return false;
    }
    return normalizeEmail(snap.email) !== normalizeEmail(current.email);
  });

  readonly dirty = computed(() => {
    const current = this.profile();
    const snap = this.formSnapshot();
    if (!current) {
      return false;
    }
    const nameChanged = snap.displayName.trim() !== current.displayName;
    const emailChanged = normalizeEmail(snap.email) !== normalizeEmail(current.email);
    return nameChanged || emailChanged;
  });

  ngOnInit(): void {
    this.form.controls.email.valueChanges.subscribe(() => this.syncPasswordValidator());
    this.load();
  }

  roleLabel(role: string): string {
    if (role === 'ADMIN') {
      return this.translate.instant('profile.roleAdmin');
    }
    if (role === 'MEMBER') {
      return this.translate.instant('profile.roleMember');
    }
    return role;
  }

  statusLabel(status: string): string {
    if (status === 'ACTIVE') {
      return this.translate.instant('profile.statusActive');
    }
    if (status === 'DISABLED') {
      return this.translate.instant('profile.statusDisabled');
    }
    return status;
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    this.syncPasswordValidator();
    if (this.form.invalid || this.saving() || !this.dirty()) {
      this.form.markAllAsTouched();
      return;
    }

    const current = this.profile();
    if (!current) {
      return;
    }

    const raw = this.form.getRawValue();
    const emailChanged = normalizeEmail(raw.email) !== normalizeEmail(current.email);
    const body = {
      displayName: raw.displayName.trim(),
      email: raw.email.trim(),
      ...(emailChanged ? { currentPassword: raw.currentPassword } : {}),
    };

    this.saving.set(true);
    this.api.update(body).subscribe({
      next: (updated) => {
        this.saving.set(false);
        if (emailChanged) {
          this.auth.clearLocalSession().subscribe({
            next: () =>
              void this.router.navigateByUrl('/login', {
                state: { emailChanged: true },
              }),
            error: () =>
              void this.router.navigateByUrl('/login', {
                state: { emailChanged: true },
              }),
          });
          return;
        }
        this.applyProfile(updated);
        this.auth.applyUser({
          id: updated.id,
          email: updated.email,
          displayName: updated.displayName,
          role: updated.role,
          mustChangePassword: updated.mustChangePassword,
        });
        this.success.set(this.translate.instant('profile.saveSuccess'));
      },
      error: (err: { status?: number }) => {
        this.saving.set(false);
        if (err.status === 401) {
          this.error.set(this.translate.instant('profile.passwordWrong'));
          return;
        }
        if (err.status === 409) {
          this.error.set(this.translate.instant('profile.emailTaken'));
          return;
        }
        this.error.set(this.translate.instant('profile.saveError'));
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.get().subscribe({
      next: (profile) => {
        this.applyProfile(profile);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadError.set(this.translate.instant('profile.loadError'));
      },
    });
  }

  private applyProfile(profile: Profile): void {
    this.profile.set(profile);
    this.form.reset({
      displayName: profile.displayName,
      email: profile.email,
      currentPassword: '',
    });
    this.syncPasswordValidator();
  }

  private syncPasswordValidator(): void {
    const control = this.form.controls.currentPassword;
    if (this.emailChanging()) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setValue('', { emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
  }
}
