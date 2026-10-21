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
import { LanguageService } from '../../../core';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';
import { wholeMmkAmountValidator } from '../../../shared/utils/whole-mmk-amount';
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
  imports: [CommonModule, ReactiveFormsModule, UiButtonComponent, UiAlertComponent],
  template: `
    <form class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
      @if (error()) {
        <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
      }
      @if (success()) {
        <app-ui-alert severity="success">{{ success() }}</app-ui-alert>
      }

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('date') }}
        <input class="ui-input" type="date" formControlName="effectiveDate" [attr.max]="maxDate" />
        @if (showError('effectiveDate')) {
          <span class="text-xs text-red-600">{{ label('required') }}</span>
        }
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('amount') }}
        <input
          class="ui-input"
          formControlName="amount"
          inputmode="numeric"
          autocomplete="off"
          placeholder="1000"
        />
        @if (showError('amount')) {
          <span class="text-xs text-red-600">{{ label('invalidAmount') }}</span>
        }
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('account') }}
        <select class="ui-input" formControlName="accountId">
          <option value="" disabled>{{ label('account') }}</option>
          @for (option of accountOptions; track option.id) {
            <option [value]="option.id">{{ option.name }}</option>
          }
        </select>
        @if (showError('accountId')) {
          <span class="text-xs text-red-600">{{ label('required') }}</span>
        }
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('category') }}
        <select class="ui-input" formControlName="categoryId">
          <option value="" disabled>{{ label('category') }}</option>
          @for (option of categoryOptions; track option.id) {
            <option [value]="option.id">{{ option.name }}</option>
          }
        </select>
        @if (showError('categoryId')) {
          <span class="text-xs text-red-600">{{ label('required') }}</span>
        }
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('beneficiary') }}
        <select class="ui-input" formControlName="beneficiaryId">
          <option value="" disabled>{{ label('beneficiary') }}</option>
          @for (option of beneficiaryOptions; track option.id) {
            <option [value]="option.id">{{ option.name }}</option>
          }
        </select>
        @if (showError('beneficiaryId')) {
          <span class="text-xs text-red-600">{{ label('required') }}</span>
        }
      </label>

      <label class="flex flex-col gap-1.5 text-sm font-medium">
        {{ label('noteOptional') }}
        <textarea class="ui-input" formControlName="note" rows="3"></textarea>
      </label>

      @if (initial) {
        <label class="flex flex-col gap-1.5 text-sm font-medium">
          {{ label('changeReason') }}
          <input class="ui-input" formControlName="changeReason" />
          @if (showError('changeReason')) {
            <span class="text-xs text-red-600">{{ label('required') }}</span>
          }
        </label>
      }

      <div class="flex flex-wrap gap-2 pt-2">
        <app-ui-button type="submit" [loading]="saving()" [disabled]="saving()">
          {{ label('save') }}
        </app-ui-button>
        <app-ui-button type="button" variant="secondary" (clicked)="cancelled.emit()">
          {{ label('cancel') }}
        </app-ui-button>
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

  readonly maxDate = this.toIsoDate(new Date())!;
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    effectiveDate: [this.toIsoDate(new Date())!, Validators.required],
    amount: ['', [Validators.required, wholeMmkAmountValidator()]],
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

  showError(
    control:
      | 'effectiveDate'
      | 'amount'
      | 'accountId'
      | 'categoryId'
      | 'beneficiaryId'
      | 'changeReason',
  ): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || this.submitted());
  }

  submit(): void {
    this.error.set(null);
    this.success.set(null);
    this.submitted.set(true);
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    const raw = this.form.getRawValue();
    const effectiveDate = raw.effectiveDate;
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
          this.submitted.set(false);
          this.form.patchValue({ amount: '', note: '' });
          this.form.controls.amount.markAsPristine();
          this.form.controls.amount.markAsUntouched();
          this.form.controls.note.markAsPristine();
          this.form.controls.note.markAsUntouched();
        }
        this.saved.emit(expense);
      },
      error: (err: { status?: number; error?: { message?: string; detail?: string; title?: string } }) => {
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
        effectiveDate: this.initial.effectiveDate,
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
        effectiveDate: this.toIsoDate(new Date())!,
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
    // Re-apply refs after options paint so <select> keeps the FormControl value.
    queueMicrotask(() => {
      if (this.initial) {
        return;
      }
      this.form.patchValue({
        accountId: this.accountOptions[0]?.id ?? '',
        beneficiaryId: this.beneficiaryOptions[0]?.id ?? '',
      });
    });
  }

  private toIsoDate(value: Date): string | null {
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
    error?: { message?: string; detail?: string; title?: string };
  }): string {
    if (err.status === 401) {
      return 'Unauthorized';
    }
    if (err.status === 403) {
      return 'Forbidden';
    }
    return (
      err.error?.detail ||
      err.error?.message ||
      err.error?.title ||
      String(err.status ?? 'Request failed')
    );
  }
}
