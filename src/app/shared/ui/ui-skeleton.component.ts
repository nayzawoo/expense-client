import { Component, input } from '@angular/core';

@Component({
  selector: 'app-ui-skeleton',
  standalone: true,
  template: `
    <div
      class="animate-pulse rounded-md bg-slate-200"
      [style.height]="height()"
      [style.width]="width()"
      aria-hidden="true"
    ></div>
  `,
})
export class UiSkeletonComponent {
  readonly height = input('1rem');
  readonly width = input('100%');
}
