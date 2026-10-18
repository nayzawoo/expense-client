import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { IconComponent, UiAlertComponent, UiButtonComponent } from '../../../shared';
import { AccountApi } from '../data/account.api';
import { AccountType } from '../data/account.models';

@Component({
  selector: 'app-account-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    IconComponent,
    UiAlertComponent,
    UiButtonComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start gap-3">
        <a
          routerLink="/accounts"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
          [attr.aria-label]="'accounts.back' | translate"
        >
          <app-icon name="arrow-left" />
        </a>
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ 'accounts.createTitle' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">{{ 'accounts.createSubtitle' | translate }}</p>
        </div>
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="warn">{{ 'accounts.readOnly' | translate }}</app-ui-alert>
      } @else {
        <form
          class="mx-auto flex w-full max-w-lg flex-col gap-4 rounded-xl border border-surface-200 bg-surface-0 p-5"
          [formGroup]="form"
          (ngSubmit)="submit()"
        >
          @if (error()) {
            <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
          }

          <div class="flex flex-col gap-1.5">
            <label for="account-name" class="text-sm font-medium text-surface-800">
              {{ 'accounts.name' | translate }}
            </label>
            <input id="account-name" class="ui-input" formControlName="name" autocomplete="off" />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <span class="text-xs text-rose-700">{{ 'accounts.nameRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="account-type" class="text-sm font-medium text-surface-800">
              {{ 'accounts.type' | translate }}
            </label>
            <select id="account-type" class="ui-input" formControlName="type">
              @for (t of types; track t) {
                <option [value]="t">{{ typeLabel(t) }}</option>
              }
            </select>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="account-owner" class="text-sm font-medium text-surface-800">
              {{ 'accounts.owner' | translate }}
            </label>
            <input id="account-owner" class="ui-input" formControlName="ownerLabel" autocomplete="off" />
            @if (form.controls.ownerLabel.touched && form.controls.ownerLabel.invalid) {
              <span class="text-xs text-rose-700">{{ 'accounts.ownerRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="account-opened" class="text-sm font-medium text-surface-800">
              {{ 'accounts.openedOn' | translate }}
            </label>
            <input id="account-opened" class="ui-input" type="date" formControlName="openedOn" [attr.max]="today" />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="account-opening" class="text-sm font-medium text-surface-800">
              {{ 'accounts.openingAmount' | translate }}
            </label>
            <input
              id="account-opening"
              class="ui-input"
              formControlName="openingAmount"
              inputmode="numeric"
              autocomplete="off"
              placeholder="0"
            />
            @if (form.controls.openingAmount.touched && form.controls.openingAmount.errors?.['required']) {
              <span class="text-xs text-rose-700">{{ 'accounts.amountRequired' | translate }}</span>
            }
            @if (form.controls.openingAmount.touched && form.controls.openingAmount.errors?.['pattern']) {
              <span class="text-xs text-rose-700">{{ 'accounts.amountInvalid' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="account-sort" class="text-sm font-medium text-surface-800">
              {{ 'accounts.sort' | translate }}
            </label>
            <input id="account-sort" class="ui-input" type="number" formControlName="sortOrder" />
          </div>

          <app-ui-button
            type="submit"
            [block]="true"
            [loading]="saving()"
            [disabled]="saving() || form.invalid"
          >
            {{ saving() ? ('accounts.saving' | translate) : ('accounts.create' | translate) }}
          </app-ui-button>
        </form>
      }
    </div>
  `,
})
export class AccountFormPage implements OnInit {
  private readonly api = inject(AccountApi);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');
  readonly types: AccountType[] = ['BANK', 'WALLET', 'CASH'];
  readonly today = this.isoToday();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    type: ['CASH' as AccountType, Validators.required],
    ownerLabel: ['', [Validators.required, Validators.maxLength(120)]],
    openedOn: [this.today, Validators.required],
    openingAmount: ['0', [Validators.required, Validators.pattern(/^-?\d+$/)]],
    sortOrder: [0, Validators.required],
  });

  ngOnInit(): void {
    void this.ensureHousehold();
  }

  typeLabel(type: AccountType): string {
    const map: Record<AccountType, string> = {
      BANK: 'accounts.typeBank',
      WALLET: 'accounts.typeWallet',
      CASH: 'accounts.typeCash',
    };
    return this.translate.instant(map[type]);
  }

  submit(): void {
    if (!this.isAdmin() || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);
    this.api
      .create({
        name: raw.name.trim(),
        type: raw.type,
        ownerLabel: raw.ownerLabel.trim(),
        openedOn: raw.openedOn,
        openingAmount: raw.openingAmount.trim(),
        sortOrder: raw.sortOrder ?? 0,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          void this.router.navigateByUrl('/accounts');
        },
        error: () => {
          this.saving.set(false);
          this.error.set(this.translate.instant('accounts.saveError'));
        },
      });
  }

  private async ensureHousehold(): Promise<void> {
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
    } catch {
      this.error.set(this.translate.instant('accounts.loadError'));
    }
  }

  private isoToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
