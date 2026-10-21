import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-ui-dialog',
  standalone: true,
  template: `
    <dialog
      #dialogEl
      [class]="
        (size() === 'lg' ? 'w-[min(100%,32rem)] ' : 'w-[min(100%,28rem)] ') +
        'rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-900/40'
      "
      (close)="closed.emit()"
      (click)="onBackdrop($event)"
    >
      <div class="border-b border-slate-200 px-4 py-3">
        <h2 class="text-base font-semibold">{{ title() }}</h2>
      </div>
      <div class="max-h-[min(80dvh,40rem)] overflow-y-auto px-4 py-4" (click)="$event.stopPropagation()">
        <ng-content />
      </div>
    </dialog>
  `,
})
export class UiDialogComponent {
  readonly open = input(false);
  readonly title = input('');
  /** md = 28rem (default); lg = 32rem for taller forms. */
  readonly size = input<'md' | 'lg'>('md');
  readonly closed = output<void>();

  private readonly dialogRef = viewChild<ElementRef<HTMLDialogElement>>('dialogEl');

  constructor() {
    effect(() => {
      const el = this.dialogRef()?.nativeElement;
      if (!el) {
        return;
      }
      if (this.open()) {
        if (!el.open) {
          el.showModal();
        }
      } else if (el.open) {
        el.close();
      }
    });
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialogRef()?.nativeElement) {
      this.closed.emit();
    }
  }
}
