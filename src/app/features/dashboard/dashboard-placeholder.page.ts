import { Component } from '@angular/core';
import { PagePlaceholderComponent } from '../../shared';

@Component({
  selector: 'app-dashboard-placeholder-page',
  standalone: true,
  imports: [PagePlaceholderComponent],
  template: `<app-page-placeholder messageKey="placeholder.dashboard" />`,
})
export class DashboardPlaceholderPage {}
