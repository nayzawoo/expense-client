import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MoneyPipe } from '../../../shared';
import { PacePoint } from '../data/dashboard.models';

@Component({
  selector: 'app-spending-pace-chart',
  standalone: true,
  imports: [TranslatePipe, MoneyPipe],
  template: `
    <section class="rounded-xl border border-surface-200 bg-surface-0 p-4 md:p-5">
      <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-surface-900">
            {{ 'dashboard.spendingPace' | translate }}
          </h2>
          <p class="text-sm text-surface-500">{{ 'dashboard.spendingPaceHint' | translate }}</p>
        </div>
        <div class="flex items-center gap-4 text-xs text-surface-500">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-0.5 w-4 rounded bg-primary-500"></span>
            {{ 'dashboard.current' | translate }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-px w-4 border-t border-dashed border-surface-400"></span>
            {{ 'dashboard.previous' | translate }}
          </span>
        </div>
      </div>

      @if (!hasData()) {
        <p class="text-sm text-surface-500">{{ 'dashboard.noPace' | translate }}</p>
      } @else {
        <svg
          class="h-48 w-full"
          viewBox="0 0 100 40"
          preserveAspectRatio="none"
          role="img"
          [attr.aria-label]="'dashboard.spendingPace' | translate"
        >
          <polyline
            fill="none"
            stroke="var(--p-surface-300)"
            stroke-width="0.3"
            stroke-dasharray="1 1"
            [attr.points]="previousPoints()"
          />
          <polyline
            fill="none"
            stroke="var(--p-primary-500)"
            stroke-width="0.6"
            [attr.points]="currentPoints()"
          />
        </svg>
        <div class="mt-2 flex justify-between text-xs text-surface-500">
          <span>1</span>
          <span>{{ lastDay() }}</span>
        </div>
        <p class="mt-2 text-sm text-surface-700">
          {{ 'dashboard.current' | translate }}:
          <span class="font-semibold tabular-nums">{{ lastCurrent() | money: currency() }}</span>
        </p>
      }
    </section>
  `,
})
export class SpendingPaceChartComponent {
  readonly data = input.required<PacePoint[]>();
  readonly currency = input('MMK');

  readonly hasData = computed(() =>
    this.data().some(
      (p) => Number(p.currentCumulative) > 0 || Number(p.previousCumulative) > 0,
    ),
  );

  readonly lastDay = computed(() => this.data().at(-1)?.day ?? 0);
  readonly lastCurrent = computed(() => this.data().at(-1)?.currentCumulative ?? '0');

  readonly currentPoints = computed(() => this.toPoints((p) => p.currentCumulative));
  readonly previousPoints = computed(() => this.toPoints((p) => p.previousCumulative));

  private toPoints(pick: (p: PacePoint) => string): string {
    const rows = this.data();
    if (rows.length === 0) {
      return '';
    }
    const max = Math.max(
      1,
      ...rows.map((p) => Math.max(Number(p.currentCumulative), Number(p.previousCumulative))),
    );
    const n = rows.length;
    return rows
      .map((p, i) => {
        const x = n === 1 ? 0 : (i / (n - 1)) * 100;
        const y = 38 - (Number(pick(p)) / max) * 34;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  }
}
