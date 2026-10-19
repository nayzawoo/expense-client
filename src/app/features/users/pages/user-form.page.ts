import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { IconComponent } from '../../../shared/icons/icon.component';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';
import { UiSkeletonComponent } from '../../../shared/ui/ui-skeleton.component';
import { UserApi } from '../data/user.api';
import { HouseholdUser, UserRole } from '../data/user.models';

@Component({
  selector: 'app-user-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    IconComponent,
    UiButtonComponent,
    UiAlertComponent,
    UiSkeletonComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start gap-3">
        <a
          routerLink="/users"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
          [attr.aria-label]="'users.back' | translate"
        >
          <app-icon name="arrow-left" />
        </a>
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ (isEdit() ? 'users.editTitle' : 'users.createTitle') | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            {{ (isEdit() ? 'users.editSubtitle' : 'users.createSubtitle') | translate }}
          </p>
        </div>
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="warn">{{ 'users.adminOnly' | translate }}</app-ui-alert>
      } @else if (loading()) {
        <app-ui-skeleton height="16rem" width="100%" />
      } @else {
        <form
          class="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 p-5"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          @if (isSelf()) {
            <app-ui-alert severity="info">{{ 'users.selfHint' | translate }}</app-ui-alert>
          }
          @if (error()) {
            <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
          }

          <div class="flex flex-col gap-1.5">
            <label for="user-display-name" class="text-sm font-medium text-surface-800">
              {{ 'users.displayName' | translate }}
            </label>
            <input
              id="user-display-name"
              class="ui-input"
              formControlName="displayName"
              autocomplete="name"
            />
            @if (form.controls.displayName.touched && form.controls.displayName.invalid) {
              <span class="text-xs text-red-600">{{ 'users.displayNameRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="user-email" class="text-sm font-medium text-surface-800">
              {{ 'users.email' | translate }}
            </label>
            <input
              id="user-email"
              class="ui-input"
              type="email"
              formControlName="email"
              autocomplete="username"
            />
            @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
              <span class="text-xs text-red-600">{{ 'users.emailRequired' | translate }}</span>
            }
            @if (form.controls.email.touched && form.controls.email.errors?.['email']) {
              <span class="text-xs text-red-600">{{ 'users.emailInvalid' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="user-role" class="text-sm font-medium text-surface-800">
              {{ 'users.role' | translate }}
            </label>
            <select id="user-role" class="ui-input" formControlName="role">
              @for (opt of roleOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.labelKey | translate }}</option>
              }
            </select>
          </div>

          @if (!isEdit()) {
            <div class="flex flex-col gap-1.5">
              <label for="user-password" class="text-sm font-medium text-surface-800">
                {{ 'users.password' | translate }}
              </label>
              <input
                id="user-password"
                class="ui-input"
                type="password"
                formControlName="temporaryPassword"
                autocomplete="new-password"
              />
              @if (
                form.controls.temporaryPassword.touched &&
                form.controls.temporaryPassword.errors?.['required']
              ) {
                <span class="text-xs text-red-600">{{ 'users.passwordRequired' | translate }}</span>
              }
              @if (
                form.controls.temporaryPassword.touched &&
                form.controls.temporaryPassword.errors?.['minlength']
              ) {
                <span class="text-xs text-red-600">{{ 'users.passwordTooShort' | translate }}</span>
              }
            </div>
            <div class="flex flex-col gap-1.5">
              <label for="user-confirm" class="text-sm font-medium text-surface-800">
                {{ 'users.confirmPassword' | translate }}
              </label>
              <input
                id="user-confirm"
                class="ui-input"
                type="password"
                formControlName="confirmPassword"
                autocomplete="new-password"
              />
              @if (form.touched && passwordMismatch()) {
                <span class="text-xs text-red-600">{{ 'users.passwordMismatch' | translate }}</span>
              }
            </div>
          }

          @if (isEdit() && loaded(); as u) {
            <dl class="grid grid-cols-2 gap-3 rounded-lg bg-surface-50 px-3 py-3 text-sm">
              <div>
                <dt class="text-surface-500">{{ 'users.status' | translate }}</dt>
                <dd class="font-medium text-surface-800">
                  {{
                    (u.status === 'ACTIVE' ? 'users.statusActive' : 'users.statusDisabled')
                      | translate
                  }}
                </dd>
              </div>
              <div>
                <dt class="text-surface-500">{{ 'users.password' | translate }}</dt>
                <dd class="font-medium text-surface-800">
                  {{
                    (u.mustChangePassword ? 'users.mustChangePassword' : 'users.passwordSet')
                      | translate
                  }}
                </dd>
              </div>
            </dl>
          }

          <app-ui-button
            type="submit"
            [block]="true"
            [disabled]="saving() || form.invalid || passwordMismatch()"
            [loading]="saving()"
          >
            {{
              saving()
                ? ('users.saving' | translate)
                : ((isEdit() ? 'users.save' : 'users.create') | translate)
            }}
          </app-ui-button>
        </form>
      }
    </div>
  `,
})
export class UserFormPage implements OnInit {
  private readonly api = inject(UserApi);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly userId = signal<string | null>(null);
  readonly loaded = signal<HouseholdUser | null>(null);
  readonly isEdit = computed(() => this.userId() !== null);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  readonly isSelf = computed(() => {
    const id = this.userId();
    return id != null && this.auth.user()?.id === id;
  });

  readonly roleOptions: Array<{ value: UserRole; labelKey: string }> = [
    { value: 'MEMBER', labelKey: 'users.roleMember' },
    { value: 'ADMIN', labelKey: 'users.roleAdmin' },
  ];

  readonly form = this.fb.nonNullable.group({
    displayName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['MEMBER' as UserRole, [Validators.required]],
    temporaryPassword: [''],
    confirmPassword: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    void this.bootstrap(id);
  }

  passwordMismatch(): boolean {
    if (this.isEdit()) {
      return false;
    }
    const { temporaryPassword, confirmPassword } = this.form.getRawValue();
    return confirmPassword.length > 0 && temporaryPassword !== confirmPassword;
  }

  private async bootstrap(id: string | null): Promise<void> {
    if (!this.isAdmin()) {
      return;
    }

    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
    } catch {
      this.error.set(this.translate.instant('users.loadError'));
      return;
    }

    if (!id) {
      this.form.controls.temporaryPassword.setValidators([
        Validators.required,
        Validators.minLength(8),
      ]);
      this.form.controls.confirmPassword.setValidators([Validators.required]);
      this.form.controls.temporaryPassword.updateValueAndValidity();
      this.form.controls.confirmPassword.updateValueAndValidity();
      return;
    }

    this.userId.set(id);
    this.loading.set(true);
    try {
      const user = await firstValueFrom(this.api.get(id));
      this.patch(user);
    } catch {
      this.error.set(this.translate.instant('users.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  private patch(user: HouseholdUser): void {
    this.loaded.set(user);
    this.form.patchValue({
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    });
    if (this.isSelf()) {
      this.form.controls.email.disable();
      this.form.controls.role.disable();
    }
  }

  submit(): void {
    if (!this.isAdmin() || this.form.invalid || this.passwordMismatch() || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);

    if (!this.isEdit()) {
      this.api
        .create({
          displayName: raw.displayName.trim(),
          email: raw.email.trim(),
          temporaryPassword: raw.temporaryPassword,
          role: raw.role,
        })
        .subscribe({
          next: () => {
            this.saving.set(false);
            void this.router.navigateByUrl('/users');
          },
          error: (err: unknown) => {
            this.saving.set(false);
            this.error.set(this.mapSaveError(err));
          },
        });
      return;
    }

    const original = this.loaded();
    const payload: {
      displayName?: string;
      email?: string;
      role?: UserRole;
    } = {
      displayName: raw.displayName.trim(),
    };
    if (!this.isSelf()) {
      if (original && raw.email.trim().toLowerCase() !== original.email.toLowerCase()) {
        payload.email = raw.email.trim();
      }
      if (original && raw.role !== original.role) {
        payload.role = raw.role;
      }
    }

    this.api.update(this.userId()!, payload).subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/users');
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(this.mapSaveError(err, !!payload.email, !!payload.role));
      },
    });
  }

  private mapSaveError(err: unknown, emailChange = false, roleChange = false): string {
    const status = (err as { status?: number })?.status;
    if (status === 409) {
      if (emailChange) {
        return this.translate.instant('users.emailTaken');
      }
      if (roleChange || this.isEdit()) {
        return this.translate.instant('users.lastAdminError');
      }
      return this.translate.instant('users.emailTaken');
    }
    if (status === 403) {
      return this.translate.instant('users.forbiddenError');
    }
    return this.translate.instant('users.saveError');
  }
}
