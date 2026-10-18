/** expense-api DTOs for household expenses. */

export interface RefDto {
  id: string;
  name: string;
  kind: string | null;
}

export interface ActorDto {
  userId: string;
  displayName: string;
}

export interface CapabilitiesDto {
  canReplace: boolean;
  canVoid: boolean;
}

export interface ExpenseDto {
  id: string;
  kind: string;
  state: string;
  effectiveDate: string;
  amount: string;
  currency: string;
  note: string | null;
  account: RefDto;
  category: RefDto;
  beneficiary: RefDto;
  createdBy: ActorDto;
  recordedAt: string;
  version: number;
  revisionNo: number;
  capabilities: CapabilitiesDto;
}

export interface CreateExpenseRequest {
  effectiveDate: string;
  amount: string;
  accountId: string;
  categoryId: string;
  beneficiaryId: string;
  note?: string | null;
}

export interface ReplaceExpenseRequest extends CreateExpenseRequest {
  changeReason: string;
}

export interface VoidExpenseRequest {
  reason: string;
}

export interface AccountOption {
  id: string;
  name: string;
  type: string;
  status: string;
  currency: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  color: string;
  iconKey: string;
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

export interface ExpenseListFilters {
  search: string;
  datePreset: DatePreset;
  dateFrom: string | null;
  dateTo: string | null;
  categoryId: string | null;
  accountId: string | null;
  beneficiaryId: string | null;
}

export interface DatePresetOption {
  value: DatePreset;
  labelKey: string;
}
