import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { LanguageService } from '../../../core';
import { ExpenseApiService } from '../data/expense-api.service';
import { expenseT, type ExpenseMessageKey } from '../data/expense-i18n';
import type {
  AccountOption,
  BeneficiaryOption,
  CategoryOption,
  CreateExpenseRequest,
  ExpenseDto,
  ReplaceExpenseRequest,
} from '../data/expense.models';

@Component({
  selector: 'app-expense-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    DatePicker,
    InputText,
    Message,
    Select,
    Textarea,
  ],
  template: `
    <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
      @if (error()) {
        <p-message severity="error" styleClass="w-full">{{ error() }}</p-message>
      }
      @if (success()) {
        <p-message severity="success" styleClass="w-full">{{ success() }}</p-message>
      }

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('date') }}
        <p-datepicker
          formControlName="effectiveDate"
          dateFormat="yy-mm-dd"
          [showIcon]="true"
          [maxDate]="maxDate"
          styleClass="w-full"
          inputStyleClass="w-full"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('amount') }}
        <input
          pInputText
          formControlName="amount"
          inputmode="numeric"
          autocomplete="off"
          class="w-full"
          placeholder="1000"
        />
        @if (form.controls.amount.touched && form.controls.amount.invalid) {
          <span class="text-xs text-red-600">{{ label('invalidAmount') }}</span>
        }
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('account') }}
        <p-select
          formControlName="accountId"
          [options]="accountOptions"
          optionLabel="name"
          optionValue="id"
          [filter]="true"
          styleClass="w-full"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('category') }}
        <p-select
          formControlName="categoryId"
          [options]="categoryOptions"
          optionLabel="name"
          optionValue="id"
          [filter]="true"
          styleClass="w-full"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('beneficiary') }}
        <p-select
          formControlName="beneficiaryId"
          [options]="beneficiaryOptions"
          optionLabel="name"
          optionValue="id"
          [filter]="true"
          styleClass="w-full"
        />
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('noteOptional') }}
        <textarea pTextarea formControlName="note" rows="3" class="w-full"></textarea>
      </label>

      @if (initial) {
        <label class="flex flex-col gap-1.5 text-sm font-medium">
          {{ label('changeReason') }}
          <input pInputText formControlName="changeReason" class="w-full" />
        </label>
      }

      <div class="flex flex-wrap gap-2 pt-2">
        <p-button
          type="submit"
          [label]="label('save')"
          [loading]="saving()"
          [disabled]="form.invalid || saving()"
        />
        <p-button
          type="button"
          [label]="label('cancel')"
          severity="secondary"
          [outlined]="true"
          (onClick)="cancelled.emit()"
        />
      </div>
    </form>
  `,
})
export class ExpenseFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ExpenseApiService);
  private readonly language = inject(LanguageService);

  @Input() accounts: AccountOption[] = [];
  @Input() categories: CategoryOption[] = [];
  @Input() beneficiaries: BeneficiaryOption[] = [];
  @Input() initial: ExpenseDto | null = null;

  @Output() readonly saved = new EventEmitter<ExpenseDto>();
  @Output() readonly cancelled = new EventEmitter<void>();

  readonly maxDate = new Date();
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    effectiveDate: [new Date() as Date | null, Validators.required],
    amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    accountId: ['', Validators.required],
    categoryId: ['', Validators.required],
    beneficiaryId: ['', Validators.required],
    note: [''],
    changeReason: [''],
  });

  get accountOptions(): AccountOption[] {
    return this.accounts.filter((a) => a.status === 'ACTIVE' || a.id === this.initial?.account.id);
  }

  get categoryOptions(): CategoryOption[] {
    return this.categories.filter(
      (c) => c.status === 'ACTIVE' || c.id === this.initial?.category.id,
    );
  }

  get beneficiaryOptions(): BeneficiaryOption[] {
    return this.beneficiaries.filter(
      (b) => b.status === 'ACTIVE' || b.id === this.initial?.beneficiary.id,
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initial'] ||
      changes['accounts'] ||
      changes['categories'] ||
      changes['beneficiaries']
    ) {
      this.patchFromInitial();
    }
  }

  label(key: ExpenseMessageKey): string {
    return expenseT(this.language.current(), key);
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const effectiveDate = this.toIsoDate(raw.effectiveDate);
    if (!effectiveDate) {
      this.error.set(this.label('required'));
      return;
    }
    const base: CreateExpenseRequest = {
      effectiveDate,
      amount: raw.amount.trim(),
      accountId: raw.accountId,
      categoryId: raw.categoryId,
      beneficiaryId: raw.beneficiaryId,
      note: raw.note.trim() || null,
    };

    this.saving.set(true);
    const request$ = this.initial
      ? this.api.replace(this.initial.id, this.initial.version, {
          ...base,
          changeReason: raw.changeReason.trim() || 'Correction',
        } satisfies ReplaceExpenseRequest)
      : this.api.create(base);

    request$.subscribe({
      next: (expense) => {
        this.saving.set(false);
        this.success.set(this.label(this.initial ? 'updateSuccess' : 'createSuccess'));
        if (!this.initial) {
          this.form.patchValue({ amount: '', note: '' });
          this.form.markAsPristine();
        }
        this.saved.emit(expense);
      },
      error: (err: { status?: number; error?: { message?: string; detail?: string } }) => {
        this.saving.set(false);
        this.error.set(this.describeError(err));
      },
    });
  }

  private patchFromInitial(): void {
    const firstAccount = this.accountOptions[0]?.id ?? '';
    const firstBeneficiary = this.beneficiaryOptions[0]?.id ?? '';
    if (this.initial) {
      this.form.patchValue({
        effectiveDate: new Date(`${this.initial.effectiveDate}T00:00:00`),
        amount: this.initial.amount,
        accountId: this.initial.account.id,
        categoryId: this.initial.category.id,
        beneficiaryId: this.initial.beneficiary.id,
        note: this.initial.note ?? '',
        changeReason: '',
      });
      this.form.controls.changeReason.setValidators([Validators.required]);
    } else {
      this.form.patchValue({
        effectiveDate: new Date(),
        amount: '',
        accountId: firstAccount,
        categoryId: '',
        beneficiaryId: firstBeneficiary,
        note: '',
        changeReason: '',
      });
      this.form.controls.changeReason.clearValidators();
    }
    this.form.controls.changeReason.updateValueAndValidity({ emitEvent: false });
  }

  private toIsoDate(value: Date | null): string | null {
    if (!value) {
      return null;
    }
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private describeError(err: {
    status?: number;
    error?: { message?: string; detail?: string };
  }): string {
    if (err.status === 401) {
      return 'Unauthorized';
    }
    if (err.status === 403) {
      return 'Forbidden';
    }
    return err.error?.message || err.error?.detail || String(err.status ?? 'Request failed');
  }
}
