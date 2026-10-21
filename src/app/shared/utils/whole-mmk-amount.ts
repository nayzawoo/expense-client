import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Whole MMK principal: ASCII digits only, no leading zeros, at least 1.
 * Matches expense-api Money.parsePositivePrincipal for ordinary create.
 */
export const WHOLE_MMK_AMOUNT_PATTERN = /^[1-9]\d*$/;

export function wholeMmkAmountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value;
    if (raw == null || String(raw).trim() === '') {
      return null;
    }
    return WHOLE_MMK_AMOUNT_PATTERN.test(String(raw).trim())
      ? null
      : { wholeMmkAmount: true };
  };
}
