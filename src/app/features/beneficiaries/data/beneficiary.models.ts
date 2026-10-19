/** expense-api beneficiary DTOs under `/api/v1/households/{id}/beneficiaries`. */

export type BeneficiaryStatus = 'ACTIVE' | 'ARCHIVED';

export type BeneficiaryKind = 'PERSON' | 'HOUSEHOLD' | 'OTHER';

export interface Beneficiary {
  id: string;
  name: string;
  kind: BeneficiaryKind;
  sortOrder: number;
  status: BeneficiaryStatus;
  version: number;
}

export interface BeneficiaryWritePayload {
  name: string;
  kind: BeneficiaryKind;
  sortOrder: number;
}

export interface BeneficiaryStatusPayload {
  status: BeneficiaryStatus;
}
