import { Component, input, output } from '@angular/core';

export type UiButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type UiButtonSize = 'sm' | 'md';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  host: { class: 'inline-flex' },
  template: `
    <button
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-label]="ariaLabel() || null"
      [attr.title]="title() || null"
      [class]="classes()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <span
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class UiButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<UiButtonVariant>('primary');
  readonly size = input<UiButtonSize>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly block = input(false);
  readonly ariaLabel = input('');
  readonly title = input('');
  readonly clicked = output<MouseEvent>();

  classes(): string {
    const base =
      'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-60';
    const sizes = this.size() === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm';
    const width = this.block() ? 'w-full' : '';
    const variants: Record<UiButtonVariant, string> = {
      primary: 'bg-teal-700 text-white hover:bg-teal-800',
      secondary:
        'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
      danger: 'bg-rose-700 text-white hover:bg-rose-800',
      ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    };
    return [base, sizes, width, variants[this.variant()]].filter(Boolean).join(' ');
  }
}
