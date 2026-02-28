/**
 * Analytics Calculation Utilities
 * Provides functions for calculating statistics and metrics from transaction data
 */

import {
  VaultTransaction,
  TransactionFilter,
  TransactionStats,
  VolumeByType,
  VaultPerformanceMetrics,
  TransactionType,
  ChartDataPoint,
} from '../types/TransactionHistory';

/**
 * Filter transactions based on criteria
 */
export const filterTransactions = (
  transactions: VaultTransaction[],
  filter: TransactionFilter
): VaultTransaction[] => {
  return transactions.filter((tx) => {
    // Date range filter
    if (filter.startDate && tx.timestamp < filter.startDate) return false;
    if (filter.endDate && tx.timestamp > filter.endDate) return false;

    // Transaction type filter
    if (filter.types && filter.types.length > 0 && !filter.types.includes(tx.type)) {
      return false;
    }

    // Status filter
    if (filter.status && filter.status.length > 0 && !filter.status.includes(tx.status)) {
      return false;
    }

    // Amount range filter
    if (filter.minAmount && tx.amount < filter.minAmount) return false;
    if (filter.maxAmount && tx.amount > filter.maxAmount) return false;

    // Initiated by filter
    if (filter.initiatedBy && tx.initiatedBy !== filter.initiatedBy) return false;

    // Search term filter
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchId = tx.id.toLowerCase().includes(searchLower);
      const matchTxId = tx.txId.toLowerCase().includes(searchLower);
      const matchDesc = tx.description.toLowerCase().includes(searchLower);
      if (!matchId && !matchTxId && !matchDesc) return false;
    }

    return true;
  });
};

/**
 * Calculate transaction statistics
 */
export const calculateTransactionStats = (
  transactions: VaultTransaction[]
): TransactionStats => {
  const confirmedTxs = transactions.filter((tx) => tx.status === 'confirmed');
  const totalVolume = confirmedTxs.reduce((sum, tx) => sum + tx.amount, 0);

  const transactionsByType: Record<TransactionType, number> = {} as any;
  Object.values(TransactionType).forEach((type) => {
    transactionsByType[type] = transactions.filter((tx) => tx.type === type).length;
  });

  return {
    totalTransactions: transactions.length,
    totalVolume,
    successRate: transactions.length > 0 ? (confirmedTxs.length / transactions.length) * 100 : 0,
    averageTransactionSize: confirmedTxs.length > 0 ? totalVolume / confirmedTxs.length : 0,
    oldestTransaction: transactions.length > 0 ? transactions[transactions.length - 1] : null,
    newestTransaction: transactions.length > 0 ? transactions[0] : null,
    transactionsByType,
  };
};

/**
 * Calculate volume breakdown by transaction type
 */
export const calculateVolumeByType = (
  transactions: VaultTransaction[]
): VolumeByType[] => {
  const confirmedTxs = transactions.filter((tx) => tx.status === 'confirmed');
  const totalVolume = confirmedTxs.reduce((sum, tx) => sum + tx.amount, 0);

  const volumeMap: Record<string, { volume: number; count: number }> = {};

  confirmedTxs.forEach((tx) => {
    if (!volumeMap[tx.type]) {
      volumeMap[tx.type] = { volume: 0, count: 0 };
    }
    volumeMap[tx.type].volume += tx.amount;
    volumeMap[tx.type].count += 1;
  });

  return Object.entries(volumeMap).map(([type, data]) => ({
    type: type as TransactionType,
    volume: data.volume,
    count: data.count,
    percentage: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0,
  }));
};

/**
 * Group transactions by date for chart display
 */
export const groupTransactionsByDate = (
  transactions: VaultTransaction[],
  period: 'day' | 'week' | 'month'
): ChartDataPoint[] => {
  const grouped: Record<string, number> = {};

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    let label: string;

    if (period === 'day') {
      label = `${date.getHours()}:00`;
    } else if (period === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      label = days[date.getDay()];
    } else {
      label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    grouped[label] = (grouped[label] || 0) + tx.amount;
  });

  return Object.entries(grouped).map(([label, value]) => ({
    label,
    value,
  }));
};

/**
 * Calculate vault performance metrics
 */
export const calculateVaultPerformance = (
  vaultId: string,
  createdAt: number,
  transactions: VaultTransaction[],
  currentBalance: number
): VaultPerformanceMetrics => {
  const confirmedTxs = transactions.filter((tx) => tx.status === 'confirmed');

  const deposits = confirmedTxs
    .filter((tx) => tx.type === TransactionType.DEPOSIT || tx.type === TransactionType.VAULT_CREATED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const withdrawals = confirmedTxs
    .filter((tx) => [TransactionType.WITHDRAWAL, TransactionType.EMERGENCY_WITHDRAWAL].includes(tx.type))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const penalties = confirmedTxs
    .filter((tx) => tx.type === TransactionType.PENALTY_APPLIED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const stakingYield = confirmedTxs
    .filter((tx) => tx.type === TransactionType.STACKING_YIELD_CLAIMED)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netChange = deposits - withdrawals - penalties + stakingYield;
  const roi = deposits > 0 ? ((netChange - deposits) / deposits) * 100 : 0;

  return {
    vaultId,
    createdAt,
    totalDeposits: deposits,
    totalWithdrawals: withdrawals,
    currentBalance,
    netChange,
    roi,
    penaltiesApplied: penalties,
    stackingYieldAccumulated: stakingYield,
    avgLockPeriod: Math.ceil((Date.now() - createdAt) / (1000 * 60 * 60 * 24)),
    transactionCount: confirmedTxs.length,
    lastActivityTime: confirmedTxs.length > 0 ? confirmedTxs[0].timestamp : createdAt,
  };
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, decimals = 6): string => {
  const stx = amount / 1000000;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  }).format(stx);
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate YoY change
 */
export const calculateYoYChange = (
  currentPeriod: VaultTransaction[],
  previousPeriod: VaultTransaction[]
): number => {
  const currentVolume = currentPeriod
    .filter((tx) => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + tx.amount, 0);
  const previousVolume = previousPeriod
    .filter((tx) => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  if (previousVolume === 0) return 0;
  return ((currentVolume - previousVolume) / previousVolume) * 100;
};

/**
 * Get transaction type label
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
    [TransactionType.VAULT_CREATED]: 'Vault Created',
    [TransactionType.DEPOSIT]: 'Deposit',
    [TransactionType.WITHDRAWAL]: 'Withdrawal',
    [TransactionType.EMERGENCY_WITHDRAWAL]: 'Emergency Withdrawal',
    [TransactionType.PENALTY_APPLIED]: 'Penalty Applied',
    [TransactionType.BENEFICIARY_SET]: 'Beneficiary Set',
    [TransactionType.UNLOCK_DATE_CHANGED]: 'Unlock Date Changed',
    [TransactionType.NFT_MINTED]: 'NFT Minted',
    [TransactionType.STACKING_ENABLED]: 'Stacking Enabled',
    [TransactionType.STACKING_YIELD_CLAIMED]: 'Stacking Yield Claimed',
  };
  return labels[type] || 'Unknown';
};
