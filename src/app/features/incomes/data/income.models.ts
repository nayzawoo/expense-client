export interface RefDto {
  id: string;
  name: string;
  kind: string | null;
}

export interface ActorDto {
  userId: string;
  displayName: string;
}

export interface IncomeDto {
  id: string;
  kind: string;
  state: string;
  effectiveDate: string;
  amount: string;
  currency: string;
  note: string | null;
  account: RefDto;
  beneficiary: RefDto;
  createdBy: ActorDto;
  recordedAt: string;
  version: number;
  revisionNo: number;
  capabilities: { canVoid: boolean };
}

export interface CreateIncomeRequest {
  effectiveDate: string;
  amount: string;
  accountId: string;
  beneficiaryId: string;
  note?: string | null;
}

export interface VoidIncomeRequest {
  reason: string;
}

export interface AccountOption {
  id: string;
  name: string;
  status: string;
}

export interface BeneficiaryOption {
  id: string;
  name: string;
  kind: string;
  status: string;
}

export type DatePreset =
  | 'this_month'
  | 'last_month'
  | 'last_7_days'
  | 'last_30_days'
  | 'all'
  | 'custom';

export interface IncomeListFilters {
  search: string;
  datePreset: DatePreset;
  dateFrom: string | null;
  dateTo: string | null;
  accountId: string | null;
  beneficiaryId: string | null;
}
