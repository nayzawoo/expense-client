import {
  DATE_PRESET_OPTIONS,
  dateHeading,
  presetLabel,
  resolveDateRange,
} from '../../expenses/data/expense-filters';
import type { ExpenseListFilters } from '../../expenses/data/expense.models';
import type { DatePreset, TransferDto, TransferListFilters } from './transfer.models';

export { DATE_PRESET_OPTIONS, dateHeading, presetLabel };
export type { DatePreset };

export function defaultTransferFilters(): TransferListFilters {
  return {
    search: '',
    datePreset: 'this_month',
    dateFrom: null,
    dateTo: null,
    accountId: null,
  };
}

export function filterTransfers(items: TransferDto[], filters: TransferListFilters): TransferDto[] {
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
    if (
      filters.accountId &&
      item.sourceAccount.id !== filters.accountId &&
      item.destinationAccount.id !== filters.accountId
    ) {
      return false;
    }
    if (q) {
      const hay = [
        item.sourceAccount.name,
        item.destinationAccount.name,
        item.note ?? '',
        item.amount,
      ]
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export function groupByDate(items: TransferDto[]): Array<[string, TransferDto[]]> {
  const map = new Map<string, TransferDto[]>();
  for (const item of items) {
    const list = map.get(item.effectiveDate) ?? [];
    list.push(item);
    map.set(item.effectiveDate, list);
  }
  return [...map.entries()];
}

export function sumAmounts(items: TransferDto[]): string {
  let total = 0n;
  for (const item of items) {
    const cleaned = item.amount.replace(/[^\d-]/g, '') || '0';
    total += BigInt(cleaned);
  }
  return total.toString();
}
