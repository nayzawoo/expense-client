import { Component, input } from '@angular/core';

export type AppIconName =
  | 'plus'
  | 'search'
  | 'pencil'
  | 'trash'
  | 'arrow-left'
  | 'archive'
  | 'restore';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.class]="svgClass()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        }
        @case ('pencil') {
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
        }
        @case ('trash') {
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        }
        @case ('arrow-left') {
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        }
        @case ('archive') {
          <path d="M3 6h18v3H3z" />
          <path d="M5 9v10h14V9" />
          <path d="M10 13h4" />
        }
        @case ('restore') {
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<AppIconName>();
  readonly sizeClass = input('h-4 w-4');

  svgClass(): string {
    return `${this.sizeClass()} shrink-0`;
  }
}
