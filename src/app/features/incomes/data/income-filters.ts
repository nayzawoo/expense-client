import {
  DATE_PRESET_OPTIONS,
  dateHeading,
  presetLabel,
  resolveDateRange,
} from '../../expenses/data/expense-filters';
import type { DatePreset, ExpenseListFilters } from '../../expenses/data/expense.models';
import type { IncomeDto, IncomeListFilters } from './income.models';

export { DATE_PRESET_OPTIONS, dateHeading, presetLabel };

export function defaultIncomeFilters(): IncomeListFilters {
  return {
    search: '',
    datePreset: 'this_month',
    dateFrom: null,
    dateTo: null,
    accountId: null,
    beneficiaryId: null,
  };
}

export function filterIncomes(items: IncomeDto[], filters: IncomeListFilters): IncomeDto[] {
  const expenseLike: ExpenseListFilters = {
    ...filters,
    categoryId: null,
  };
  const { from, to } = resolveDateRange(expenseLike);
  const q = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (from && item.effectiveDate < from) {
      return false;
    }
    if (to && item.effectiveDate > to) {
      return false;
    }
    if (filters.accountId && item.account.id !== filters.accountId) {
      return false;
    }
    if (filters.beneficiaryId && item.beneficiary.id !== filters.beneficiaryId) {
      return false;
    }
    if (q) {
      const hay = [item.account.name, item.beneficiary.name, item.note ?? '', item.amount]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function groupByDate(items: IncomeDto[]): Array<[string, IncomeDto[]]> {
  const map = new Map<string, IncomeDto[]>();
  for (const item of items) {
    const list = map.get(item.effectiveDate) ?? [];
    list.push(item);
    map.set(item.effectiveDate, list);
  }
  return [...map.entries()];
}

export function sumAmounts(items: IncomeDto[]): string {
  let total = 0n;
  for (const item of items) {
    const cleaned = item.amount.replace(/[^\d-]/g, '') || '0';
    total += BigInt(cleaned);
  }
  return total.toString();
}

export type { DatePreset };
