import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import {
  IconComponent,
  MoneyPipe,
  UiAlertComponent,
  UiButtonComponent,
  UiSkeletonComponent,
} from '../../../shared';
import { AccountApi } from '../data/account.api';
import { Account, LedgerResponse } from '../data/account.models';

const PAGE_SIZE = 30;

@Component({
  selector: 'app-account-ledger-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    MoneyPipe,
    IconComponent,
    UiAlertComponent,
    UiButtonComponent,
    UiSkeletonComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <a
            routerLink="/accounts"
            class="mb-2 inline-flex items-center gap-1 text-sm font-medium text-surface-600 no-underline hover:text-surface-900"
          >
            <app-icon name="arrow-left" />
            {{ 'accounts.back' | translate }}
          </a>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ 'accounts.ledgerTitle' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            @if (account(); as a) {
              {{ a.name }} · {{ 'accounts.ledgerSubtitle' | translate }}
            } @else {
              {{ 'accounts.ledgerSubtitle' | translate }}
            }
          </p>
        </div>
      </header>

      <form
        class="flex flex-wrap items-end gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4"
        (ngSubmit)="applyFilters()"
      >
        <label class="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          <span class="font-medium text-surface-700">{{ 'accounts.from' | translate }}</span>
          <input class="ui-input" type="date" [(ngModel)]="fromInput" name="from" />
        </label>
        <label class="flex min-w-40 flex-1 flex-col gap-1 text-sm">
          <span class="font-medium text-surface-700">{{ 'accounts.to' | translate }}</span>
          <input class="ui-input" type="date" [(ngModel)]="toInput" name="to" />
        </label>
        <app-ui-button type="submit" [loading]="loading()">
          {{ 'accounts.apply' | translate }}
        </app-ui-button>
      </form>

      @if (rangeError()) {
        <app-ui-alert severity="error">{{ rangeError() }}</app-ui-alert>
      }

      @if (loading() && !ledger()) {
        <div class="flex flex-col gap-3">
          <app-ui-skeleton height="4rem" />
          <app-ui-skeleton height="4rem" />
          <app-ui-skeleton height="4rem" />
        </div>
      } @else if (error()) {
        <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
      } @else if (ledger(); as snap) {
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-surface-200 bg-surface-0 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-surface-500">
              {{ 'accounts.openingBalance' | translate }}
            </p>
            <p class="mt-1 text-lg font-semibold tabular-nums text-surface-900">
              {{ snap.openingBalance | money: snap.currency }}
            </p>
            <p class="mt-1 text-xs text-surface-500">{{ snap.from }}</p>
          </div>
          <div class="rounded-xl border border-surface-200 bg-surface-0 p-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-surface-500">
              {{ 'accounts.closingBalance' | translate }}
            </p>
            <p class="mt-1 text-lg font-semibold tabular-nums text-surface-900">
              {{ snap.closingBalance | money: snap.currency }}
            </p>
            <p class="mt-1 text-xs text-surface-500">{{ snap.to }}</p>
          </div>
        </div>

        @if (snap.items.length === 0) {
          <p class="py-10 text-center text-sm text-surface-500">
            {{ 'accounts.emptyLedger' | translate }}
          </p>
        } @else {
          <div class="flex flex-col gap-3 md:hidden">
            @for (row of snap.items; track row.postingId) {
              <article class="rounded-xl border border-surface-200 bg-surface-0 p-4">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-semibold text-surface-900">{{ row.kind }} · {{ row.role }}</p>
                    <p class="text-xs text-surface-500">{{ row.effectiveDate }}</p>
                  </div>
                  <p
                    class="shrink-0 text-right text-base font-semibold tabular-nums"
                    [class.text-rose-700]="row.signedAmount.startsWith('-')"
                    [class.text-emerald-700]="!row.signedAmount.startsWith('-')"
                  >
                    {{ row.signedAmount | money: snap.currency }}
                  </p>
                </div>
                <p class="mt-2 text-xs text-surface-500">
                  {{ 'accounts.running' | translate }}:
                  {{ row.runningBalance | money: snap.currency }}
                </p>
                <p class="mt-1 text-xs text-surface-500">
                  {{ 'accounts.actor' | translate }}: {{ row.actor.displayName }}
                </p>
              </article>
            }
          </div>

          <div class="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-0 md:block">
            <table class="min-w-[48rem] w-full border-collapse text-left text-sm">
              <thead
                class="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wide text-surface-500"
              >
                <tr>
                  <th class="px-4 py-3 font-semibold">{{ 'accounts.date' | translate }}</th>
                  <th class="px-4 py-3 font-semibold">{{ 'accounts.kind' | translate }}</th>
                  <th class="px-4 py-3 font-semibold">{{ 'accounts.role' | translate }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ 'accounts.amount' | translate }}</th>
                  <th class="px-4 py-3 text-right font-semibold">{{ 'accounts.running' | translate }}</th>
                  <th class="px-4 py-3 font-semibold">{{ 'accounts.actor' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (row of snap.items; track row.postingId) {
                  <tr class="border-b border-surface-100 last:border-0">
                    <td class="px-4 py-3 tabular-nums">{{ row.effectiveDate }}</td>
                    <td class="px-4 py-3">{{ row.kind }}</td>
                    <td class="px-4 py-3">{{ row.role }}</td>
                    <td
                      class="px-4 py-3 text-right font-semibold tabular-nums"
                      [class.text-rose-700]="row.signedAmount.startsWith('-')"
                      [class.text-emerald-700]="!row.signedAmount.startsWith('-')"
                    >
                      {{ row.signedAmount | money: snap.currency }}
                    </td>
                    <td class="px-4 py-3 text-right tabular-nums">
                      {{ row.runningBalance | money: snap.currency }}
                    </td>
                    <td class="px-4 py-3">{{ row.actor.displayName }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-surface-600">
            {{ 'accounts.totalEntries' | translate: { count: snap.totalElements } }}
            ·
            {{ 'accounts.pageOf' | translate: { page: displayPage(), total: pageTotal() } }}
          </p>
          <div class="flex gap-2">
            <app-ui-button
              variant="secondary"
              size="sm"
              [disabled]="!canPrev() || loading()"
              (clicked)="goPrev()"
            >
              {{ 'accounts.prev' | translate }}
            </app-ui-button>
            <app-ui-button
              variant="secondary"
              size="sm"
              [disabled]="!canNext() || loading()"
              (clicked)="goNext()"
            >
              {{ 'accounts.next' | translate }}
            </app-ui-button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AccountLedgerPage implements OnInit {
  private readonly api = inject(AccountApi);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rangeError = signal<string | null>(null);
  readonly account = signal<Account | null>(null);
  readonly ledger = signal<LedgerResponse | null>(null);
  readonly page = signal(0);

  fromInput = '';
  toInput = '';

  private accountId = '';

  readonly displayPage = computed(() => this.page() + 1);
  readonly pageTotal = computed(() => {
    const total = this.ledger()?.totalPages ?? 0;
    return total < 1 ? 1 : total;
  });
  readonly canPrev = computed(() => this.page() > 0);
  readonly canNext = computed(() => {
    const snap = this.ledger();
    if (!snap) {
      return false;
    }
    return this.page() + 1 < snap.totalPages;
  });

  ngOnInit(): void {
    this.accountId = this.route.snapshot.paramMap.get('accountId') ?? '';
    void this.bootstrap();
  }

  applyFilters(): void {
    this.rangeError.set(null);
    if (this.fromInput && this.toInput && this.fromInput > this.toInput) {
      this.rangeError.set(this.translate.instant('accounts.invalidRange'));
      return;
    }
    this.page.set(0);
    void this.loadLedger();
  }

  goPrev(): void {
    if (!this.canPrev()) {
      return;
    }
    this.page.update((p) => p - 1);
    void this.loadLedger();
  }

  goNext(): void {
    if (!this.canNext()) {
      return;
    }
    this.page.update((p) => p + 1);
    void this.loadLedger();
  }

  private async bootstrap(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
      if (!this.accountId) {
        this.error.set(this.translate.instant('accounts.loadLedgerError'));
        return;
      }
      const account = await firstValueFrom(this.api.get(this.accountId));
      this.account.set(account);
      if (!this.fromInput) {
        this.fromInput = account.openedOn;
      }
      if (!this.toInput) {
        this.toInput = account.balanceAsOf || todayIso();
      }
      await this.loadLedger();
    } catch {
      this.error.set(this.translate.instant('accounts.loadLedgerError'));
      this.loading.set(false);
    }
  }

  private async loadLedger(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const snap = await firstValueFrom(
        this.api.ledger(this.accountId, {
          from: this.fromInput || undefined,
          to: this.toInput || undefined,
          page: this.page(),
          size: PAGE_SIZE,
        }),
      );
      this.ledger.set(snap);
      this.fromInput = snap.from;
      this.toInput = snap.to;
      this.page.set(snap.page);
    } catch {
      this.error.set(this.translate.instant('accounts.loadLedgerError'));
    } finally {
      this.loading.set(false);
    }
  }
}

function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
