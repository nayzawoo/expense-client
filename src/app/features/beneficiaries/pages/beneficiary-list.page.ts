import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { IconComponent } from '../../../shared/icons/icon.component';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiBadgeComponent } from '../../../shared/ui/ui-badge.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';
import { UiSkeletonComponent } from '../../../shared/ui/ui-skeleton.component';
import { BeneficiaryApi } from '../data/beneficiary.api';
import { Beneficiary, BeneficiaryKind, BeneficiaryStatus } from '../data/beneficiary.models';

@Component({
  selector: 'app-beneficiary-list-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    IconComponent,
    UiButtonComponent,
    UiBadgeComponent,
    UiSkeletonComponent,
    UiAlertComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ 'beneficiaries.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            {{ 'beneficiaries.subtitle' | translate }}
          </p>
        </div>
        @if (isAdmin()) {
          <a
            routerLink="new"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-contrast no-underline hover:bg-primary-600"
          >
            <app-icon name="plus" />
            {{ 'beneficiaries.add' | translate }}
          </a>
        }
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="info">{{ 'beneficiaries.readOnly' | translate }}</app-ui-alert>
      }

      <div class="inline-flex flex-wrap gap-1 rounded-lg border border-surface-200 bg-surface-0 p-1" role="group">
        @for (opt of filterOptions(); track opt.value) {
          <button
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-semibold transition-colors"
            [class.bg-teal-700]="statusFilter === opt.value"
            [class.text-white]="statusFilter === opt.value"
            [class.text-surface-600]="statusFilter !== opt.value"
            [attr.aria-pressed]="statusFilter === opt.value"
            (click)="setFilter(opt.value)"
          >
            {{ opt.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="flex flex-col gap-3">
          <app-ui-skeleton height="2.5rem" />
          <app-ui-skeleton height="2.5rem" />
          <app-ui-skeleton height="2.5rem" />
        </div>
      } @else if (error()) {
        <app-ui-alert severity="error">{{ error() }}</app-ui-alert>
      } @else {
        <div class="flex flex-col gap-3 md:hidden">
          @if (rows().length === 0) {
            <p class="py-8 text-center text-sm text-surface-500">
              {{ 'beneficiaries.empty' | translate }}
            </p>
          }
          @for (b of rows(); track b.id) {
            <article
              class="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3"
            >
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700/10 text-sm font-semibold text-teal-800"
                >{{ b.name.slice(0, 1) }}</span
              >
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-surface-900">{{ b.name }}</p>
                <p class="text-xs text-surface-500">
                  {{ kindLabel(b.kind) }} · #{{ b.sortOrder }}
                </p>
              </div>
              <app-ui-badge
                [value]="b.status"
                [severity]="b.status === 'ACTIVE' ? 'success' : 'secondary'"
              />
              @if (isAdmin()) {
                <div class="flex shrink-0 gap-1">
                  <a
                    [routerLink]="[b.id, 'edit']"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
                    [attr.aria-label]="'beneficiaries.editTitle' | translate"
                  >
                    <app-icon name="pencil" />
                  </a>
                  <app-ui-button
                    variant="ghost"
                    size="sm"
                    [title]="
                      (b.status === 'ACTIVE' ? 'beneficiaries.archive' : 'beneficiaries.restore')
                        | translate
                    "
                    [ariaLabel]="
                      (b.status === 'ACTIVE' ? 'beneficiaries.archive' : 'beneficiaries.restore')
                        | translate
                    "
                    (clicked)="toggleStatus(b)"
                  >
                    <app-icon [name]="b.status === 'ACTIVE' ? 'archive' : 'restore'" />
                  </app-ui-button>
                </div>
              }
            </article>
          }
        </div>

        <div class="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-0 md:block">
          <table class="min-w-[40rem] w-full border-collapse text-left text-sm">
            <thead class="border-b border-surface-200 bg-surface-50 text-xs uppercase tracking-wide text-surface-500">
              <tr>
                <th class="px-4 py-3 font-semibold" style="width: 4rem">#</th>
                <th class="px-4 py-3 font-semibold">{{ 'beneficiaries.name' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'beneficiaries.kind' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'beneficiaries.status' | translate }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ 'beneficiaries.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @if (rows().length === 0) {
                <tr>
                  <td colspan="5" class="px-4 py-8 text-center text-surface-500">
                    {{ 'beneficiaries.empty' | translate }}
                  </td>
                </tr>
              }
              @for (b of rows(); track b.id) {
                <tr class="border-b border-surface-100 last:border-0">
                  <td class="px-4 py-3 font-mono text-xs text-surface-500">{{ b.sortOrder }}</td>
                  <td class="px-4 py-3 font-medium">{{ b.name }}</td>
                  <td class="px-4 py-3 text-surface-700">{{ kindLabel(b.kind) }}</td>
                  <td class="px-4 py-3">
                    <app-ui-badge
                      [value]="b.status"
                      [severity]="b.status === 'ACTIVE' ? 'success' : 'secondary'"
                    />
                  </td>
                  <td class="px-4 py-3 text-right">
                    @if (isAdmin()) {
                      <div class="inline-flex gap-1">
                        <a
                          [routerLink]="[b.id, 'edit']"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-600 no-underline hover:bg-surface-100"
                          [attr.aria-label]="'beneficiaries.editTitle' | translate"
                        >
                          <app-icon name="pencil" />
                        </a>
                        <app-ui-button
                          variant="ghost"
                          size="sm"
                          [title]="
                            (b.status === 'ACTIVE' ? 'beneficiaries.archive' : 'beneficiaries.restore')
                              | translate
                          "
                          [ariaLabel]="
                            (b.status === 'ACTIVE' ? 'beneficiaries.archive' : 'beneficiaries.restore')
                              | translate
                          "
                          (clicked)="toggleStatus(b)"
                        >
                          <app-icon [name]="b.status === 'ACTIVE' ? 'archive' : 'restore'" />
                        </app-ui-button>
                      </div>
                    }
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
export class BeneficiaryListPage implements OnInit {
  private readonly api = inject(BeneficiaryApi);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<Beneficiary[]>([]);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  statusFilter: BeneficiaryStatus | 'ALL' = 'ACTIVE';

  readonly filterOptions = computed(() => [
    { label: this.translate.instant('beneficiaries.filterActive'), value: 'ACTIVE' as const },
    { label: this.translate.instant('beneficiaries.filterArchived'), value: 'ARCHIVED' as const },
    { label: this.translate.instant('beneficiaries.filterAll'), value: 'ALL' as const },
  ]);

  ngOnInit(): void {
    void this.ensureHouseholdThenReload();
  }

  kindLabel(kind: BeneficiaryKind): string {
    const key =
      kind === 'PERSON'
        ? 'beneficiaries.kindPerson'
        : kind === 'HOUSEHOLD'
          ? 'beneficiaries.kindHousehold'
          : 'beneficiaries.kindOther';
    return this.translate.instant(key);
  }

  setFilter(value: BeneficiaryStatus | 'ALL'): void {
    this.statusFilter = value;
    void this.reload();
  }

  async ensureHouseholdThenReload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
      await this.reload();
    } catch {
      this.error.set(this.translate.instant('beneficiaries.loadError'));
      this.loading.set(false);
    }
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const list = await firstValueFrom(this.api.list(this.statusFilter));
      this.rows.set(list);
    } catch {
      this.error.set(this.translate.instant('beneficiaries.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(beneficiary: Beneficiary): Promise<void> {
    if (!this.isAdmin()) {
      return;
    }
    const next: BeneficiaryStatus = beneficiary.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    if (next === 'ARCHIVED' && !confirm(this.translate.instant('beneficiaries.confirmArchive'))) {
      return;
    }
    try {
      await firstValueFrom(this.api.updateStatus(beneficiary.id, { status: next }));
      await this.reload();
    } catch {
      this.error.set(this.translate.instant('beneficiaries.statusError'));
    }
  }
}
