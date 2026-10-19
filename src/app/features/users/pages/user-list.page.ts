import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { IconComponent } from '../../../shared/icons/icon.component';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiBadgeComponent } from '../../../shared/ui/ui-badge.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';
import { UiDialogComponent } from '../../../shared/ui/ui-dialog.component';
import { UiSkeletonComponent } from '../../../shared/ui/ui-skeleton.component';
import { UserApi } from '../data/user.api';
import { HouseholdUser, UserRole, UserStatus } from '../data/user.models';

@Component({
  selector: 'app-user-list-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    IconComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiSkeletonComponent,
    UiAlertComponent,
    UiDialogComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ 'users.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            {{ 'users.subtitle' | translate }}
          </p>
        </div>
        @if (isAdmin()) {
          <a
            routerLink="new"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-contrast no-underline hover:bg-primary-600"
          >
            <app-icon name="plus" />
            {{ 'users.add' | translate }}
          </a>
        }
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="info">{{ 'users.adminOnly' | translate }}</app-ui-alert>
      } @else {
        <div
          class="inline-flex flex-wrap gap-1 rounded-lg border border-surface-200 bg-surface-0 p-1"
          role="group"
        >
          @for (opt of filterOptions(); track opt.value) {
            <button
              type="button"
              class="rounded-md px-3 py-1.5 text-sm font-semibold transition-colors"
              [class.bg-teal-700]="statusFilter() === opt.value"
              [class.text-white]="statusFilter() === opt.value"
              [class.text-surface-600]="statusFilter() !== opt.value"
              [attr.aria-pressed]="statusFilter() === opt.value"
              (click)="setFilter(opt.value)"
            >
              {{ opt.label }}
            </button>
          }
        </div>

        @if (flash()) {
          <app-ui-alert severity="success">{{ flash() }}</app-ui-alert>
        }

        @if (loading()) {
          <div class="flex flex-col gap-3">
            <app-ui-skeleton height="2.5rem" />
            <app-ui-skeleton height="2.5rem" />
            <app-ui-skeleton height="2.5rem" />
          </div>
        } @else if (error()) {
          <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
        } @else {
          <div class="flex flex-col gap-3 md:hidden">
            @if (rows().length === 0) {
              <p class="py-8 text-center text-sm text-surface-500">
                {{ 'users.empty' | translate }}
              </p>
            }
            @for (u of rows(); track u.id) {
              <article
                class="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700/10 text-sm font-semibold text-teal-800"
                    >{{ u.displayName.slice(0, 1) }}</span
                  >
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium text-surface-900">
                      {{ u.displayName }}
                      @if (isSelf(u)) {
                        <span class="text-xs font-normal text-surface-500"
                          >({{ 'users.you' | translate }})</span
                        >
                      }
                    </p>
                    <p class="truncate text-xs text-surface-500">{{ u.email }}</p>
                    <p class="text-xs text-surface-500">
                      {{ roleLabel(u.role) }}
                      @if (u.mustChangePassword) {
                        · {{ 'users.mustChangePassword' | translate }}
                      }
                    </p>
                  </div>
                  <app-ui-badge
                    [value]="statusLabel(u.status)"
                    [severity]="u.status === 'ACTIVE' ? 'success' : 'secondary'"
                  />
                </div>
                <div class="flex flex-wrap gap-1">
                  <a
                    [routerLink]="[u.id, 'edit']"
                    class="inline-flex h-9 items-center gap-1.5 rounded-md border border-surface-200 px-2.5 text-sm text-surface-700 no-underline"
                  >
                    <app-icon name="pencil" />
                    {{ 'users.editTitle' | translate }}
                  </a>
                  @if (!isSelf(u)) {
                    <app-ui-button
                      variant="ghost"
                      size="sm"
                      [title]="'users.resetPassword' | translate"
                      [ariaLabel]="'users.resetPassword' | translate"
                      (clicked)="openReset(u)"
                    >
                      <app-icon name="key" />
                    </app-ui-button>
                    <app-ui-button
                      variant="ghost"
                      size="sm"
                      [title]="
                        (u.status === 'ACTIVE' ? 'users.disable' : 'users.enable') | translate
                      "
                      [ariaLabel]="
                        (u.status === 'ACTIVE' ? 'users.disable' : 'users.enable') | translate
                      "
                      (clicked)="toggleStatus(u)"
                    >
                      <app-icon [name]="u.status === 'ACTIVE' ? 'archive' : 'restore'" />
                    </app-ui-button>
                  }
                </div>
              </article>
            }
          </div>

          <div
            class="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-0 md:block"
          >
            <table class="min-w-[48rem] w-full border-collapse text-left text-sm">
              <thead
                class="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wide text-surface-500"
              >
                <tr>
                  <th class="px-4 py-3 font-semibold">{{ 'users.displayName' | translate }}</th>
                  <th class="px-4 py-3 font-semibold">{{ 'users.email' | translate }}</th>
                  <th class="px-4 py-3 font-semibold">{{ 'users.role' | translate }}</th>
                  <th class="px-4 py-3 font-semibold">{{ 'users.status' | translate }}</th>
                  <th class="px-4 py-3 text-right font-semibold">
                    {{ 'users.actions' | translate }}
                  </th>
                </tr>
              </thead>
              <tbody>
                @if (rows().length === 0) {
                  <tr>
                    <td colspan="5" class="px-4 py-8 text-center text-surface-500">
                      {{ 'users.empty' | translate }}
                    </td>
                  </tr>
                }
                @for (u of rows(); track u.id) {
                  <tr class="border-b border-surface-100 last:border-0">
                    <td class="px-4 py-3 font-medium">
                      {{ u.displayName }}
                      @if (isSelf(u)) {
                        <span class="ml-1 text-xs font-normal text-surface-500"
                          >({{ 'users.you' | translate }})</span
                        >
                      }
                      @if (u.mustChangePassword) {
                        <span class="mt-0.5 block text-xs font-normal text-amber-700">
                          {{ 'users.mustChangePassword' | translate }}
                        </span>
                      }
                    </td>
                    <td class="px-4 py-3 text-surface-700">{{ u.email }}</td>
                    <td class="px-4 py-3 text-surface-700">{{ roleLabel(u.role) }}</td>
                    <td class="px-4 py-3">
                      <app-ui-badge
                        [value]="statusLabel(u.status)"
                        [severity]="u.status === 'ACTIVE' ? 'success' : 'secondary'"
                      />
                    </td>
                    <td class="px-4 py-3 text-right">
                      <div class="inline-flex gap-1">
                        <a
                          [routerLink]="[u.id, 'edit']"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-600 no-underline hover:bg-surface-100"
                          [attr.aria-label]="'users.editTitle' | translate"
                        >
                          <app-icon name="pencil" />
                        </a>
                        @if (!isSelf(u)) {
                          <app-ui-button
                            variant="ghost"
                            size="sm"
                            [title]="'users.resetPassword' | translate"
                            [ariaLabel]="'users.resetPassword' | translate"
                            (clicked)="openReset(u)"
                          >
                            <app-icon name="key" />
                          </app-ui-button>
                          <app-ui-button
                            variant="ghost"
                            size="sm"
                            [title]="
                              (u.status === 'ACTIVE' ? 'users.disable' : 'users.enable')
                                | translate
                            "
                            [ariaLabel]="
                              (u.status === 'ACTIVE' ? 'users.disable' : 'users.enable')
                                | translate
                            "
                            (clicked)="toggleStatus(u)"
                          >
                            <app-icon [name]="u.status === 'ACTIVE' ? 'archive' : 'restore'" />
                          </app-ui-button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </div>

    <app-ui-dialog
      [open]="resetTarget() !== null"
      [title]="'users.resetPasswordTitle' | translate"
      (closed)="closeReset()"
    >
      <form class="flex flex-col gap-3" [formGroup]="resetForm" (ngSubmit)="submitReset()">
        <p class="text-sm text-surface-600">{{ 'users.resetPasswordHint' | translate }}</p>
        @if (resetError()) {
          <app-ui-alert severity="error">{{ resetError() }}</app-ui-alert>
        }
        <div class="flex flex-col gap-1.5">
          <label for="reset-password" class="text-sm font-medium text-surface-800">
            {{ 'users.password' | translate }}
          </label>
          <input
            id="reset-password"
            class="ui-input"
            type="password"
            formControlName="temporaryPassword"
            autocomplete="new-password"
          />
          @if (
            resetForm.controls.temporaryPassword.touched &&
            resetForm.controls.temporaryPassword.errors?.['required']
          ) {
            <span class="text-xs text-red-600">{{ 'users.passwordRequired' | translate }}</span>
          }
          @if (
            resetForm.controls.temporaryPassword.touched &&
            resetForm.controls.temporaryPassword.errors?.['minlength']
          ) {
            <span class="text-xs text-red-600">{{ 'users.passwordTooShort' | translate }}</span>
          }
        </div>
        <div class="flex flex-col gap-1.5">
          <label for="reset-confirm" class="text-sm font-medium text-surface-800">
            {{ 'users.confirmPassword' | translate }}
          </label>
          <input
            id="reset-confirm"
            class="ui-input"
            type="password"
            formControlName="confirmPassword"
            autocomplete="new-password"
          />
          @if (resetForm.touched && passwordMismatch()) {
            <span class="text-xs text-red-600">{{ 'users.passwordMismatch' | translate }}</span>
          }
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <app-ui-button type="button" variant="secondary" (clicked)="closeReset()">
            {{ 'users.back' | translate }}
          </app-ui-button>
          <app-ui-button
            type="submit"
            [loading]="resetting()"
            [disabled]="resetting() || resetForm.invalid || passwordMismatch()"
          >
            {{ 'users.resetPasswordSubmit' | translate }}
          </app-ui-button>
        </div>
      </form>
    </app-ui-dialog>
  `,
})
export class UserListPage implements OnInit {
  private readonly api = inject(UserApi);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly flash = signal<string | null>(null);
  readonly allRows = signal<HouseholdUser[]>([]);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  readonly resetTarget = signal<HouseholdUser | null>(null);
  readonly resetting = signal(false);
  readonly resetError = signal<string | null>(null);

  readonly statusFilter = signal<UserStatus | 'ALL'>('ACTIVE');

  readonly filterOptions = computed(() => [
    { label: this.translate.instant('users.filterActive'), value: 'ACTIVE' as const },
    { label: this.translate.instant('users.filterDisabled'), value: 'DISABLED' as const },
    { label: this.translate.instant('users.filterAll'), value: 'ALL' as const },
  ]);

  readonly rows = computed(() => {
    const list = this.allRows();
    const filter = this.statusFilter();
    if (filter === 'ALL') {
      return list;
    }
    return list.filter((u) => u.status === filter);
  });

  readonly resetForm = this.fb.nonNullable.group({
    temporaryPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    void this.ensureHouseholdThenReload();
  }

  isSelf(user: HouseholdUser): boolean {
    return this.auth.user()?.id === user.id;
  }

  roleLabel(role: UserRole): string {
    return this.translate.instant(role === 'ADMIN' ? 'users.roleAdmin' : 'users.roleMember');
  }

  statusLabel(status: UserStatus): string {
    return this.translate.instant(
      status === 'ACTIVE' ? 'users.statusActive' : 'users.statusDisabled',
    );
  }

  passwordMismatch(): boolean {
    const { temporaryPassword, confirmPassword } = this.resetForm.getRawValue();
    return confirmPassword.length > 0 && temporaryPassword !== confirmPassword;
  }

  setFilter(value: UserStatus | 'ALL'): void {
    this.statusFilter.set(value);
  }

  async ensureHouseholdThenReload(): Promise<void> {
    if (!this.isAdmin()) {
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
      await this.reload();
    } catch {
      this.error.set(this.translate.instant('users.loadError'));
      this.loading.set(false);
    }
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.api.list());
      this.allRows.set(list);
    } catch {
      this.error.set(this.translate.instant('users.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(user: HouseholdUser): Promise<void> {
    if (!this.isAdmin() || this.isSelf(user)) {
      return;
    }
    const next: UserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    if (next === 'DISABLED' && !confirm(this.translate.instant('users.confirmDisable'))) {
      return;
    }
    try {
      await firstValueFrom(this.api.update(user.id, { status: next }));
      await this.reload();
    } catch (err: unknown) {
      this.error.set(this.mapStatusError(err));
    }
  }

  openReset(user: HouseholdUser): void {
    if (this.isSelf(user)) {
      return;
    }
    this.resetTarget.set(user);
    this.resetError.set(null);
    this.resetForm.reset({ temporaryPassword: '', confirmPassword: '' });
  }

  closeReset(): void {
    this.resetTarget.set(null);
    this.resetting.set(false);
    this.resetError.set(null);
  }

  submitReset(): void {
    const target = this.resetTarget();
    if (!target || this.resetForm.invalid || this.passwordMismatch() || this.resetting()) {
      this.resetForm.markAllAsTouched();
      return;
    }
    const password = this.resetForm.controls.temporaryPassword.value;
    this.resetting.set(true);
    this.resetError.set(null);
    this.api.assignTemporaryPassword(target.id, { temporaryPassword: password }).subscribe({
      next: () => {
        this.resetting.set(false);
        this.closeReset();
        this.flash.set(this.translate.instant('users.resetPasswordSuccess'));
        void this.reload();
      },
      error: (err: unknown) => {
        this.resetting.set(false);
        this.resetError.set(this.mapResetError(err));
      },
    });
  }

  private mapStatusError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 409) {
      return this.translate.instant('users.lastAdminError');
    }
    if (status === 403) {
      return this.translate.instant('users.forbiddenError');
    }
    return this.translate.instant('users.statusError');
  }

  private mapResetError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    if (status === 403) {
      return this.translate.instant('users.forbiddenError');
    }
    return this.translate.instant('users.resetError');
  }
}
