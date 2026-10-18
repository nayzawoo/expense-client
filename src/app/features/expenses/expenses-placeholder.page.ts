import { Component } from '@angular/core';
import { PagePlaceholderComponent } from '../../shared';

@Component({
  selector: 'app-expenses-placeholder-page',
  standalone: true,
  imports: [PagePlaceholderComponent],
  template: `<app-page-placeholder messageKey="placeholder.expenses" />`,
})
export class ExpensesPlaceholderPage {}
