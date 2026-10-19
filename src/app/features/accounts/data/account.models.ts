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

export interface LedgerQuery {
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface LedgerActor {
  userId: string;
  displayName: string;
}

export interface LedgerEntry {
  postingId: string;
  transactionId: string;
  kind: string;
  role: string;
  signedAmount: string;
  effectiveDate: string;
  recordedAt: string;
  revisionNo: number;
  actor: LedgerActor;
  runningBalance: string;
}

export interface LedgerResponse {
  accountId: string;
  currency: string;
  from: string;
  to: string;
  openingBalance: string;
  closingBalance: string;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  items: LedgerEntry[];
}
