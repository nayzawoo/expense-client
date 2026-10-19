import { provideFeatureI18n } from '../../../core/i18n/feature-i18n';

const EN = {
  profile: {
    title: 'Profile',
    subtitle: 'Update your display name or email',
    displayName: 'Display name',
    email: 'Email',
    currentPassword: 'Current password',
    currentPasswordHint: 'Required when changing email. All sessions will be signed out.',
    role: 'Role',
    status: 'Status',
    save: 'Save changes',
    saving: 'Saving…',
    loadError: 'Could not load profile',
    saveSuccess: 'Profile updated',
    saveError: 'Could not update profile',
    displayNameRequired: 'Display name is required',
    emailRequired: 'Email is required',
    emailInvalid: 'Enter a valid email address',
    passwordRequired: 'Current password is required to change email',
    passwordWrong: 'Current password is incorrect',
    emailTaken: 'That email is already in use',
    emailChanged: 'Email updated. Sign in with your new email.',
    roleAdmin: 'Admin',
    roleMember: 'Member',
    statusActive: 'Active',
    statusDisabled: 'Disabled',
  },
};

const MY = {
  profile: {
    title: 'ပရိုဖိုင်',
    subtitle: 'အမည် သို့မဟုတ် အီးမေးလ် ပြင်ရန်',
    displayName: 'ပြသမည့် အမည်',
    email: 'အီးမေးလ်',
    currentPassword: 'လက်ရှိ စကားဝှက်',
    currentPasswordHint: 'အီးမေးလ် ပြောင်းလျှင် လိုအပ်သည်။ အားလုံးသော ဆက်ရှင်များမှ ထွက်သွားမည်။',
    role: 'အခန်းကဏ္ဍ',
    status: 'အခြေအနေ',
    save: 'သိမ်းမည်',
    saving: 'သိမ်းနေသည်…',
    loadError: 'ပရိုဖိုင် ဖတ်မရပါ',
    saveSuccess: 'ပရိုဖိုင် ပြင်ပြီးပါပြီ',
    saveError: 'ပရိုဖိုင် ပြင်မရပါ',
    displayNameRequired: 'ပြသမည့် အမည် လိုအပ်သည်',
    emailRequired: 'အီးမေးလ် လိုအပ်သည်',
    emailInvalid: 'မှန်ကန်သော အီးမေးလ် ထည့်ပါ',
    passwordRequired: 'အီးမေးလ် ပြောင်းရန် လက်ရှိ စကားဝှက် လိုအပ်သည်',
    passwordWrong: 'လက်ရှိ စကားဝှက် မမှန်ပါ',
    emailTaken: 'ဤအီးမေးလ်ကို အသုံးပြုပြီးသား ဖြစ်သည်',
    emailChanged: 'အီးမေးလ် ပြောင်းပြီးပါပြီ။ အီးမေးလ်အသစ်ဖြင့် ပြန်ဝင်ပါ။',
    roleAdmin: 'စီမံသူ',
    roleMember: 'အဖွဲ့ဝင်',
    statusActive: 'အသုံးပြုနေသည်',
    statusDisabled: 'ပိတ်ထားသည်',
  },
};

export function provideProfileI18n() {
  return provideFeatureI18n(EN, MY);
}
