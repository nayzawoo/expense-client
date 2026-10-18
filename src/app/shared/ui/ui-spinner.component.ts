import { Component } from '@angular/core';

@Component({
  selector: 'app-ui-spinner',
  standalone: true,
  template: `
    <div
      class="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700"
      role="status"
      aria-live="polite"
    >
      <span class="sr-only">Loading</span>
    </div>
  `,
})
export class UiSpinnerComponent {}
