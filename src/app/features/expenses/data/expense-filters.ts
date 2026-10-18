import type { DatePreset, DatePresetOption, ExpenseDto, ExpenseListFilters } from './expense.models';

export const DATE_PRESET_OPTIONS: DatePresetOption[] = [
  { value: 'this_month', labelKey: 'presetThisMonth' },
  { value: 'last_month', labelKey: 'presetLastMonth' },
  { value: 'last_7_days', labelKey: 'presetLast7' },
  { value: 'last_30_days', labelKey: 'presetLast30' },
  { value: 'all', labelKey: 'presetAll' },
  { value: 'custom', labelKey: 'presetCustom' },
];

export function defaultExpenseFilters(): ExpenseListFilters {
  return {
    search: '',
    datePreset: 'this_month',
    dateFrom: null,
    dateTo: null,
    categoryId: null,
    accountId: null,
    beneficiaryId: null,
  };
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

export function resolveDateRange(
  filters: ExpenseListFilters,
  today = new Date(),
): { from: string | null; to: string | null } {
  switch (filters.datePreset) {
    case 'this_month':
      return { from: toIsoDate(startOfMonth(today)), to: toIsoDate(endOfMonth(today)) };
    case 'last_month': {
      const last = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      return { from: toIsoDate(startOfMonth(last)), to: toIsoDate(endOfMonth(last)) };
    }
    case 'last_7_days':
      return { from: toIsoDate(addDays(today, -6)), to: toIsoDate(today) };
    case 'last_30_days':
      return { from: toIsoDate(addDays(today, -29)), to: toIsoDate(today) };
    case 'custom':
      return { from: filters.dateFrom, to: filters.dateTo };
    case 'all':
    default:
      return { from: null, to: null };
  }
}

export function filterExpenses(
  items: ExpenseDto[],
  filters: ExpenseListFilters,
  today = new Date(),
): ExpenseDto[] {
  const { from, to } = resolveDateRange(filters, today);
  const q = filters.search.trim().toLowerCase();

  return items.filter((item) => {
    if (from && item.effectiveDate < from) {
      return false;
    }
    if (to && item.effectiveDate > to) {
      return false;
    }
    if (filters.categoryId && item.category.id !== filters.categoryId) {
      return false;
    }
    if (filters.accountId && item.account.id !== filters.accountId) {
      return false;
    }
    if (filters.beneficiaryId && item.beneficiary.id !== filters.beneficiaryId) {
      return false;
    }
    if (q) {
      const hay = [
        item.category.name,
        item.account.name,
        item.beneficiary.name,
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

export function groupByDate(items: ExpenseDto[]): Array<[string, ExpenseDto[]]> {
  const map = new Map<string, ExpenseDto[]>();
  for (const item of items) {
    const list = map.get(item.effectiveDate) ?? [];
    list.push(item);
    map.set(item.effectiveDate, list);
  }
  return [...map.entries()];
}

export function sumAmounts(items: ExpenseDto[]): string {
  let total = 0n;
  for (const item of items) {
    const cleaned = item.amount.replace(/[^\d-]/g, '') || '0';
    total += BigInt(cleaned);
  }
  return total.toString();
}

export function dateHeading(date: string, locale: 'en' | 'my'): string {
  const label = new Date(`${date}T00:00:00`).toLocaleDateString(
    locale === 'my' ? 'my-MM' : 'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' },
  );
  const today = toIsoDate(new Date());
  const yesterday = toIsoDate(addDays(new Date(), -1));
  if (date === today) {
    return locale === 'my' ? `${label} · ယနေ့` : `${label} · Today`;
  }
  if (date === yesterday) {
    return locale === 'my' ? `${label} · မနေ့က` : `${label} · Yesterday`;
  }
  return label;
}

export function presetLabel(preset: DatePreset, locale: 'en' | 'my'): string {
  const map: Record<DatePreset, { en: string; my: string }> = {
    this_month: { en: 'This month', my: 'ဒီလ' },
    last_month: { en: 'Last month', my: 'ပြီးခဲ့သောလ' },
    last_7_days: { en: 'Last 7 days', my: '၇ ရက်' },
    last_30_days: { en: 'Last 30 days', my: '၃၀ ရက်' },
    all: { en: 'All', my: 'အားလုံး' },
    custom: { en: 'Custom', my: 'စိတ်ကြိုက်' },
  };
  return map[preset][locale];
}
