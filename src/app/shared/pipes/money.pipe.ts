import { Pipe, PipeTransform } from '@angular/core';

/**
 * Western digits + whole-unit grouping, e.g. `1,000 MMK`.
 * Preserves the input money string for display; does not parse floats.
 */
@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(amount: string | null | undefined, currency = 'MMK'): string {
    if (amount == null || amount === '') {
      return `— ${currency}`;
    }
    const negative = amount.startsWith('-');
    const raw = negative ? amount.slice(1) : amount;
    const [whole, fraction] = raw.split('.');
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const body = fraction != null && fraction !== '' ? `${grouped}.${fraction}` : grouped;
    return `${negative ? '-' : ''}${body} ${currency}`;
  }
}
