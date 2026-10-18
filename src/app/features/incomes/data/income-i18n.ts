import type { AppLanguage } from '../../../core';

const messages = {
  en: {
    title: 'Income Log',
    description: 'Track household income',
    add: 'Add Income',
    createDescription: 'Record a new household income',
    searchPlaceholder: 'Search income…',
    allAccounts: 'All accounts',
    allPeople: 'All people',
    clear: 'Clear',
    empty: 'No incomes match these filters.',
    loadError: 'Could not load incomes.',
    summary: '{count} incomes · {total}',
    summaryOne: '1 income · {total}',
    amount: 'Amount',
    date: 'Date',
    account: 'Account',
    beneficiary: 'For whom',
    noteOptional: 'Note (optional)',
    save: 'Save',
    cancel: 'Cancel',
    void: 'Void',
    voidTitle: 'Void income',
    voidReason: 'Reason',
    voidConfirm: 'Void this income? History is retained.',
    voidSuccess: 'Income voided.',
    createSuccess: 'Income saved.',
    required: 'Required',
    invalidAmount: 'Enter a whole MMK amount (digits only).',
    retry: 'Retry',
    backToList: 'Back to list',
  },
  my: {
    title: 'ဝင်ငွေ မှတ်တမ်း',
    description: 'အိမ်ထောင်စု ဝင်ငွေကို ကြည့်ရှု စီမံရန်',
    add: 'ဝင်ငွေ ထည့်ရန်',
    createDescription: 'ဝင်ငွေ အသစ် ထည့်သွင်းရန်',
    searchPlaceholder: 'ဝင်ငွေ ရှာရန်…',
    allAccounts: 'အကောင့်အားလုံး',
    allPeople: 'လူအားလုံး',
    clear: 'ရှင်းရန်',
    empty: 'စစ်ထုတ်ချက်နှင့် ကိုက်ညီသော ဝင်ငွေ မရှိပါ။',
    loadError: 'ဝင်ငွေများ တင်၍ မရပါ။',
    summary: 'ဝင်ငွေ {count} ခု · {total}',
    summaryOne: 'ဝင်ငွေ ၁ ခု · {total}',
    amount: 'ပမာဏ',
    date: 'ရက်စွဲ',
    account: 'အကောင့်',
    beneficiary: 'အတွက်',
    noteOptional: 'မှတ်ချက် (မဖြစ်မနေ မဟုတ်)',
    save: 'သိမ်းရန်',
    cancel: 'ပယ်ဖျက်',
    void: 'ပယ်ဖျက်',
    voidTitle: 'ဝင်ငွေ ပယ်ဖျက်ရန်',
    voidReason: 'အကြောင်းရင်း',
    voidConfirm: 'ဤဝင်ငွေကို ပယ်ဖျက်မလား။ မှတ်တမ်း ထိန်းသိမ်းထားမည်။',
    voidSuccess: 'ဝင်ငွေ ပယ်ဖျက်ပြီး။',
    createSuccess: 'ဝင်ငွေ သိမ်းပြီး။',
    required: 'ဖြည့်ရန် လိုအပ်သည်',
    invalidAmount: 'MMK ပမာဏကို ကိန်းပြည့်ဖြင့် ထည့်ပါ။',
    retry: 'ပြန်ကြိုးစား',
    backToList: 'စာရင်းသို့',
  },
} as const;

export type IncomeMessageKey = keyof (typeof messages)['en'];

export function incomeT(
  lang: AppLanguage,
  key: IncomeMessageKey,
  vars?: Record<string, string>,
): string {
  let text: string = messages[lang][key] ?? messages.en[key];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, v);
    }
  }
  return text;
}
