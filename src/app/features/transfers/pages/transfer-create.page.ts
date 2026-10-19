import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LanguageService } from '../../../core';
import { UiAlertComponent, UiButtonComponent, UiSpinnerComponent } from '../../../shared';
import { TransferApiService } from '../data/transfer-api.service';
import { transferT, type TransferMessageKey } from '../data/transfer-i18n';
import type { AccountOption } from '../data/transfer.models';

@Component({
  selector: 'app-transfer-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    UiAlertComponent,
    UiButtonComponent,
    UiSpinnerComponent,
  ],
  template: `
    <div class="mx-auto flex w-full max-w-lg flex-col">
      <header class="border-b border-surface-200 px-4 py-4 md:px-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h1 class="text-xl font-bold">{{ label('add') }}</h1>
            <p class="text-sm text-surface-500">{{ label('createDescription') }}</p>
          </div>
          <a routerLink=".." class="text-sm text-surface-500 hover:text-surface-900">
            {{ label('backToList') }}
          </a>
        </div>
      </header>

      <div class="p-4 md:p-6">
        @if (loading()) {
          <div class="flex justify-center py-16"><app-ui-spinner /></div>
        } @else if (loadError()) {
          <div class="flex flex-col gap-3">
            <app-ui-alert severity="error">{{ loadError() }}</app-ui-alert>
            <app-ui-button (clicked)="load()">{{ label('retry') }}</app-ui-button>
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
              {{ label('date') }}
              <input class="ui-input" type="date" formControlName="effectiveDate" [attr.max]="maxDate" />
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
              @if (form.controls.amount.touched && form.controls.amount.invalid) {
                <span class="text-xs text-rose-700">{{ label('invalidAmount') }}</span>
              }
            </label>

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              {{ label('source') }}
              <select class="ui-input" formControlName="sourceAccountId">
                @for (option of accountOptions(); track option.id) {
                  <option [value]="option.id">{{ option.name }}</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              {{ label('destination') }}
              <select class="ui-input" formControlName="destinationAccountId">
                @for (option of accountOptions(); track option.id) {
                  <option [value]="option.id">{{ option.name }}</option>
                }
              </select>
            </label>

            <label class="flex flex-col gap-1.5 text-sm font-medium">
              {{ label('noteOptional') }}
              <textarea class="ui-input" formControlName="note" rows="3"></textarea>
            </label>

            <div class="flex flex-wrap gap-2 pt-2">
              <app-ui-button type="submit" [loading]="saving()" [disabled]="form.invalid || saving()">
                {{ label('save') }}
              </app-ui-button>
              <app-ui-button type="button" variant="secondary" (clicked)="goList()">
                {{ label('cancel') }}
              </app-ui-button>
            </div>
          </form>
        }
      </div>
    </div>
  `,
})
export class TransferCreatePage implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TransferApiService);
  private readonly language = inject(LanguageService);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly accounts = signal<AccountOption[]>([]);
  readonly maxDate = this.isoToday();

  readonly form = this.fb.nonNullable.group({
    effectiveDate: [this.maxDate, Validators.required],
    amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    sourceAccountId: ['', Validators.required],
    destinationAccountId: ['', Validators.required],
    note: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  label(key: TransferMessageKey): string {
    return transferT(this.language.current(), key);
  }

  accountOptions(): AccountOption[] {
    return this.accounts().filter((a) => a.status === 'ACTIVE');
  }

  load(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api.listAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        const active = accounts.filter((a) => a.status === 'ACTIVE');
        this.form.patchValue({
          sourceAccountId: active[0]?.id ?? '',
          destinationAccountId: active[1]?.id ?? active[0]?.id ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loadError.set(this.label('loadError'));
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
    const raw = this.form.getRawValue();
    if (raw.sourceAccountId === raw.destinationAccountId) {
      this.error.set(this.label('sameAccount'));
      return;
    }
    this.saving.set(true);
    this.api
      .create({
        effectiveDate: raw.effectiveDate,
        amount: raw.amount.trim(),
        sourceAccountId: raw.sourceAccountId,
        destinationAccountId: raw.destinationAccountId,
        note: raw.note.trim() || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.success.set(this.label('createSuccess'));
          this.form.patchValue({ amount: '', note: '' });
          this.form.markAsPristine();
          this.form.markAsUntouched();
        },
        error: (err: { status?: number; error?: { message?: string; detail?: string } }) => {
          this.saving.set(false);
          this.error.set(
            err.error?.message || err.error?.detail || String(err.status ?? 'Request failed'),
          );
        },
      });
  }

  goList(): void {
    void this.router.navigateByUrl('/transfers');
  }

  private isoToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
}
