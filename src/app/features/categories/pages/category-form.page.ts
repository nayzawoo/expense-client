import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../core';
import { IconComponent } from '../../../shared/icons/icon.component';
import { UiAlertComponent } from '../../../shared/ui/ui-alert.component';
import { UiButtonComponent } from '../../../shared/ui/ui-button.component';
import { UiSkeletonComponent } from '../../../shared/ui/ui-skeleton.component';
import { CategoryApi } from '../data/category.api';
import { Category } from '../data/category.models';

@Component({
  selector: 'app-category-form-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslatePipe,
    IconComponent,
    UiButtonComponent,
    UiAlertComponent,
    UiSkeletonComponent,
  ],
  template: `
    <div class="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <header class="flex flex-wrap items-start gap-3">
        <a
          routerLink="/categories"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
          [attr.aria-label]="'categories.back' | translate"
        >
          <app-icon name="arrow-left" />
        </a>
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ (isEdit() ? 'categories.editTitle' : 'categories.createTitle') | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            {{ (isEdit() ? 'categories.editSubtitle' : 'categories.createSubtitle') | translate }}
          </p>
        </div>
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="warn">{{ 'categories.readOnly' | translate }}</app-ui-alert>
      } @else if (loading()) {
        <app-ui-skeleton height="16rem" width="100%" />
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
            <label for="category-name" class="text-sm font-medium text-surface-800">
              {{ 'categories.name' | translate }}
            </label>
            <input
              id="category-name"
              class="ui-input"
              formControlName="name"
              autocomplete="off"
            />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <span class="text-xs text-red-600">{{ 'categories.nameRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="category-color" class="text-sm font-medium text-surface-800">
              {{ 'categories.color' | translate }}
            </label>
            <div class="flex items-center gap-3">
              <input
                id="category-color"
                type="color"
                formControlName="color"
                class="h-10 w-20 cursor-pointer rounded-md border border-surface-200 bg-surface-0 p-1"
              />
              <p class="text-xs text-surface-500">{{ 'categories.colorHint' | translate }}</p>
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="category-sort" class="text-sm font-medium text-surface-800">
              {{ 'categories.sort' | translate }}
            </label>
            <input
              id="category-sort"
              class="ui-input"
              type="number"
              formControlName="sortOrder"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="category-icon" class="text-sm font-medium text-surface-800">
              {{ 'categories.icon' | translate }}
            </label>
            <div class="flex items-center gap-3">
              <input
                id="category-icon"
                class="ui-input"
                formControlName="iconKey"
                autocomplete="off"
              />
              <span
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-200 text-sm font-semibold"
                [style.color]="form.controls.color.value"
                [style.background]="form.controls.color.value + '22'"
              >
                {{ (form.controls.name.value || '?').slice(0, 1) }}
              </span>
            </div>
            <p class="text-[10px] text-surface-500">{{ 'categories.iconHint' | translate }}</p>
          </div>

          <app-ui-button type="submit" [block]="true" [disabled]="saving() || form.invalid" [loading]="saving()">
            {{
              saving()
                ? ('categories.saving' | translate)
                : ((isEdit() ? 'categories.save' : 'categories.create') | translate)
            }}
          </app-ui-button>
        </form>
      }
    </div>
  `,
})
export class CategoryFormPage implements OnInit {
  private readonly api = inject(CategoryApi);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly categoryId = signal<string | null>(null);
  readonly isEdit = computed(() => this.categoryId() !== null);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    color: ['#AABBCC', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
    iconKey: ['food', [Validators.required, Validators.maxLength(64)]],
    sortOrder: [0, [Validators.required]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    void this.bootstrap(id);
  }

  private async bootstrap(id: string | null): Promise<void> {
    try {
      if (!this.auth.household()) {
        await firstValueFrom(this.auth.loadHousehold());
      }
    } catch {
      this.error.set(this.translate.instant('categories.loadError'));
      return;
    }

    if (!id) {
      return;
    }

    this.categoryId.set(id);
    this.loading.set(true);
    try {
      const category = await firstValueFrom(this.api.get(id));
      this.patch(category);
    } catch {
      this.error.set(this.translate.instant('categories.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  private patch(category: Category): void {
    this.form.setValue({
      name: category.name,
      color: category.color.startsWith('#') ? category.color : `#${category.color}`,
      iconKey: category.iconKey,
      sortOrder: category.sortOrder,
    });
  }

  submit(): void {
    if (!this.isAdmin() || this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name.trim(),
      color: raw.color.toUpperCase(),
      iconKey: raw.iconKey.trim(),
      sortOrder: raw.sortOrder ?? 0,
    };

    this.saving.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.api.update(this.categoryId()!, payload)
      : this.api.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/categories');
      },
      error: () => {
        this.saving.set(false);
        this.error.set(this.translate.instant('categories.saveError'));
      },
    });
  }
}
