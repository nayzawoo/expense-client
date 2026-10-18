import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-ui-toast',
  standalone: true,
  template: `
    <div
      class="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2"
      aria-live="polite"
    >
      @for (msg of toast.messages(); track msg.id) {
        <div
          class="pointer-events-auto rounded-lg border px-3 py-2 text-sm shadow-md"
          [class]="
            msg.severity === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : msg.severity === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-900'
                : 'border-sky-200 bg-sky-50 text-sky-900'
          "
          role="status"
        >
          {{ msg.summary }}
        </div>
      }
    </div>
  `,
})
export class UiToastComponent {
  readonly toast = inject(ToastService);
}
