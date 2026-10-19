import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';
import { LanguageSwitcherComponent } from '../../shared/components/language-switcher/language-switcher.component';
import { IconComponent, type AppIconName } from '../../shared/icons/icon.component';
import { UiButtonComponent } from '../../shared/ui/ui-button.component';

interface NavItem {
  path: string;
  labelKey: string;
  icon: AppIconName;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    UiButtonComponent,
    LanguageSwitcherComponent,
    IconComponent,
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly user = this.auth.user;
  readonly household = this.auth.household;
  readonly drawerOpen = signal(false);

  readonly navItems: NavItem[] = [
    { path: '/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard' },
    { path: '/expenses', labelKey: 'nav.expenses', icon: 'wallet' },
    { path: '/incomes', labelKey: 'nav.incomes', icon: 'banknote' },
    { path: '/transfers', labelKey: 'nav.transfers', icon: 'transfer' },
    { path: '/categories', labelKey: 'nav.categories', icon: 'tags' },
    { path: '/beneficiaries', labelKey: 'nav.beneficiaries', icon: 'users' },
    { path: '/accounts', labelKey: 'nav.accounts', icon: 'landmark' },
    { path: '/profile', labelKey: 'nav.profile', icon: 'user' },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.drawerOpen.set(false));
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.drawerOpen.set(false);
  }

  toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => void this.router.navigateByUrl('/login'),
    });
  }
}
