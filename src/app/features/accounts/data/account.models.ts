export type AccountType = 'BANK' | 'WALLET' | 'CASH';
export type AccountStatus = 'ACTIVE' | 'ARCHIVED';

export interface Account {
  id: string;
  name: string;
  type: AccountType | string;
  ownerLabel: string;
  openedOn: string;
  openingAmount: string;
  currentBalance: string;
  balanceAsOf: string;
  balanceVersion: number;
  negativeBalanceWarning: boolean;
  status: AccountStatus | string;
  sortOrder: number;
  version: number;
  currency: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  ownerLabel: string;
  openedOn: string;
  openingAmount: string;
  sortOrder: number;
}
