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
import { BeneficiaryApi } from '../data/beneficiary.api';
import { Beneficiary, BeneficiaryKind } from '../data/beneficiary.models';

@Component({
  selector: 'app-beneficiary-form-page',
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
          routerLink="/beneficiaries"
          class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-surface-200 text-surface-600 no-underline"
          [attr.aria-label]="'beneficiaries.back' | translate"
        >
          <app-icon name="arrow-left" />
        </a>
        <div>
          <h1 class="text-xl font-semibold text-surface-900 md:text-2xl">
            {{ (isEdit() ? 'beneficiaries.editTitle' : 'beneficiaries.createTitle') | translate }}
          </h1>
          <p class="mt-1 text-sm text-surface-600">
            {{
              (isEdit() ? 'beneficiaries.editSubtitle' : 'beneficiaries.createSubtitle') | translate
            }}
          </p>
        </div>
      </header>

      @if (!isAdmin()) {
        <app-ui-alert severity="warn">{{ 'beneficiaries.readOnly' | translate }}</app-ui-alert>
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
            <label for="beneficiary-name" class="text-sm font-medium text-surface-800">
              {{ 'beneficiaries.name' | translate }}
            </label>
            <input
              id="beneficiary-name"
              class="ui-input"
              formControlName="name"
              autocomplete="off"
            />
            @if (form.controls.name.touched && form.controls.name.invalid) {
              <span class="text-xs text-red-600">{{ 'beneficiaries.nameRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="beneficiary-kind" class="text-sm font-medium text-surface-800">
              {{ 'beneficiaries.kind' | translate }}
            </label>
            <select id="beneficiary-kind" class="ui-input" formControlName="kind">
              @for (opt of kindOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.labelKey | translate }}</option>
              }
            </select>
            @if (form.controls.kind.touched && form.controls.kind.invalid) {
              <span class="text-xs text-red-600">{{ 'beneficiaries.kindRequired' | translate }}</span>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label for="beneficiary-sort" class="text-sm font-medium text-surface-800">
              {{ 'beneficiaries.sort' | translate }}
            </label>
            <input
              id="beneficiary-sort"
              class="ui-input"
              type="number"
              formControlName="sortOrder"
            />
          </div>

          <app-ui-button type="submit" [block]="true" [disabled]="saving() || form.invalid" [loading]="saving()">
            {{
              saving()
                ? ('beneficiaries.saving' | translate)
                : ((isEdit() ? 'beneficiaries.save' : 'beneficiaries.create') | translate)
            }}
          </app-ui-button>
        </form>
      }
    </div>
  `,
})
export class BeneficiaryFormPage implements OnInit {
  private readonly api = inject(BeneficiaryApi);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly beneficiaryId = signal<string | null>(null);
  readonly isEdit = computed(() => this.beneficiaryId() !== null);
  readonly isAdmin = computed(() => this.auth.user()?.role === 'ADMIN');

  readonly kindOptions: Array<{ value: BeneficiaryKind; labelKey: string }> = [
    { value: 'PERSON', labelKey: 'beneficiaries.kindPerson' },
    { value: 'HOUSEHOLD', labelKey: 'beneficiaries.kindHousehold' },
    { value: 'OTHER', labelKey: 'beneficiaries.kindOther' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    kind: ['PERSON' as BeneficiaryKind, [Validators.required]],
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
      this.error.set(this.translate.instant('beneficiaries.loadError'));
      return;
    }

    if (!id) {
      return;
    }

    this.beneficiaryId.set(id);
    this.loading.set(true);
    try {
      const beneficiary = await firstValueFrom(this.api.get(id));
      this.patch(beneficiary);
    } catch {
      this.error.set(this.translate.instant('beneficiaries.loadError'));
    } finally {
      this.loading.set(false);
    }
  }

  private patch(beneficiary: Beneficiary): void {
    this.form.setValue({
      name: beneficiary.name,
      kind: beneficiary.kind,
      sortOrder: beneficiary.sortOrder,
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
      kind: raw.kind,
      sortOrder: raw.sortOrder ?? 0,
    };

    this.saving.set(true);
    this.error.set(null);

    const request$ = this.isEdit()
      ? this.api.update(this.beneficiaryId()!, payload)
      : this.api.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/beneficiaries');
      },
      error: () => {
        this.saving.set(false);
        this.error.set(this.translate.instant('beneficiaries.saveError'));
      },
    });
  }
}
