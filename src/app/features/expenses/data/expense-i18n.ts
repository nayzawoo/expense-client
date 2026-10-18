import type { AppLanguage } from '../../../core';

/** Feature-local copy (en/my). Global `assets/i18n` is owned by scaffold. */
const messages = {
  en: {
    title: 'Expense Log',
    description: 'Track and review household spending',
    add: 'Add Expense',
    edit: 'Edit Expense',
    editDescription: 'Correct a household spending record',
    createDescription: 'Record a new household expense',
    searchPlaceholder: 'Search expenses…',
    allCategories: 'All categories',
    allAccounts: 'All accounts',
    allPeople: 'All people',
    clear: 'Clear',
    empty: 'No expenses match these filters.',
    loading: 'Loading expenses…',
    loadError: 'Could not load expenses.',
    summary: '{count} expenses · {total}',
    summaryOne: '1 expense · {total}',
    amount: 'Amount',
    date: 'Date',
    account: 'Account',
    category: 'Category',
    beneficiary: 'For whom',
    note: 'Note',
    noteOptional: 'Note (optional)',
    save: 'Save',
    cancel: 'Cancel',
    changeReason: 'Change reason',
    void: 'Void',
    voidTitle: 'Void expense',
    voidReason: 'Reason',
    voidConfirm: 'Void this expense? History is retained.',
    voidSuccess: 'Expense voided.',
    createSuccess: 'Expense saved.',
    updateSuccess: 'Expense updated.',
    required: 'Required',
    invalidAmount: 'Enter a whole MMK amount (digits only).',
    retry: 'Retry',
    backToList: 'Back to list',
  },
  my: {
    title: 'ထွက်ငွေ မှတ်တမ်း',
    description: 'အိမ်ထောင်စု အသုံးစရိတ်ကို ကြည့်ရှု စီမံရန်',
    add: 'ထွက်ငွေ ထည့်ရန်',
    edit: 'ထွက်ငွေ ပြင်ရန်',
    editDescription: 'အိမ်ထောင်စု အသုံးစရိတ်ကို ပြင်ဆင်ရန်',
    createDescription: 'ထွက်ငွေ အသစ် ထည့်သွင်းရန်',
    searchPlaceholder: 'ထွက်ငွေ ရှာရန်…',
    allCategories: 'အမျိုးအစားအားလုံး',
    allAccounts: 'အကောင့်အားလုံး',
    allPeople: 'လူအားလုံး',
    clear: 'ရှင်းရန်',
    empty: 'စစ်ထုတ်ချက်နှင့် ကိုက်ညီသော ထွက်ငွေ မရှိပါ။',
    loading: 'ထွက်ငွေများ တင်နေသည်…',
    loadError: 'ထွက်ငွေများ တင်၍ မရပါ။',
    summary: 'ထွက်ငွေ {count} ခု · {total}',
    summaryOne: 'ထွက်ငွေ ၁ ခု · {total}',
    amount: 'ပမာဏ',
    date: 'ရက်စွဲ',
    account: 'အကောင့်',
    category: 'အမျိုးအစား',
    beneficiary: 'အတွက်',
    note: 'မှတ်ချက်',
    noteOptional: 'မှတ်ချက် (မဖြစ်မနေ မဟုတ်)',
    save: 'သိမ်းရန်',
    cancel: 'ပယ်ဖျက်',
    changeReason: 'ပြင်ဆင်ရခြင်း အကြောင်း',
    void: 'ပယ်ဖျက်',
    voidTitle: 'ထွက်ငွေ ပယ်ဖျက်ရန်',
    voidReason: 'အကြောင်းရင်း',
    voidConfirm: 'ဤထွက်ငွေကို ပယ်ဖျက်မလား။ မှတ်တမ်း ထိန်းသိမ်းထားမည်။',
    voidSuccess: 'ထွက်ငွေ ပယ်ဖျက်ပြီး။',
    createSuccess: 'ထွက်ငွေ သိမ်းပြီး။',
    updateSuccess: 'ထွက်ငွေ ပြင်ပြီး။',
    required: 'ဖြည့်ရန် လိုအပ်သည်',
    invalidAmount: 'MMK ပမာဏကို ကိန်းပြည့်ဖြင့် ထည့်ပါ။',
    retry: 'ပြန်ကြိုးစား',
    backToList: 'စာရင်းသို့',
  },
} as const;

export type ExpenseMessageKey = keyof (typeof messages)['en'];

export function expenseT(
  locale: AppLanguage,
  key: ExpenseMessageKey,
  vars?: Record<string, string>,
): string {
  let text: string = messages[locale][key] ?? messages.en[key];
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, value);
    }
  }
  return text;
}
