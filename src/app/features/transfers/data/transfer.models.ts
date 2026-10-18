export interface AccountRef {
  id: string;
  name: string;
}

export interface ActorDto {
  userId: string;
  displayName: string;
}

export interface TransferDto {
  id: string;
  kind: string;
  state: string;
  effectiveDate: string;
  amount: string;
  currency: string;
  note: string | null;
  sourceAccount: AccountRef;
  destinationAccount: AccountRef;
  createdBy: ActorDto;
  recordedAt: string;
  version: number;
  revisionNo: number;
  capabilities: { canVoid: boolean };
}

export interface CreateTransferRequest {
  effectiveDate: string;
  amount: string;
  sourceAccountId: string;
  destinationAccountId: string;
  note?: string | null;
}

export interface VoidTransferRequest {
  reason: string;
}

export interface AccountOption {
  id: string;
  name: string;
  status: string;
}

export type DatePreset =
  | 'this_month'
  | 'last_month'
  | 'last_7_days'
  | 'last_30_days'
  | 'all'
  | 'custom';

export interface TransferListFilters {
  search: string;
  datePreset: DatePreset;
  dateFrom: string | null;
  dateTo: string | null;
  accountId: string | null;
}
