export interface AccountRef {
  id: string;
  name: string;
}

export interface ActorDto {
  userId: string;
  displayName: string;
}

export interface AdjustmentDto {
  id: string;
  kind: string;
  state: string;
  effectiveDate: string;
  amount: string;
  currency: string;
  reason: string;
  balanceBefore: string;
  observedBalance: string;
  observedBalanceVersion: number;
  account: AccountRef;
  createdBy: ActorDto;
  recordedAt: string;
  version: number;
  revisionNo: number;
  capabilities: { canVoid: boolean };
}

export interface ReconcileRequest {
  actualBalance: string;
  expectedBalanceVersion: number;
  reason: string;
}

export interface VoidAdjustmentRequest {
  reason: string;
}

export interface AccountOption {
  id: string;
  name: string;
  status: string;
  currentBalance: string;
  balanceVersion: number;
  currency: string;
}

export type DatePreset =
  | 'this_month'
  | 'last_month'
  | 'last_7_days'
  | 'last_30_days'
  | 'all'
  | 'custom';

export interface AdjustmentListFilters {
  search: string;
  datePreset: DatePreset;
  dateFrom: string | null;
  dateTo: string | null;
  accountId: string | null;
}
