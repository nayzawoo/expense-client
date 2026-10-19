import {
  DATE_PRESET_OPTIONS,
  dateHeading,
  presetLabel,
  resolveDateRange,
} from '../../expenses/data/expense-filters';
import type { ExpenseListFilters } from '../../expenses/data/expense.models';
import type { AdjustmentDto, AdjustmentListFilters, DatePreset } from './adjustment.models';

export { DATE_PRESET_OPTIONS, dateHeading, presetLabel };
export type { DatePreset };

export function defaultAdjustmentFilters(): AdjustmentListFilters {
  return {
    search: '',
    datePreset: 'this_month',
    dateFrom: null,
    dateTo: null,
    accountId: null,
  };
}

export function filterAdjustments(
  items: AdjustmentDto[],
  filters: AdjustmentListFilters,
): AdjustmentDto[] {
  const expenseLike: ExpenseListFilters = {
    search: filters.search,
    datePreset: filters.datePreset,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    categoryId: null,
    accountId: null,
    beneficiaryId: null,
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
    if (q) {
      const hay = [item.account.name, item.reason ?? '', item.amount, item.observedBalance]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function groupByDate(items: AdjustmentDto[]): Array<[string, AdjustmentDto[]]> {
  const map = new Map<string, AdjustmentDto[]>();
  for (const item of items) {
    const list = map.get(item.effectiveDate) ?? [];
    list.push(item);
    map.set(item.effectiveDate, list);
  }
  return [...map.entries()];
}

export function sumAmounts(items: AdjustmentDto[]): string {
  let total = 0n;
  for (const item of items) {
    const cleaned = item.amount.replace(/[^\d-]/g, '') || '0';
    total += BigInt(cleaned);
  }
  return total.toString();
}
