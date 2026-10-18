import { Component, input } from '@angular/core';

export type UiAlertSeverity = 'error' | 'info' | 'success' | 'warn';

@Component({
  selector: 'app-ui-alert',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div role="alert" [class]="classes()" [attr.aria-live]="severity() === 'error' ? 'assertive' : 'polite'">
      <ng-content />
    </div>
  `,
})
export class UiAlertComponent {
  readonly severity = input<UiAlertSeverity>('info');

  classes(): string {
    const base = 'w-full rounded-lg border px-3 py-2 text-sm';
    const map: Record<UiAlertSeverity, string> = {
      error: 'border-rose-200 bg-rose-50 text-rose-800',
      info: 'border-sky-200 bg-sky-50 text-sky-900',
      success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
      warn: 'border-amber-200 bg-amber-50 text-amber-900',
    };
    return `${base} ${map[this.severity()]}`;
  }
}
