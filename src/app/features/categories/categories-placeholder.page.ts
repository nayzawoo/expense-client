import { Component } from '@angular/core';
import { PagePlaceholderComponent } from '../../shared';

@Component({
  selector: 'app-categories-placeholder-page',
  standalone: true,
  imports: [PagePlaceholderComponent],
  template: `<app-page-placeholder messageKey="placeholder.categories" />`,
})
export class CategoriesPlaceholderPage {}
