import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core';
import { MoneyPipe, UiAlertComponent, UiButtonComponent, UiSpinnerComponent } from '../../../shared';
import { AdjustmentApi } from '../data/adjustment.api';
import type { AccountOption } from '../data/adjustment.models';

@Component({
  selector: 'app-adjustment-reconcile-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    MoneyPipe,
    UiAlertComponent,
    UiButtonComponent,
    UiSpinnerComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-lg flex-col">
      <header class="border-b border-surface-200 px-4 py-4 md:px-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">{{ 'adjustments.reconcileTitle' | translate }}</h1>
            <p class="text-sm text-surface-500">
              {{ 'adjustments.reconcileSubtitle' | translate }}
            </p>
          </div>
          <a routerLink=".." class="text-sm text-surface-500 hover:text-surface-900">
            {{ 'adjustments.backToList' | translate }}
          </a>
        </div>
      </header>

      <div class="p-4 md:p-6">
        @if (!isAdmin()) {
          <app-ui-alert severity="info">{{ 'adjustments.adminOnly' | translate }}</app-ui-alert>
        } @else if (loading()) {
          <div class="flex justify-center py-16"><app-ui-spinner /></div>
        } @else if (loadError()) {
          <div class="flex flex-col gap-3">
            <app-ui-alert severity="error">{{ loadError() }}</app-ui-alert>
            <app-ui-button (clicked)="load()">{{ 'adjustments.retry' | translate }}</app-ui-button>
          </div>
        } @else {
          <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
            @if (error()) {
              <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
            }
            @if (success()) {
              <app-ui-alert severity="success">{{ success() }}</app-ui-alert>
            }

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              {{ 'adjustments.account' | translate }}
              <select class="ui-input" formControlName="accountId">
                @for (option of accountOptions(); track option.id) {
                  <option [value]="option.id">{{ option.name }}</option>
                }
              </select>
            </label>

            @if (selectedAccount(); as account) {
              <div
                class="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm"
              >
                <p class="font-medium text-surface-700">
                  {{ 'adjustments.currentBalance' | translate }}
                </p>
                <p class="mt-1 text-lg font-semibold tabular-nums text-surface-900">
                  {{ account.currentBalance | money: account.currency }}
                </p>
              </div>
            }

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              {{ 'adjustments.actualBalance' | translate }}
              <input
                class="ui-input"
                formControlName="actualBalance"
                inputmode="numeric"
                autocomplete="off"
                placeholder="985"
              />
              @if (form.controls.actualBalance.touched && form.controls.actualBalance.invalid) {
                <span class="text-xs text-rose-700">
                  {{ 'adjustments.invalidBalance' | translate }}
                </span>
              }
            </label>

            @if (deltaPreview(); as delta) {
              <div class="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm">
                <p class="font-medium text-sky-900">
                  {{ 'adjustments.expectedDelta' | translate }}
                </p>
                <p
                  class="mt-1 text-lg font-semibold tabular-nums"
                  [class.text-rose-700]="delta.startsWith('-')"
                  [class.text-teal-800]="!delta.startsWith('-')"
                >
                  {{ delta | money: selectedAccount()?.currency ?? 'MMK' }}
                </p>
              </div>
            }

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              {{ 'adjustments.reason' | translate }}
              <textarea
                class="ui-input"
                formControlName="reason"
                rows="3"
                maxlength="500"
              ></textarea>
              @if (form.controls.reason.touched && form.controls.reason.invalid) {
                <span class="text-xs text-rose-700">
                  {{ 'adjustments.reasonRequired' | translate }}
                </span>
              }
            </label>

            <div class="flex flex-wrap gap-2 pt-2">
              <app-ui-button type="submit" [loading]="saving()" [disabled]="form.invalid || saving()">
                {{ 'adjustments.save' | translate }}
              </app-ui-button>
              <app-ui-button type="button" variant="secondary" (clicked)="goList()">
                {{ 'adjustments.cancel' | translate }}
              </app-ui-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class AdjustmentReconcilePage implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AdjustmentApi);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private formSub: Subscription | null = null;

  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly accounts = signal<AccountOption[]>([]);
  readonly accountId = signal('');
  readonly actualBalance = signal('');

  readonly form = this.fb.nonNullable.group({
    accountId: ['', Validators.required],
    actualBalance: ['', [Validators.required, Validators.pattern(/^-?\d+$/)]],
    reason: ['', [Validators.required, Validators.maxLength(500), Validators.pattern(/^[^\r\n]+$/)]],
  });

  readonly accountOptions = computed(() =>
    this.accounts().filter((a) => a.status === 'ACTIVE'),
  );

  readonly selectedAccount = computed(() => {
    const id = this.accountId();
    return this.accountOptions().find((a) => a.id === id) ?? null;
  });

  readonly deltaPreview = computed(() => {
    const account = this.selectedAccount();
    const raw = this.actualBalance().trim();
    if (!account || !/^-?\d+$/.test(raw)) {
      return null;
    }
    try {
      const actual = BigInt(raw);
      const book = BigInt(account.currentBalance.replace(/[^\d-]/g, '') || '0');
      return (actual - book).toString();
    } catch {
      return null;
    }
  });

  ngOnInit(): void {
    this.formSub = this.form.valueChanges.subscribe((value) => {
      this.accountId.set(value.accountId ?? '');
      this.actualBalance.set(value.actualBalance ?? '');
      this.error.set(null);
    });
    if (!this.isAdmin()) {
      this.loading.set(false);
      return;
    }
    this.load();
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.listAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        const active = accounts.filter((a) => a.status === 'ACTIVE');
        const accountId = active[0]?.id ?? '';
        const actualBalance = active[0]?.currentBalance ?? '';
        this.form.patchValue({ accountId, actualBalance });
        this.accountId.set(accountId);
        this.actualBalance.set(actualBalance);
        this.loading.set(false);
      },
      error: (err: { status?: number }) => {
        this.loadError.set(
          err?.status === 403
            ? this.translate.instant('adjustments.forbiddenError')
            : this.translate.instant('adjustments.loadError'),
        );
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const account = this.selectedAccount();
    if (!account) {
      this.error.set(this.translate.instant('adjustments.selectAccount'));
      return;
    }
    const raw = this.form.getRawValue();
    const reason = raw.reason.trim();
    if (!reason || /[\r\n]/.test(reason) || reason.length > 500) {
      this.error.set(this.translate.instant('adjustments.reasonRequired'));
      return;
    }
    const delta = this.deltaPreview();
    if (delta === '0') {
      this.error.set(this.translate.instant('adjustments.sameBalance'));
      return;
    }

    this.saving.set(true);
    this.api
      .reconcile(account.id, {
        actualBalance: raw.actualBalance.trim(),
        expectedBalanceVersion: account.balanceVersion,
        reason,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set(this.translate.instant('adjustments.createSuccess'));
          this.form.patchValue({ reason: '' });
          this.form.markAsPristine();
          this.form.markAsUntouched();
          // Refresh book balances / balanceVersion for the next reconcile.
          this.api.listAccounts().subscribe({
            next: (accounts) => {
              this.accounts.set(accounts);
              const refreshed = accounts.find((a) => a.id === account.id);
              if (refreshed) {
                this.form.patchValue({
                  accountId: refreshed.id,
                  actualBalance: refreshed.currentBalance,
                });
                this.accountId.set(refreshed.id);
                this.actualBalance.set(refreshed.currentBalance);
              }
            },
          });
        },
        error: (err: {
          status?: number;
          error?: { message?: string; detail?: string; title?: string };
        }) => {
          this.saving.set(false);
          this.error.set(this.mapError(err));
        },
      });
  }

  goList(): void {
    void this.router.navigateByUrl('/adjustments');
  }

  private mapError(err: {
    status?: number;
    error?: { message?: string; detail?: string; title?: string };
  }): string {
    const detail = (err.error?.detail || err.error?.message || err.error?.title || '').toString();
    if (err.status === 403) {
      return this.translate.instant('adjustments.forbiddenError');
    }
    if (err.status === 409 || detail.includes('BALANCE_CHANGED')) {
      return this.translate.instant('adjustments.balanceChanged');
    }
    if (detail.includes('ACCOUNT_NOT_ACTIVE')) {
      return this.translate.instant('adjustments.accountNotActive');
    }
    if (detail.includes('ZERO_DELTA')) {
      return this.translate.instant('adjustments.sameBalance');
    }
    if (detail.includes('ADJUSTMENT_OUT_OF_RANGE') || detail.includes('MONEY_OUT_OF_RANGE')) {
      return this.translate.instant('adjustments.outOfRange');
    }
    return detail || this.translate.instant('adjustments.saveError');
  }
}
