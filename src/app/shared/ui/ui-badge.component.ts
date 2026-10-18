import { Component, input } from '@angular/core';

export type UiBadgeSeverity = 'success' | 'secondary' | 'warn';

@Component({
  selector: 'app-ui-badge',
  standalone: true,
  template: `
    <span [class]="classes()">{{ value() }}</span>
  `,
})
export class UiBadgeComponent {
  readonly value = input.required<string>();
  readonly severity = input<UiBadgeSeverity>('secondary');

  classes(): string {
    const base =
      'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tracking-wide';
    const map: Record<UiBadgeSeverity, string> = {
      success: 'bg-emerald-100 text-emerald-800',
      secondary: 'bg-slate-100 text-slate-600',
      warn: 'bg-amber-100 text-amber-900',
    };
    return `${base} ${map[this.severity()]}`;
  }
}
