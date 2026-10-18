import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Toast } from 'primeng/toast';
import { LanguageService } from '../../../core';
import { MoneyPipe } from '../../../shared';
import { ExpenseApiService } from '../data/expense-api.service';
import {
  DATE_PRESET_OPTIONS,
  dateHeading,
  defaultExpenseFilters,
  filterExpenses,
  groupByDate,
  presetLabel,
  sumAmounts as totalAmounts,
} from '../data/expense-filters';
import { expenseT, type ExpenseMessageKey } from '../data/expense-i18n';
import type {
  AccountOption,
  BeneficiaryOption,
  CategoryOption,
  DatePreset,
  ExpenseDto,
  ExpenseListFilters,
} from '../data/expense.models';

@Component({
  selector: 'app-expense-list-page',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    Button,
    DatePicker,
    Dialog,
    IconField,
    InputIcon,
    InputText,
    Message,
    ProgressSpinner,
    Select,
    Textarea,
    Toast,
    MoneyPipe,
  ],
  template: `
    <p-toast />

    <div class="mx-auto flex w-full max-w-3xl flex-col gap-5 p-4 md:p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{{ label('title') }}</h1>
          <p class="mt-1 text-sm text-surface-500">{{ label('description') }}</p>
        </div>
        <p-button [routerLink]="['new']" [label]="label('add')" icon="pi pi-plus" />
      </header>

      <p-iconfield class="w-full">
        <p-inputicon styleClass="pi pi-search" />
        <input
          pInputText
          class="w-full"
          [placeholder]="label('searchPlaceholder')"
          [(ngModel)]="searchInput"
          (ngModelChange)="onSearch($event)"
        />
      </p-iconfield>

      <div class="flex flex-wrap gap-2">
        @for (preset of presets; track preset.value) {
          <button
            type="button"
            class="rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
            [class.bg-rose-600]="filters().datePreset === preset.value"
            [class.text-white]="filters().datePreset === preset.value"
            [class.border-rose-600]="filters().datePreset === preset.value"
            [class.border-surface-300]="filters().datePreset !== preset.value"
            [class.text-surface-600]="filters().datePreset !== preset.value"
            (click)="setPreset(preset.value)"
          >
            {{ presetText(preset.value) }}
          </button>
        }
      </div>

      <div class="flex flex-wrap gap-2">
        <p-select
          [options]="categorySelectOptions()"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filters().categoryId"
          (ngModelChange)="patchFilters({ categoryId: $event || null })"
          [placeholder]="label('allCategories')"
          styleClass="min-w-40"
        />
        <p-select
          [options]="accountSelectOptions()"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filters().accountId"
          (ngModelChange)="patchFilters({ accountId: $event || null })"
          [placeholder]="label('allAccounts')"
          styleClass="min-w-40"
        />
        <p-select
          [options]="beneficiarySelectOptions()"
          optionLabel="label"
          optionValue="value"
          [ngModel]="filters().beneficiaryId"
          (ngModelChange)="patchFilters({ beneficiaryId: $event || null })"
          [placeholder]="label('allPeople')"
          styleClass="min-w-40"
        />
        <p-button
          [label]="label('clear')"
          severity="secondary"
          [outlined]="true"
          (onClick)="clearFilters()"
        />
      </div>

      @if (filters().datePreset === 'custom') {
        <div class="flex flex-wrap gap-2">
          <p-datepicker
            [ngModel]="dateFromModel"
            (ngModelChange)="onCustomFrom($event)"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
            placeholder="From"
          />
          <p-datepicker
            [ngModel]="dateToModel"
            (ngModelChange)="onCustomTo($event)"
            dateFormat="yy-mm-dd"
            [showIcon]="true"
            placeholder="To"
          />
        </div>
      }

      @if (!loading() && !error()) {
        <div class="rounded-xl border border-surface-200 bg-surface-0 px-4 py-3 shadow-sm">
          <p class="text-sm font-medium tabular-nums">{{ summaryText() }}</p>
        </div>
      }

      @if (loading()) {
        <div class="flex justify-center py-16">
          <p-progress-spinner strokeWidth="4" />
        </div>
      } @else if (error()) {
        <div class="flex flex-col items-start gap-3">
          <p-message severity="error" styleClass="w-full">{{ error() }}</p-message>
          <p-button [label]="label('retry')" (onClick)="reload()" />
        </div>
      } @else if (groups().length === 0) {
        <div
          class="rounded-xl border border-dashed border-surface-300 bg-surface-50 p-10 text-center text-sm text-surface-500"
        >
          {{ label('empty') }}
        </div>
      } @else {
        <div class="flex flex-col gap-4">
          @for (group of groups(); track group[0]) {
            <section
              class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-sm"
            >
              <header
                class="flex items-center justify-between gap-3 border-b border-surface-200 bg-surface-50 px-4 py-3"
              >
                <h2 class="text-sm font-semibold">{{ heading(group[0]) }}</h2>
                <p class="text-sm font-semibold tabular-nums">
                  {{ dayTotal(group[1]) | money }}
                </p>
              </header>
              <div class="divide-y divide-surface-200">
                @for (expense of group[1]; track expense.id) {
                  <div class="flex items-start gap-3 px-4 py-3">
                    <div
                      class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                      [style.backgroundColor]="categoryColor(expense) + '22'"
                      [style.color]="categoryColor(expense)"
                    >
                      {{ expense.category.name.slice(0, 1) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-start justify-between gap-3">
                        <p class="truncate text-sm font-semibold">{{ expense.category.name }}</p>
                        <p class="shrink-0 text-sm font-semibold tabular-nums text-rose-600">
                          −{{ expense.amount | money: expense.currency }}
                        </p>
                      </div>
                      @if (expense.note) {
                        <p class="mt-0.5 truncate text-sm text-surface-500">{{ expense.note }}</p>
                      }
                      <div class="mt-1 flex items-center justify-between gap-2">
                        <p class="truncate text-xs text-surface-500">
                          {{ expense.account.name }} · {{ expense.beneficiary.name }}
                        </p>
                        <div class="flex shrink-0 gap-1">
                          @if (expense.capabilities.canReplace) {
                            <a
                              class="inline-flex rounded-md p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-900"
                              [routerLink]="[expense.id, 'edit']"
                              [attr.aria-label]="label('edit')"
                            >
                              <i class="pi pi-pencil text-sm"></i>
                            </a>
                          }
                          @if (expense.capabilities.canVoid) {
                            <button
                              type="button"
                              class="inline-flex cursor-pointer rounded-md p-2 text-rose-600 hover:bg-rose-50"
                              [attr.aria-label]="label('void')"
                              (click)="openVoid(expense)"
                            >
                              <i class="pi pi-trash text-sm"></i>
                            </button>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>

    <p-dialog
      [header]="label('voidTitle')"
      [modal]="true"
      [visible]="voidTarget() !== null"
      (visibleChange)="!$event && closeVoid()"
      [style]="{ width: 'min(100%, 28rem)' }"
    >
      <p class="mb-3 text-sm text-surface-600">{{ label('voidConfirm') }}</p>
      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('voidReason') }}
        <textarea pTextarea [(ngModel)]="voidReason" rows="3" class="w-full"></textarea>
      </label>
      <div class="mt-4 flex justify-end gap-2">
        <p-button
          [label]="label('cancel')"
          severity="secondary"
          [outlined]="true"
          (onClick)="closeVoid()"
        />
        <p-button
          [label]="label('void')"
          severity="danger"
          [loading]="voiding()"
          [disabled]="!voidReason.trim() || voiding()"
          (onClick)="confirmVoid()"
        />
      </div>
    </p-dialog>
  `,
})
export class ExpenseListPage implements OnInit {
  private readonly api = inject(ExpenseApiService);
  private readonly language = inject(LanguageService);
  private readonly messages = inject(MessageService);

  readonly presets = DATE_PRESET_OPTIONS;
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly items = signal<ExpenseDto[]>([]);
  readonly categories = signal<CategoryOption[]>([]);
  readonly accounts = signal<AccountOption[]>([]);
  readonly beneficiaries = signal<BeneficiaryOption[]>([]);
  readonly filters = signal<ExpenseListFilters>(defaultExpenseFilters());
  readonly voidTarget = signal<ExpenseDto | null>(null);
  readonly voiding = signal(false);

  searchInput = '';
  voidReason = '';
  dateFromModel: Date | null = null;
  dateToModel: Date | null = null;
  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  readonly filtered = computed(() => filterExpenses(this.items(), this.filters()));
  readonly groups = computed(() => groupByDate(this.filtered()));

  ngOnInit(): void {
    this.reload();
  }

  label(key: ExpenseMessageKey, vars?: Record<string, string>): string {
    return expenseT(this.language.current(), key, vars);
  }

  presetText(value: DatePreset): string {
    return presetLabel(value, this.language.current());
  }

  heading(date: string): string {
    return dateHeading(date, this.language.current());
  }

  dayTotal(items: ExpenseDto[]): string {
    return totalAmounts(items);
  }

  summaryText(): string {
    const list = this.filtered();
    const total = new MoneyPipe().transform(totalAmounts(list));
    if (list.length === 1) {
      return this.label('summaryOne', { total });
    }
    return this.label('summary', { count: String(list.length), total });
  }

  categorySelectOptions(): Array<{ label: string; value: string | null }> {
    return [
      { label: this.label('allCategories'), value: null },
      ...this.categories().map((c) => ({ label: c.name, value: c.id })),
    ];
  }

  accountSelectOptions(): Array<{ label: string; value: string | null }> {
    return [
      { label: this.label('allAccounts'), value: null },
      ...this.accounts().map((a) => ({ label: a.name, value: a.id })),
    ];
  }

  beneficiarySelectOptions(): Array<{ label: string; value: string | null }> {
    return [
      { label: this.label('allPeople'), value: null },
      ...this.beneficiaries().map((b) => ({ label: b.name, value: b.id })),
    ];
  }

  categoryColor(expense: ExpenseDto): string {
    const match = this.categories().find((c) => c.id === expense.category.id);
    return match?.color || '#be123c';
  }

  onSearch(value: string): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.patchFilters({ search: value });
    }, 300);
  }

  setPreset(datePreset: DatePreset): void {
    this.patchFilters({
      datePreset,
      dateFrom: datePreset === 'custom' ? this.filters().dateFrom : null,
      dateTo: datePreset === 'custom' ? this.filters().dateTo : null,
    });
  }

  onCustomFrom(value: Date | null): void {
    this.dateFromModel = value;
    this.patchFilters({ dateFrom: value ? this.toIso(value) : null, datePreset: 'custom' });
  }

  onCustomTo(value: Date | null): void {
    this.dateToModel = value;
    this.patchFilters({ dateTo: value ? this.toIso(value) : null, datePreset: 'custom' });
  }

  patchFilters(patch: Partial<ExpenseListFilters>): void {
    this.filters.update((current) => ({ ...current, ...patch }));
  }

  clearFilters(): void {
    this.searchInput = '';
    this.dateFromModel = null;
    this.dateToModel = null;
    this.filters.set(defaultExpenseFilters());
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    let pending = 4;
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
      error: () => {
        this.error.set(this.label('loadError'));
        done();
      },
    });
    this.api.listCategories().subscribe({
      next: (rows) => {
        this.categories.set(rows);
        done();
      },
      error: () => done(),
    });
    this.api.listAccounts().subscribe({
      next: (rows) => {
        this.accounts.set(rows);
        done();
      },
      error: () => done(),
    });
    this.api.listBeneficiaries().subscribe({
      next: (rows) => {
        this.beneficiaries.set(rows);
        done();
      },
      error: () => done(),
    });
  }

  openVoid(expense: ExpenseDto): void {
    this.voidTarget.set(expense);
    this.voidReason = '';
  }

  closeVoid(): void {
    this.voidTarget.set(null);
    this.voidReason = '';
  }

  confirmVoid(): void {
    const target = this.voidTarget();
    if (!target || !this.voidReason.trim()) {
      return;
    }
    this.voiding.set(true);
    this.api.voidExpense(target.id, target.version, { reason: this.voidReason.trim() }).subscribe({
      next: () => {
        this.voiding.set(false);
        this.closeVoid();
        this.messages.add({ severity: 'success', summary: this.label('voidSuccess') });
        this.reload();
      },
      error: (err: { status?: number }) => {
        this.voiding.set(false);
        this.messages.add({
          severity: 'error',
          summary: String(err?.status ?? 'Error'),
        });
      },
    });
  }

  private toIso(value: Date): string {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
