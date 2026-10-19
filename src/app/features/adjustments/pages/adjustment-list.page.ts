import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService, LanguageService } from '../../../core';
import {
  IconComponent,
  MoneyPipe,
  ToastService,
  UiAlertComponent,
  UiButtonComponent,
  UiDialogComponent,
  UiSpinnerComponent,
  UiToastComponent,
} from '../../../shared';
import { AdjustmentApi } from '../data/adjustment.api';
import {
  DATE_PRESET_OPTIONS,
  dateHeading,
  defaultAdjustmentFilters,
  filterAdjustments,
  groupByDate,
  presetLabel,
  sumAmounts as totalAmounts,
  type DatePreset,
} from '../data/adjustment-filters';
import type {
  AccountOption,
  AdjustmentDto,
  AdjustmentListFilters,
} from '../data/adjustment.models';

@Component({
  selector: 'app-adjustment-list-page',
  standalone: true,
  providers: [ToastService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    IconComponent,
    MoneyPipe,
    UiButtonComponent,
    UiAlertComponent,
    UiSpinnerComponent,
    UiDialogComponent,
    UiToastComponent,
  ],
  template: `
    <app-ui-toast />

    <div class="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 md:p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">
            {{ 'adjustments.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-500">
            {{ 'adjustments.subtitle' | translate }}
          </p>
        </div>
        @if (isAdmin()) {
          <a
            [routerLink]="['reconcile']"
            class="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-teal-800"
          >
            <app-icon name="plus" />
            {{ 'adjustments.reconcile' | translate }}
          </a>
        }
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="info">{{ 'adjustments.adminOnly' | translate }}</app-ui-alert>
      } @else {
        <label class="relative block w-full">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-surface-400">
            <app-icon name="search" />
          </span>
          <input
            class="ui-input pl-10"
            [placeholder]="'adjustments.searchPlaceholder' | translate"
            [(ngModel)]="searchInput"
            (ngModelChange)="onSearch($event)"
          />
        </label>

        <div class="flex flex-wrap gap-2">
          @for (preset of presets; track preset.value) {
            <button
              type="button"
              class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
              [class.bg-sky-700]="filters().datePreset === preset.value"
              [class.text-white]="filters().datePreset === preset.value"
              [class.border-sky-700]="filters().datePreset === preset.value"
              [class.border-surface-300]="filters().datePreset !== preset.value"
              [class.text-surface-600]="filters().datePreset !== preset.value"
              (click)="setPreset(preset.value)"
            >
              {{ presetText(preset.value) }}
            </button>
          }
        </div>

        <div class="flex flex-wrap gap-2">
          <select
            class="ui-input min-w-40"
            [ngModel]="filters().accountId"
            (ngModelChange)="patchFilters({ accountId: $event || null })"
          >
            @for (opt of accountSelectOptions(); track opt.value ?? 'all') {
              <option [ngValue]="opt.value">{{ opt.label }}</option>
            }
          </select>
          <app-ui-button variant="secondary" (clicked)="clearFilters()">
            {{ 'adjustments.clear' | translate }}
          </app-ui-button>
        </div>

        @if (filters().datePreset === 'custom') {
          <div class="flex flex-wrap gap-2">
            <input
              class="ui-input w-auto"
              type="date"
              [ngModel]="dateFromModel"
              (ngModelChange)="onCustomFrom($event)"
            />
            <input
              class="ui-input w-auto"
              type="date"
              [ngModel]="dateToModel"
              (ngModelChange)="onCustomTo($event)"
            />
          </div>
        }

        @if (!loading() && !error()) {
          <div class="rounded-xl border border-surface-200 bg-surface-0 px-4 py-3 shadow-sm">
            <p class="text-sm font-medium tabular-nums">{{ summaryText() }}</p>
          </div>
        }

        @if (loading()) {
          <div class="flex justify-center py-16"><app-ui-spinner /></div>
        } @else if (error()) {
          <div class="flex flex-col items-start gap-3">
            <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
            <app-ui-button (clicked)="reload()">{{ 'adjustments.retry' | translate }}</app-ui-button>
          </div>
        } @else if (groups().length === 0) {
          <div
            class="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center text-sm text-surface-500"
          >
            {{ 'adjustments.empty' | translate }}
          </div>
        } @else {
          <div class="flex flex-col gap-4">
            @for (group of groups(); track group[0]) {
              <section class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-sm">
                <header
                  class="flex items-center justify-between gap-3 border-b border-surface-200 bg-surface-50 px-4 py-3"
                >
                  <h2 class="text-sm font-semibold">{{ heading(group[0]) }}</h2>
                  <p class="text-sm font-semibold tabular-nums">{{ dayTotal(group[1]) | money }}</p>
                </header>
                <div class="divide-y divide-surface-200">
                  @for (row of group[1]; track row.id) {
                    <div class="flex items-start justify-between gap-3 px-4 py-3">
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-surface-900">
                          {{ row.account.name }}
                        </p>
                        <p class="mt-0.5 text-xs text-surface-500">
                          {{ 'adjustments.balanceBefore' | translate }}
                          {{ row.balanceBefore | money: row.currency }}
                          <span class="text-surface-400">→</span>
                          {{ 'adjustments.observedBalance' | translate }}
                          {{ row.observedBalance | money: row.currency }}
                        </p>
                        @if (row.reason) {
                          <p class="mt-0.5 truncate text-sm text-surface-500">{{ row.reason }}</p>
                        }
                      </div>
                      <div class="flex shrink-0 items-start gap-1">
                        <p
                          class="text-sm font-semibold tabular-nums"
                          [class.text-rose-700]="row.amount.startsWith('-')"
                          [class.text-teal-800]="!row.amount.startsWith('-')"
                        >
                          {{ row.amount | money: row.currency }}
                        </p>
                        @if (row.capabilities.canVoid) {
                          <button
                            type="button"
                            class="inline-flex cursor-pointer rounded-md p-2 text-rose-600 hover:bg-rose-50"
                            [attr.aria-label]="'adjustments.void' | translate"
                            (click)="openVoid(row)"
                          >
                            <app-icon name="trash" />
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              </section>
            }
          </div>
        }
      }
    </div>

    <app-ui-dialog
      [open]="voidTarget() !== null"
      [title]="'adjustments.voidTitle' | translate"
      (closed)="closeVoid()"
    >
      <p class="mb-3 text-sm text-surface-600">{{ 'adjustments.voidConfirm' | translate }}</p>
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ 'adjustments.voidReason' | translate }}
        <textarea class="ui-input" [(ngModel)]="voidReason" rows="3" maxlength="500"></textarea>
      </label>
      <div class="mt-4 flex justify-end gap-2">
        <app-ui-button variant="secondary" (clicked)="closeVoid()">
          {{ 'adjustments.cancel' | translate }}
        </app-ui-button>
        <app-ui-button
          variant="danger"
          [loading]="voiding()"
          [disabled]="!voidReason.trim() || voiding()"
          (clicked)="confirmVoid()"
        >
          {{ 'adjustments.void' | translate }}
        </app-ui-button>
      </div>
    </app-ui-dialog>
  `,
})
export class AdjustmentListPage implements OnInit {
  private readonly api = inject(AdjustmentApi);
  private readonly auth = inject(AuthService);
  private readonly language = inject(LanguageService);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastService);

  readonly presets = DATE_PRESET_OPTIONS;
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly items = signal<AdjustmentDto[]>([]);
  readonly accounts = signal<AccountOption[]>([]);
  readonly filters = signal<AdjustmentListFilters>(defaultAdjustmentFilters());
  readonly voidTarget = signal<AdjustmentDto | null>(null);
  readonly voiding = signal(false);

  searchInput = '';
  voidReason = '';
  dateFromModel = '';
  dateToModel = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly filtered = computed(() => filterAdjustments(this.items(), this.filters()));
  readonly groups = computed(() => groupByDate(this.filtered()));

  ngOnInit(): void {
    this.reload();
  }

  presetText(value: DatePreset): string {
    return presetLabel(value, this.language.current());
  }

  heading(date: string): string {
    return dateHeading(date, this.language.current());
  }

  dayTotal(items: AdjustmentDto[]): string {
    return totalAmounts(items);
  }

  summaryText(): string {
    const list = this.filtered();
    const total = new MoneyPipe().transform(totalAmounts(list));
    if (list.length === 1) {
      return this.translate.instant('adjustments.summaryOne', { total });
    }
    return this.translate.instant('adjustments.summary', {
      count: String(list.length),
      total,
    });
  }

  accountSelectOptions(): Array<{ label: string; value: string | null }> {
    return [
      { label: this.translate.instant('adjustments.allAccounts'), value: null },
      ...this.accounts().map((a) => ({ label: a.name, value: a.id })),
    ];
  }

  onSearch(value: string): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => this.patchFilters({ search: value }), 300);
  }

  setPreset(datePreset: DatePreset): void {
    this.patchFilters({
      datePreset,
      dateFrom: datePreset === 'custom' ? this.filters().dateFrom : null,
      dateTo: datePreset === 'custom' ? this.filters().dateTo : null,
    });
  }

  onCustomFrom(value: string): void {
    this.dateFromModel = value;
    this.patchFilters({ dateFrom: value || null, datePreset: 'custom' });
  }

  onCustomTo(value: string): void {
    this.dateToModel = value;
    this.patchFilters({ dateTo: value || null, datePreset: 'custom' });
  }

  patchFilters(patch: Partial<AdjustmentListFilters>): void {
    this.filters.update((current) => ({ ...current, ...patch }));
  }

  clearFilters(): void {
    this.searchInput = '';
    this.dateFromModel = '';
    this.dateToModel = '';
    this.filters.set(defaultAdjustmentFilters());
  }

  reload(): void {
    if (!this.isAdmin()) {
      this.loading.set(false);
      this.error.set(null);
      this.items.set([]);
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending <= 0) {
        this.loading.set(false);
      }
    };

    this.api.list().subscribe({
      next: (rows) => {
        this.items.set(rows);
        done();
      },
      error: (err: { status?: number }) => {
        if (err?.status === 403) {
          this.error.set(this.translate.instant('adjustments.forbiddenError'));
        } else {
          this.error.set(this.translate.instant('adjustments.loadError'));
        }
        done();
      },
    });
    this.api.listAccounts().subscribe({
      next: (rows) => {
        this.accounts.set(rows);
        done();
      },
      error: () => done(),
    });
  }

  openVoid(row: AdjustmentDto): void {
    this.voidTarget.set(row);
    this.voidReason = '';
  }

  closeVoid(): void {
    this.voidTarget.set(null);
    this.voidReason = '';
  }

  confirmVoid(): void {
    const target = this.voidTarget();
    const reason = this.voidReason.trim();
    if (!target || !reason || /[\r\n]/.test(reason) || reason.length > 500) {
      return;
    }
    this.voiding.set(true);
    this.api.voidAdjustment(target.id, target.version, { reason }).subscribe({
      next: () => {
        this.voiding.set(false);
        this.closeVoid();
        this.toast.show('success', this.translate.instant('adjustments.voidSuccess'));
        this.reload();
      },
      error: (err: { status?: number }) => {
        this.voiding.set(false);
        this.toast.show(
          'error',
          err?.status === 403
            ? this.translate.instant('adjustments.forbiddenError')
            : this.translate.instant('adjustments.voidError'),
        );
      },
    });
  }
}
