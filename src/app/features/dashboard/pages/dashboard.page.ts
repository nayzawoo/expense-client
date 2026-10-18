import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import {
  MoneyPipe,
  UiAlertComponent,
  UiBadgeComponent,
  UiSkeletonComponent,
} from '../../../shared';
import { SpendingPaceChartComponent } from '../components/spending-pace-chart';
import { DashboardApi } from '../data/dashboard.api';
import { DashboardPayload } from '../data/dashboard.models';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    TranslatePipe,
    MoneyPipe,
    UiAlertComponent,
    UiSkeletonComponent,
    UiBadgeComponent,
    SpendingPaceChartComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      @if (loading()) {
        <app-ui-skeleton height="2.5rem" width="12rem" />
        <app-ui-skeleton height="8rem" />
        <div class="grid gap-4 sm:grid-cols-3">
          <app-ui-skeleton height="6rem" />
          <app-ui-skeleton height="6rem" />
          <app-ui-skeleton height="6rem" />
        </div>
      } @else if (error()) {
        <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
      } @else if (data(); as d) {
        <header class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
              {{ 'dashboard.title' | translate }}
            </h1>
            <p class="mt-1 text-sm text-surface-500">
              {{ 'dashboard.asOf' | translate }} {{ d.asOf }} · {{ d.timeZone }}
            </p>
          </div>
          @if (!d.comparisonPeriod.coverage.complete) {
            <app-ui-badge
              severity="warn"
              [value]="'dashboard.coverageIncomplete' | translate"
            />
          }
        </header>

        <section class="rounded-xl border border-surface-200 bg-surface-0 p-4 md:p-5">
          <p class="text-sm text-surface-500">{{ 'dashboard.totalBalance' | translate }}</p>
          <p class="mt-1 text-3xl font-semibold tabular-nums text-surface-900">
            {{ d.totalBalance | money: d.currency }}
          </p>
          <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            @for (account of d.accounts; track account.id) {
              <div
                class="flex items-center justify-between gap-2 rounded-lg border border-surface-100 px-3 py-2"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-surface-800">{{ account.name }}</p>
                  @if (account.negativeBalanceWarning) {
                    <p class="text-xs text-orange-600">{{ 'dashboard.negativeWarn' | translate }}</p>
                  }
                </div>
                <p class="shrink-0 text-sm font-semibold tabular-nums">
                  {{ account.balance | money: d.currency }}
                </p>
              </div>
            }
          </div>
        </section>

        <section class="grid gap-4 sm:grid-cols-3">
          <article class="rounded-xl border border-surface-200 bg-surface-0 p-4">
            <p class="text-sm text-surface-500">{{ 'dashboard.expense' | translate }}</p>
            <p class="mt-1 text-2xl font-semibold tabular-nums text-surface-900">
              {{ d.overview.expense | money: d.currency }}
            </p>
            @if (d.overview.direction) {
              <p class="mt-2 text-xs text-surface-500">
                {{ d.overview.expenseDifference | money: d.currency }}
                ({{ d.overview.direction }}) · {{ 'dashboard.vsPrevious' | translate }}
              </p>
            }
          </article>
          <article class="rounded-xl border border-surface-200 bg-surface-0 p-4">
            <p class="text-sm text-surface-500">{{ 'dashboard.income' | translate }}</p>
            <p class="mt-1 text-2xl font-semibold tabular-nums text-surface-900">
              {{ d.overview.income | money: d.currency }}
            </p>
          </article>
          <article class="rounded-xl border border-surface-200 bg-surface-0 p-4">
            <p class="text-sm text-surface-500">{{ 'dashboard.net' | translate }}</p>
            <p class="mt-1 text-2xl font-semibold tabular-nums text-surface-900">
              {{ d.overview.net | money: d.currency }}
            </p>
            @if (d.overview.elapsedDayAverage) {
              <p class="mt-2 text-xs text-surface-500">
                {{ 'dashboard.avgPerDay' | translate }}:
                {{ d.overview.elapsedDayAverage | money: d.currency }}
              </p>
            }
          </article>
        </section>

        <app-spending-pace-chart [data]="d.spendingPace" [currency]="d.currency" />

        <div class="grid gap-4 lg:grid-cols-2">
          <section class="rounded-xl border border-surface-200 bg-surface-0 p-4 md:p-5">
            <h2 class="text-base font-semibold text-surface-900">
              {{ 'dashboard.categoryChanges' | translate }}
            </h2>
            <p class="mb-4 text-sm text-surface-500">
              {{ 'dashboard.categoryChangesHint' | translate }}
            </p>
            @if (
              d.categoryChanges.increased.length === 0 && d.categoryChanges.decreased.length === 0
            ) {
              <p class="text-sm text-surface-500">{{ 'dashboard.noChanges' | translate }}</p>
            } @else {
              <div class="grid gap-4 sm:grid-cols-2">
                <div>
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {{ 'dashboard.categoryUp' | translate }}
                  </p>
                  <ul class="space-y-2">
                    @for (item of d.categoryChanges.increased; track item.category.id) {
                      <li class="flex items-center justify-between gap-2 text-sm">
                        <span class="truncate">{{ item.category.name }}</span>
                        <span class="shrink-0 tabular-nums text-emerald-700">
                          +{{ item.difference | money: d.currency }}
                        </span>
                      </li>
                    }
                  </ul>
                </div>
                <div>
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
                    {{ 'dashboard.categoryDown' | translate }}
                  </p>
                  <ul class="space-y-2">
                    @for (item of d.categoryChanges.decreased; track item.category.id) {
                      <li class="flex items-center justify-between gap-2 text-sm">
                        <span class="truncate">{{ item.category.name }}</span>
                        <span class="shrink-0 tabular-nums text-rose-700">
                          {{ item.difference | money: d.currency }}
                        </span>
                      </li>
                    }
                  </ul>
                </div>
              </div>
            }
          </section>

          <section class="rounded-xl border border-surface-200 bg-surface-0 p-4 md:p-5">
            <h2 class="text-base font-semibold text-surface-900">
              {{ 'dashboard.topCategories' | translate }}
            </h2>
            <p class="mb-4 text-sm text-surface-500">
              {{ 'dashboard.topCategoriesHint' | translate }}
            </p>
            @if (d.categoryBreakdown.length === 0) {
              <p class="text-sm text-surface-500">{{ 'dashboard.noCategories' | translate }}</p>
            } @else {
              <ul class="space-y-3">
                @for (row of d.categoryBreakdown; track row.category.id) {
                  <li>
                    <div class="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span class="truncate font-medium">{{ row.category.name }}</span>
                      <span class="shrink-0 text-right">
                        <span class="font-semibold tabular-nums">{{
                          row.amount | money: d.currency
                        }}</span>
                        <span class="ml-2 text-xs text-surface-500">{{ row.sharePercent }}%</span>
                      </span>
                    </div>
                    <div class="h-2 overflow-hidden rounded-full bg-surface-100">
                      <div
                        class="h-full rounded-full bg-primary-500"
                        [style.width.%]="barWidth(row.sharePercent)"
                      ></div>
                    </div>
                  </li>
                }
              </ul>
            }
          </section>
        </div>

        <div class="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
          <section class="rounded-xl border border-surface-200 bg-surface-0 p-4 md:p-5">
            <h2 class="mb-4 text-base font-semibold text-surface-900">
              {{ 'dashboard.recent' | translate }}
            </h2>
            @if (d.recentActivity.length === 0) {
              <p class="text-sm text-surface-500">{{ 'dashboard.noActivity' | translate }}</p>
            } @else {
              <ul class="divide-y divide-surface-100">
                @for (item of d.recentActivity; track item.id) {
                  <li class="flex items-start justify-between gap-3 py-3 text-sm">
                    <div class="min-w-0">
                      <p class="font-medium text-surface-900">
                        {{ item.kind }}
                        @if (item.account) {
                          <span class="font-normal text-surface-500">· {{ item.account.name }}</span>
                        }
                      </p>
                      <p class="text-xs text-surface-500">
                        {{ item.effectiveDate }}
                        @if (item.note) {
                          · {{ item.note }}
                        }
                      </p>
                    </div>
                    <p class="shrink-0 font-semibold tabular-nums">
                      {{ item.amount | money: item.currency || d.currency }}
                    </p>
                  </li>
                }
              </ul>
            }
          </section>

          <section class="rounded-xl border border-surface-200 bg-surface-0 p-4 md:p-5">
            <h2 class="mb-4 text-base font-semibold text-surface-900">
              {{ 'dashboard.byPerson' | translate }}
            </h2>
            @if (d.beneficiarySpending.length === 0) {
              <p class="text-sm text-surface-500">{{ 'dashboard.noPeople' | translate }}</p>
            } @else {
              <ul class="space-y-2">
                @for (row of d.beneficiarySpending; track row.beneficiary.id) {
                  <li class="flex items-center justify-between gap-2 text-sm">
                    <span class="truncate">{{ row.beneficiary.name }}</span>
                    <span class="shrink-0 font-semibold tabular-nums">{{
                      row.amount | money: d.currency
                    }}</span>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      }
    </div>
  `,
})
export class DashboardPage implements OnInit {
  private readonly api = inject(DashboardApi);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly data = signal<DashboardPayload | null>(null);

  ngOnInit(): void {
    void this.load();
  }

  barWidth(sharePercent: string): number {
    const n = Number(sharePercent);
    if (!Number.isFinite(n) || n < 0) {
      return 0;
    }
    return Math.min(n, 100);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
      const payload = await firstValueFrom(this.api.get());
      this.data.set(payload);
    } catch {
      this.error.set(this.translate.instant('dashboard.loadError'));
    } finally {
      this.loading.set(false);
    }
  }
}
