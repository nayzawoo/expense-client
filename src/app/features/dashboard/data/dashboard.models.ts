/** expense-api `GET …/reports/dashboard` response. */

export interface PeriodCoverage {
  from: string;
  to: string;
  complete: boolean;
  reason: string | null;
}

export interface Period {
  from: string;
  to: string;
  coverage: PeriodCoverage;
}

export interface BalanceCoverage {
  from: string;
  complete: boolean;
  omittedAccountIds: string[];
}

export interface AccountBalance {
  id: string;
  name: string;
  balance: string;
  negativeBalanceWarning: boolean;
}

export interface DashboardOverview {
  expense: string;
  income: string;
  net: string;
  previousSamePeriodExpense: string | null;
  expenseDifference: string | null;
  expenseDifferencePercent: string | null;
  direction: string | null;
  previousFiveMonthAverage: string | null;
  elapsedDayAverage: string | null;
}

export interface PacePoint {
  day: number;
  currentCumulative: string;
  previousCumulative: string;
  expense: string;
}

export interface Ref {
  id: string;
  name: string;
}

export interface CategoryBreakdown {
  category: Ref;
  amount: string;
  sharePercent: string;
}

export interface CategoryChange {
  category: Ref;
  currentAmount: string;
  previousAmount: string;
  difference: string;
  differencePercent: string | null;
  isNew: boolean;
}

export interface CategoryChanges {
  increased: CategoryChange[];
  decreased: CategoryChange[];
}

export interface BeneficiarySpending {
  beneficiary: Ref;
  amount: string;
}

export interface ActivityItem {
  id: string;
  kind: string;
  effectiveDate: string;
  amount: string;
  currency: string;
  note: string | null;
  recordedAt: string;
  account: Ref | null;
  sourceAccount: Ref | null;
  destinationAccount: Ref | null;
}

export interface DashboardPayload {
  currency: string;
  timeZone: string;
  asOf: string;
  period: Period;
  comparisonPeriod: Period;
  balanceCoverage: BalanceCoverage;
  totalBalance: string;
  accounts: AccountBalance[];
  overview: DashboardOverview;
  spendingPace: PacePoint[];
  categoryBreakdown: CategoryBreakdown[];
  categoryChanges: CategoryChanges;
  beneficiarySpending: BeneficiarySpending[];
  recentActivity: ActivityItem[];
}
