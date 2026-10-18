import { InjectionToken, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const EN = {
  accounts: {
    title: 'Accounts',
    subtitle: 'Balances as of today in the household timezone',
    add: 'Add account',
    empty: 'No accounts yet.',
    loadError: 'Could not load accounts',
    name: 'Name',
    type: 'Type',
    owner: 'Owner label',
    openedOn: 'Opened on',
    openingAmount: 'Opening amount',
    balance: 'Balance',
    asOf: 'As of',
    status: 'Status',
    sort: 'Sort order',
    actions: 'Actions',
    createTitle: 'Create account',
    createSubtitle: 'Opening balance is immutable after create',
    create: 'Create',
    saving: 'Saving…',
    back: 'Back',
    readOnly: 'Members can view accounts. Only admins can create them.',
    nameRequired: 'Name is required',
    ownerRequired: 'Owner label is required',
    amountRequired: 'Opening amount is required (whole MMK string)',
    amountInvalid: 'Use a whole-number money string, for example 0 or 1000',
    saveError: 'Could not create account',
    negativeWarn: 'Negative balance',
    typeBank: 'Bank',
    typeWallet: 'Wallet',
    typeCash: 'Cash',
  },
};

const MY = {
  accounts: {
    title: 'အကောင့်များ',
    subtitle: 'မိသားစု timezone အရ ယနေ့ လက်ကျန်များ',
    add: 'အကောင့် ထည့်ရန်',
    empty: 'အကောင့် မရှိသေးပါ။',
    loadError: 'အကောင့်များ ဖတ်မရပါ',
    name: 'အမည်',
    type: 'အမျိုးအစား',
    owner: 'ပိုင်ရှင် အညွှန်း',
    openedOn: 'ဖွင့်သည့်နေ့',
    openingAmount: 'အစ လက်ကျန်',
    balance: 'လက်ကျန်',
    asOf: 'ရက်စွဲ',
    status: 'အခြေအနေ',
    sort: 'အစဉ်',
    actions: 'လုပ်ဆောင်ချက်',
    createTitle: 'အကောင့် အသစ်',
    createSubtitle: 'အစ လက်ကျန်ကို ဖန်တီးပြီးနောက် ပြင်၍မရပါ',
    create: 'ဖန်တီးရန်',
    saving: 'သိမ်းနေသည်…',
    back: 'နောက်သို့',
    readOnly: 'အဖွဲ့ဝင်များ ကြည့်နိုင်သည်။ ဖန်တီးရန် admin လိုအပ်သည်။',
    nameRequired: 'အမည် လိုအပ်သည်',
    ownerRequired: 'ပိုင်ရှင် အညွှန်း လိုအပ်သည်',
    amountRequired: 'အစ လက်ကျန် လိုအပ်သည် (MMK ကိန်းပြည့်)',
    amountInvalid: 'ကိန်းပြည့် ငွေစာကြောင်း သုံးပါ (ဥပမာ 0 သို့ 1000)',
    saveError: 'အကောင့် ဖန်တီးမရပါ',
    negativeWarn: 'အနုတ် လက်ကျန်',
    typeBank: 'ဘဏ်',
    typeWallet: 'ပိုက်ဆံအိတ်',
    typeCash: 'ငွေသား',
  },
};

export const ACCOUNTS_I18N = new InjectionToken<boolean>('ACCOUNTS_I18N');

export function provideAccountsI18n() {
  return {
    provide: ACCOUNTS_I18N,
    useFactory: () => {
      const translate = inject(TranslateService);
      translate.setTranslation('en', EN, true);
      translate.setTranslation('my', MY, true);
      return true;
    },
  };
}
