import type { AppLanguage } from '../../../core';

const messages = {
  en: {
    title: 'Transfers',
    description: 'Move money between household accounts',
    add: 'Add Transfer',
    createDescription: 'Transfer between two accounts',
    searchPlaceholder: 'Search transfers…',
    allAccounts: 'All accounts',
    clear: 'Clear',
    empty: 'No transfers match these filters.',
    loadError: 'Could not load transfers.',
    summary: '{count} transfers · {total}',
    summaryOne: '1 transfer · {total}',
    amount: 'Amount',
    date: 'Date',
    source: 'From account',
    destination: 'To account',
    noteOptional: 'Note (optional)',
    save: 'Save',
    cancel: 'Cancel',
    void: 'Void',
    voidTitle: 'Void transfer',
    voidReason: 'Reason',
    voidConfirm: 'Void this transfer? Both sides are compensated; history is kept.',
    voidSuccess: 'Transfer voided.',
    createSuccess: 'Transfer saved.',
    sameAccount: 'Choose two different accounts.',
    invalidAmount: 'Enter a whole MMK amount (digits only).',
    retry: 'Retry',
    backToList: 'Back to list',
  },
  my: {
    title: 'လွှဲပြောင်းမှုများ',
    description: 'အကောင့်များကြား ငွေလွှဲရန်',
    add: 'လွှဲပြောင်း ထည့်ရန်',
    createDescription: 'အကောင့်နှစ်ခုကြား လွှဲပြောင်းရန်',
    searchPlaceholder: 'လွှဲပြောင်းမှု ရှာရန်…',
    allAccounts: 'အကောင့်အားလုံး',
    clear: 'ရှင်းရန်',
    empty: 'စစ်ထုတ်ချက်နှင့် ကိုက်ညီသော လွှဲပြောင်းမှု မရှိပါ။',
    loadError: 'လွှဲပြောင်းမှုများ တင်၍ မရပါ။',
    summary: 'လွှဲပြောင်းမှု {count} ခု · {total}',
    summaryOne: 'လွှဲပြောင်းမှု ၁ ခု · {total}',
    amount: 'ပမာဏ',
    date: 'ရက်စွဲ',
    source: 'မှ အကောင့်',
    destination: 'သို့ အကောင့်',
    noteOptional: 'မှတ်ချက် (မဖြစ်မနေ မဟုတ်)',
    save: 'သိမ်းရန်',
    cancel: 'ပယ်ဖျက်',
    void: 'ပယ်ဖျက်',
    voidTitle: 'လွှဲပြောင်းမှု ပယ်ဖျက်ရန်',
    voidReason: 'အကြောင်းရင်း',
    voidConfirm: 'ဤလွှဲပြောင်းမှုကို ပယ်ဖျက်မလား။ နှစ်ဘက်လုံး ပြန်ညှိမည်။',
    voidSuccess: 'လွှဲပြောင်းမှု ပယ်ဖျက်ပြီး။',
    createSuccess: 'လွှဲပြောင်းမှု သိမ်းပြီး။',
    sameAccount: 'အကောင့် မတူညီသော နှစ်ခု ရွေးပါ။',
    invalidAmount: 'MMK ပမာဏကို ကိန်းပြည့်ဖြင့် ထည့်ပါ။',
    retry: 'ပြန်ကြိုးစား',
    backToList: 'စာရင်းသို့',
  },
} as const;

export type TransferMessageKey = keyof (typeof messages)['en'];

export function transferT(
  lang: AppLanguage,
  key: TransferMessageKey,
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
