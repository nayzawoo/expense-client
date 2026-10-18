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
import { CategoryApi } from '../data/category.api';
import { Category, CategoryStatus } from '../data/category.models';

@Component({
  selector: 'app-category-list-page',
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
            {{ 'categories.title' | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            {{ 'categories.subtitle' | translate }}
          </p>
        </div>
        @if (isAdmin()) {
          <a
            routerLink="new"
            class="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-primary-contrast no-underline hover:bg-primary-600"
          >
            <app-icon name="plus" />
            {{ 'categories.add' | translate }}
          </a>
        }
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="info">{{ 'categories.readOnly' | translate }}</app-ui-alert>
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
              {{ 'categories.empty' | translate }}
            </p>
          }
          @for (c of rows(); track c.id) {
            <article
              class="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3"
            >
              <span
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                [style.background]="c.color + '22'"
                [style.color]="c.color"
                >{{ c.name.slice(0, 1) }}</span
              >
              <div class="min-w-0 flex-1">
                <p class="truncate font-medium text-surface-900">{{ c.name }}</p>
                <p class="text-xs text-surface-500">{{ c.iconKey }} · #{{ c.sortOrder }}</p>
              </div>
              <app-ui-badge
                [value]="c.status"
                [severity]="c.status === 'ACTIVE' ? 'success' : 'secondary'"
              />
              @if (isAdmin()) {
                <div class="flex shrink-0 gap-1">
                  <a
                    [routerLink]="[c.id, 'edit']"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
                    [attr.aria-label]="'categories.editTitle' | translate"
                  >
                    <app-icon name="pencil" />
                  </a>
                  <app-ui-button
                    variant="ghost"
                    size="sm"
                    [title]="
                      (c.status === 'ACTIVE' ? 'categories.archive' : 'categories.restore')
                        | translate
                    "
                    [ariaLabel]="
                      (c.status === 'ACTIVE' ? 'categories.archive' : 'categories.restore')
                        | translate
                    "
                    (clicked)="toggleStatus(c)"
                  >
                    <app-icon [name]="c.status === 'ACTIVE' ? 'archive' : 'restore'" />
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
                <th class="px-4 py-3 font-semibold">{{ 'categories.name' | translate }}</th>
                <th class="px-4 py-3 text-center font-semibold">{{ 'categories.color' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'categories.icon' | translate }}</th>
                <th class="px-4 py-3 font-semibold">{{ 'categories.status' | translate }}</th>
                <th class="px-4 py-3 text-right font-semibold">{{ 'categories.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @if (rows().length === 0) {
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-surface-500">
                    {{ 'categories.empty' | translate }}
                  </td>
                </tr>
              }
              @for (c of rows(); track c.id) {
                <tr class="border-b border-surface-100 last:border-0">
                  <td class="px-4 py-3 font-mono text-xs text-surface-500">{{ c.sortOrder }}</td>
                  <td class="px-4 py-3 font-medium">{{ c.name }}</td>
                  <td class="px-4 py-3">
                    <div class="flex justify-center">
                      <span
                        class="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200"
                        [style.color]="c.color"
                        [title]="c.color"
                        >●</span
                      >
                    </div>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs text-surface-500">{{ c.iconKey }}</td>
                  <td class="px-4 py-3">
                    <app-ui-badge
                      [value]="c.status"
                      [severity]="c.status === 'ACTIVE' ? 'success' : 'secondary'"
                    />
                  </td>
                  <td class="px-4 py-3 text-right">
                    @if (isAdmin()) {
                      <div class="inline-flex gap-1">
                        <a
                          [routerLink]="[c.id, 'edit']"
                          class="inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-600 no-underline hover:bg-surface-100"
                          [attr.aria-label]="'categories.editTitle' | translate"
                        >
                          <app-icon name="pencil" />
                        </a>
                        <app-ui-button
                          variant="ghost"
                          size="sm"
                          [title]="
                            (c.status === 'ACTIVE' ? 'categories.archive' : 'categories.restore')
                              | translate
                          "
                          [ariaLabel]="
                            (c.status === 'ACTIVE' ? 'categories.archive' : 'categories.restore')
                              | translate
                          "
                          (clicked)="toggleStatus(c)"
                        >
                          <app-icon [name]="c.status === 'ACTIVE' ? 'archive' : 'restore'" />
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
export class CategoryListPage implements OnInit {
  private readonly api = inject(CategoryApi);
  private readonly auth = inject(AuthService);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly rows = signal<Category[]>([]);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  statusFilter: CategoryStatus | 'ALL' = 'ACTIVE';

  readonly filterOptions = computed(() => [
    { label: this.translate.instant('categories.filterActive'), value: 'ACTIVE' as const },
    { label: this.translate.instant('categories.filterArchived'), value: 'ARCHIVED' as const },
    { label: this.translate.instant('categories.filterAll'), value: 'ALL' as const },
  ]);

  ngOnInit(): void {
    void this.ensureHouseholdThenReload();
  }

  setFilter(value: CategoryStatus | 'ALL'): void {
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
      this.error.set(this.translate.instant('categories.loadError'));
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
      this.error.set(this.translate.instant('categories.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  async toggleStatus(category: Category): Promise<void> {
    if (!this.isAdmin()) {
      return;
    }
    const next: CategoryStatus = category.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    if (next === 'ARCHIVED' && !confirm(this.translate.instant('categories.confirmArchive'))) {
      return;
    }
    try {
      await firstValueFrom(this.api.updateStatus(category.id, { status: next }));
      await this.reload();
    } catch {
      this.error.set(this.translate.instant('categories.statusError'));
    }
  }
}
