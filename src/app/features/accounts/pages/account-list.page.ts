import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { IconComponent, MoneyPipe, UiAlertComponent, UiBadgeComponent, UiSkeletonComponent } from '../../../shared';
import { AccountApi } from '../data/account.api';
import { Account } from '../data/account.models';

@Component({
  selector: 'app-account-list-page',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    MoneyPipe,
    IconComponent,
    UiAlertComponent,
    UiBadgeComponent,
    UiSkeletonComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ 'accounts.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">{{ 'accounts.subtitle' | translate }}</p>
        </div>
        @if (isAdmin()) {
          <a
            routerLink="new"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-contrast no-underline hover:bg-primary-600"
          >
            <app-icon name="plus" />
            {{ 'accounts.add' | translate }}
          </a>
        }
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="info">{{ 'accounts.readOnly' | translate }}</app-ui-alert>
      }

      @if (loading()) {
        <div class="flex flex-col gap-3">
          <app-ui-skeleton height="4rem" />
          <app-ui-skeleton height="4rem" />
          <app-ui-skeleton height="4rem" />
        </div>
      } @else if (error()) {
        <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
      } @else if (rows().length === 0) {
        <p class="py-10 text-center text-sm text-surface-500">{{ 'accounts.empty' | translate }}</p>
      } @else {
        <div class="flex flex-col gap-3 md:hidden">
          @for (a of rows(); track a.id) {
            <article class="rounded-xl border border-surface-200 bg-surface-0 p-4">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="truncate font-semibold text-surface-900">{{ a.name }}</p>
                  <p class="text-xs text-surface-500">
                    {{ typeLabel(a.type) }} · {{ a.ownerLabel }}
                  </p>
                </div>
                <app-ui-badge
                  [value]="a.status"
                  [severity]="a.status === 'ACTIVE' ? 'success' : 'secondary'"
                />
              </div>
              <p class="mt-3 text-xl font-semibold tabular-nums text-surface-900">
                {{ a.currentBalance | money: a.currency }}
              </p>
              @if (a.negativeBalanceWarning) {
                <p class="mt-1 text-xs text-orange-600">{{ 'accounts.negativeWarn' | translate }}</p>
              }
              <p class="mt-1 text-xs text-surface-500">
                {{ 'accounts.asOf' | translate }} {{ a.balanceAsOf }}
              </p>
              <div class="mt-3 flex flex-wrap items-center gap-3">
                <a
                  [routerLink]="[a.id, 'ledger']"
                  class="inline-flex text-sm font-semibold text-primary-600 no-underline hover:underline"
                >
                  {{ 'accounts.ledger' | translate }}
                </a>
                @if (isAdmin()) {
                  <a
                    [routerLink]="[a.id, 'edit']"
                    class="inline-flex items-center gap-1 text-sm font-semibold text-surface-700 no-underline hover:text-primary"
                    [attr.aria-label]="'accounts.edit' | translate"
                  >
                    <app-icon name="pencil" />
                    {{ 'accounts.edit' | translate }}
                  </a>
                }
              </div>
            </article>
          }
        </div>

        <div class="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-0 md:block">
          <table class="min-w-[48rem] w-full border-collapse text-left text-sm">
            <thead
              class="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wide text-surface-500"
            >
              <tr>
                <th class="px-4 py-3 font-semibold">{{ 'accounts.name' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'accounts.type' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'accounts.owner' | translate }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ 'accounts.balance' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'accounts.status' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'accounts.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (a of rows(); track a.id) {
                <tr class="border-b border-surface-100 last:border-0">
                  <td class="px-4 py-3">
                    <p class="font-medium text-surface-900">{{ a.name }}</p>
                    <p class="text-xs text-surface-500">
                      {{ 'accounts.openedOn' | translate }} {{ a.openedOn }}
                    </p>
                  </td>
                  <td class="px-4 py-3">{{ typeLabel(a.type) }}</td>
                  <td class="px-4 py-3">{{ a.ownerLabel }}</td>
                  <td class="px-4 py-3 text-right">
                    <p class="font-semibold tabular-nums">
                      {{ a.currentBalance | money: a.currency }}
                    </p>
                    @if (a.negativeBalanceWarning) {
                      <p class="text-xs text-orange-600">{{ 'accounts.negativeWarn' | translate }}</p>
                    }
                    <p class="text-xs text-surface-500">
                      {{ 'accounts.asOf' | translate }} {{ a.balanceAsOf }}
                    </p>
                  </td>
                  <td class="px-4 py-3">
                    <app-ui-badge
                      [value]="a.status"
                      [severity]="a.status === 'ACTIVE' ? 'success' : 'secondary'"
                    />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <a
                        [routerLink]="[a.id, 'ledger']"
                        class="text-sm font-semibold text-primary-600 no-underline hover:underline"
                      >
                        {{ 'accounts.ledger' | translate }}
                      </a>
                      @if (isAdmin()) {
                        <a
                          [routerLink]="[a.id, 'edit']"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-600 no-underline hover:bg-surface-100"
                          [attr.aria-label]="'accounts.edit' | translate"
                        >
                          <app-icon name="pencil" />
                        </a>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AccountListPage implements OnInit {
  private readonly api = inject(AccountApi);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<Account[]>([]);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  ngOnInit(): void {
    void this.load();
  }

  typeLabel(type: string): string {
    const key =
      type === 'BANK'
        ? 'accounts.typeBank'
        : type === 'WALLET'
          ? 'accounts.typeWallet'
          : type === 'CASH'
            ? 'accounts.typeCash'
            : null;
    return key ? this.translate.instant(key) : type;
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
      const list = await firstValueFrom(this.api.list());
      this.rows.set(list);
    } catch {
      this.error.set(this.translate.instant('accounts.loadError'));
    } finally {
      this.loading.set(false);
    }
  }
}
