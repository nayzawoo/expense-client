import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { CategoryApi } from '../data/category.api';
import { Category, CategoryStatus } from '../data/category.models';

@Component({
  selector: 'app-category-list-page',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    TableModule,
    Button,
    Tag,
    Skeleton,
    Message,
    SelectButton,
    Tooltip,
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
            <i class="pi pi-plus text-sm"></i>
            {{ 'categories.add' | translate }}
          </a>
        }
      </header>

      @if (!isAdmin()) {
        <p-message severity="info" styleClass="w-full">{{ 'categories.readOnly' | translate }}</p-message>
      }

      <p-selectbutton
        [options]="filterOptions()"
        [(ngModel)]="statusFilter"
        (ngModelChange)="reload()"
        optionLabel="label"
        optionValue="value"
        [allowEmpty]="false"
      />

      @if (loading()) {
        <div class="flex flex-col gap-3">
          <p-skeleton height="2.5rem" />
          <p-skeleton height="2.5rem" />
          <p-skeleton height="2.5rem" />
        </div>
      } @else if (error()) {
        <p-message severity="error" styleClass="w-full">{{ error() }}</p-message>
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
              <p-tag
                [value]="c.status"
                [severity]="c.status === 'ACTIVE' ? 'success' : 'secondary'"
              />
              @if (isAdmin()) {
                <div class="flex shrink-0 gap-1">
                  <a
                    [routerLink]="[c.id, 'edit']"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
                  >
                    <i class="pi pi-pencil text-sm"></i>
                  </a>
                  <p-button
                    [icon]="c.status === 'ACTIVE' ? 'pi pi-inbox' : 'pi pi-refresh'"
                    [rounded]="true"
                    [text]="true"
                    severity="secondary"
                    (onClick)="toggleStatus(c)"
                    [pTooltip]="
                      (c.status === 'ACTIVE' ? 'categories.archive' : 'categories.restore')
                        | translate
                    "
                  />
                </div>
              }
            </article>
          }
        </div>

        <div class="hidden overflow-hidden rounded-xl border border-surface-200 bg-surface-0 md:block">
          <p-table [value]="rows()" [tableStyle]="{ 'min-width': '40rem' }">
            <ng-template #header>
              <tr>
                <th style="width: 4rem">#</th>
                <th>{{ 'categories.name' | translate }}</th>
                <th class="text-center">{{ 'categories.color' | translate }}</th>
                <th>{{ 'categories.icon' | translate }}</th>
                <th>{{ 'categories.status' | translate }}</th>
                <th class="text-right">{{ 'categories.actions' | translate }}</th>
              </tr>
            </ng-template>
            <ng-template #body let-c>
              <tr>
                <td class="font-mono text-xs text-surface-500">{{ c.sortOrder }}</td>
                <td class="font-medium">{{ c.name }}</td>
                <td>
                  <div class="flex justify-center">
                    <span
                      class="flex h-8 w-8 items-center justify-center rounded-lg border border-surface-200"
                      [style.color]="c.color"
                      [title]="c.color"
                      >●</span
                    >
                  </div>
                </td>
                <td class="font-mono text-xs text-surface-500">{{ c.iconKey }}</td>
                <td>
                  <p-tag
                    [value]="c.status"
                    [severity]="c.status === 'ACTIVE' ? 'success' : 'secondary'"
                  />
                </td>
                <td class="text-right">
                  @if (isAdmin()) {
                    <div class="inline-flex gap-1">
                      <a
                        [routerLink]="[c.id, 'edit']"
                        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-surface-600 no-underline hover:bg-surface-100"
                      >
                        <i class="pi pi-pencil text-sm"></i>
                      </a>
                      <p-button
                        [icon]="c.status === 'ACTIVE' ? 'pi pi-inbox' : 'pi pi-refresh'"
                        [rounded]="true"
                        [text]="true"
                        severity="secondary"
                        (onClick)="toggleStatus(c)"
                        [pTooltip]="
                          (c.status === 'ACTIVE' ? 'categories.archive' : 'categories.restore')
                            | translate
                        "
                      />
                    </div>
                  }
                </td>
              </tr>
            </ng-template>
            <ng-template #emptymessage>
              <tr>
                <td colspan="6" class="py-8 text-center text-surface-500">
                  {{ 'categories.empty' | translate }}
                </td>
              </tr>
            </ng-template>
          </p-table>
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
