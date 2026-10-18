import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LanguageService } from '../../../core';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';
import { UiSpinnerComponent } from '../../../shared/ui/ui-spinner.component';
import { ExpenseFormComponent } from '../components/expense-form.component';
import { ExpenseApiService } from '../data/expense-api.service';
import { expenseT, type ExpenseMessageKey } from '../data/expense-i18n';
import type {
  AccountOption,
  BeneficiaryOption,
  CategoryOption,
  ExpenseDto,
} from '../data/expense.models';

@Component({
  selector: 'app-expense-create-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    UiButtonComponent,
    UiAlertComponent,
    UiSpinnerComponent,
    ExpenseFormComponent,
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
          <div class="flex justify-center py-16">
            <app-ui-spinner />
          </div>
        } @else if (error()) {
          <div class="flex flex-col gap-3">
            <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
            <app-ui-button (clicked)="load()">{{ label('retry') }}</app-ui-button>
          </div>
        } @else {
          <app-expense-form
            [accounts]="accounts()"
            [categories]="categories()"
            [beneficiaries]="beneficiaries()"
            (saved)="onSaved($event)"
            (cancelled)="goList()"
          />
        }
      </div>
    </div>
  `,
})
export class ExpenseCreatePage implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ExpenseApiService);
  private readonly language = inject(LanguageService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly accounts = signal<AccountOption[]>([]);
  readonly categories = signal<CategoryOption[]>([]);
  readonly beneficiaries = signal<BeneficiaryOption[]>([]);

  ngOnInit(): void {
    this.load();
  }

  label(key: ExpenseMessageKey): string {
    return expenseT(this.language.current(), key);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      accounts: this.api.listAccounts(),
      categories: this.api.listCategories(),
      beneficiaries: this.api.listBeneficiaries(),
    }).subscribe({
      next: ({ accounts, categories, beneficiaries }) => {
        this.accounts.set(accounts);
        this.categories.set(categories);
        this.beneficiaries.set(beneficiaries);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.label('loadError'));
        this.loading.set(false);
      },
    });
  }

  onSaved(_expense: ExpenseDto): void {
    // Stay on create for another entry (mirrors expense-web).
  }

  goList(): void {
    void this.router.navigate(['..'], { relativeTo: this.route });
  }
}
