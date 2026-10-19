import { Component, computed, input } from '@angular/core';
import { LucideDynamicIcon } from '@lucide/angular';
import { categoryLucideName } from './lucide-icons';

export type AppIconName =
  | 'plus'
  | 'search'
  | 'pencil'
  | 'trash'
  | 'arrow-left'
  | 'archive'
  | 'restore'
  | 'menu'
  | 'x'
  | 'dashboard'
  | 'wallet'
  | 'banknote'
  | 'transfer'
  | 'tags'
  | 'users'
  | 'user-cog'
  | 'key'
  | 'landmark'
  | 'user'
  | 'logout'
  | 'category';

const NAME_MAP: Record<Exclude<AppIconName, 'category'>, string> = {
  plus: 'plus',
  search: 'search',
  pencil: 'pencil',
  trash: 'trash',
  'arrow-left': 'arrow-left',
  archive: 'archive',
  restore: 'archive-restore',
  menu: 'menu',
  x: 'x',
  dashboard: 'layout-dashboard',
  wallet: 'wallet',
  banknote: 'banknote',
  transfer: 'arrow-left-right',
  tags: 'tags',
  users: 'users',
  'user-cog': 'user-cog',
  key: 'key-round',
  landmark: 'landmark',
  user: 'user',
  logout: 'log-out',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideDynamicIcon],
  template: `
    <svg
      lucideIcon
      [lucideIcon]="lucideName()"
      [size]="pixelSize()"
      [strokeWidth]="2"
      [attr.class]="svgClass()"
      aria-hidden="true"
    ></svg>
  `,
})
export class IconComponent {
  readonly name = input.required<AppIconName>();
  /** Category API iconKey when name is `'category'`. */
  readonly categoryKey = input<string | null>(null);
  readonly sizeClass = input('h-4 w-4');
  readonly size = input<number | null>(null);

  readonly lucideName = computed(() => {
    const name = this.name();
    if (name === 'category') {
      return categoryLucideName(this.categoryKey());
    }
    return NAME_MAP[name];
  });

  readonly pixelSize = computed(() => {
    if (this.size() != null) {
      return this.size()!;
    }
    // Tailwind size classes used across the app map to 16px by default.
    return 16;
  });

  svgClass(): string {
    return `${this.sizeClass()} shrink-0`;
  }
}
