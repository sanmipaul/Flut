/**
 * Transaction History Models and Types
 * Defines interfaces for vault transactions and analytics
 */

export enum TransactionType {
  VAULT_CREATED = 'vault_created',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  EMERGENCY_WITHDRAWAL = 'emergency_withdrawal',
  PENALTY_APPLIED = 'penalty_applied',
  BENEFICIARY_SET = 'beneficiary_set',
  UNLOCK_DATE_CHANGED = 'unlock_date_changed',
  NFT_MINTED = 'nft_minted',
  STACKING_ENABLED = 'stacking_enabled',
  STACKING_YIELD_CLAIMED = 'stacking_yield_claimed',
}

export interface VaultTransaction {
  id: string;
  vaultId: string;
  type: TransactionType;
  amount: number;
  timestamp: number;
  blockHeight: number;
  txId: string;
  status: 'pending' | 'confirmed' | 'failed';
  description: string;
  initiatedBy: string;
  metadata?: Record<string, any>;
  gasUsed?: number;
  fee?: number;
}

export interface TransactionFilter {
  startDate?: number;
  endDate?: number;
  types?: TransactionType[];
  status?: ('pending' | 'confirmed' | 'failed')[];
  minAmount?: number;
  maxAmount?: number;
  initiatedBy?: string;
  searchTerm?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  successRate: number;
  averageTransactionSize: number;
  oldestTransaction: VaultTransaction | null;
  newestTransaction: VaultTransaction | null;
  transactionsByType: Record<TransactionType, number>;
}

export interface AnalyticsPeriod {
  label: string;
  value: 'day' | 'week' | 'month' | 'year' | 'all';
  daysCount: number;
}

export const ANALYTICS_PERIODS: AnalyticsPeriod[] = [
  { label: 'Last 24 Hours', value: 'day', daysCount: 1 },
  { label: 'Last 7 Days', value: 'week', daysCount: 7 },
  { label: 'Last 30 Days', value: 'month', daysCount: 30 },
  { label: 'Last Year', value: 'year', daysCount: 365 },
  { label: 'All Time', value: 'all', daysCount: Infinity },
];

export interface ChartDataPoint {
  label: string;
  value: number;
  timestamp?: number;
}

export interface VolumeByType {
  type: TransactionType;
  volume: number;
  count: number;
  percentage: number;
}

export interface VaultPerformanceMetrics {
  vaultId: string;
  createdAt: number;
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
  netChange: number;
  roi: number;
  penaltiesApplied: number;
  stackingYieldAccumulated: number;
  avgLockPeriod: number;
  transactionCount: number;
  lastActivityTime: number;
}
