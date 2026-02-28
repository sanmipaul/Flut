/**
 * Chart Data Transformation Utilities
 * Converts transaction data into chart-ready formats
 */

import { VaultTransaction, ChartDataPoint, TransactionType } from '../types/TransactionHistory';

/**
 * Transform transactions into time series data
 */
export const generateTimeSeriesData = (
  transactions: VaultTransaction[],
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly'
): ChartDataPoint[] => {
  const data: Map<string, number> = new Map();
  const now = Date.now();

  transactions.forEach((tx) => {
    if (tx.status !== 'confirmed') return;

    const date = new Date(tx.timestamp);
    let key: string;

    switch (interval) {
      case 'hourly':
        key = date.toISOString().slice(0, 13);
        break;
      case 'daily':
        key = date.toISOString().slice(0, 10);
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'monthly':
        key = date.toISOString().slice(0, 7);
        break;
    }

    data.set(key, (data.get(key) || 0) + tx.amount);
  });

  return Array.from(data.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Generate cumulative volume data
 */
export const generateCumulativeVolumeData = (
  transactions: VaultTransaction[]
): ChartDataPoint[] => {
  const sorted = [...transactions]
    .filter((tx) => tx.status === 'confirmed')
    .sort((a, b) => a.timestamp - b.timestamp);

  let cumulative = 0;
  return sorted.map((tx) => {
    cumulative += tx.amount;
    return {
      label: new Date(tx.timestamp).toLocaleDateString(),
      value: cumulative,
    };
  });
};

/**
 * Generate transaction count over time
 */
export const generateTransactionCountData = (
  transactions: VaultTransaction[],
  interval: 'hourly' | 'daily' | 'weekly' | 'monthly'
): ChartDataPoint[] => {
  const data: Map<string, number> = new Map();

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    let key: string;

    switch (interval) {
      case 'hourly':
        key = date.toISOString().slice(0, 13);
        break;
      case 'daily':
        key = date.toISOString().slice(0, 10);
        break;
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'monthly':
        key = date.toISOString().slice(0, 7);
        break;
    }

    data.set(key, (data.get(key) || 0) + 1);
  });

  return Array.from(data.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Generate pie chart data for transaction types
 */
export const generateTransactionTypeDistribution = (
  transactions: VaultTransaction[]
): ChartDataPoint[] => {
  const data: Map<string, number> = new Map();
  const typeLabels: Record<TransactionType, string> = {
    [TransactionType.VAULT_CREATED]: 'Vault Created',
    [TransactionType.DEPOSIT]: 'Deposits',
    [TransactionType.WITHDRAWAL]: 'Withdrawals',
    [TransactionType.EMERGENCY_WITHDRAWAL]: 'Emergency Withdrawals',
    [TransactionType.PENALTY_APPLIED]: 'Penalties',
    [TransactionType.BENEFICIARY_SET]: 'Beneficiary Set',
    [TransactionType.UNLOCK_DATE_CHANGED]: 'Unlock Date Changed',
    [TransactionType.NFT_MINTED]: 'NFT Minted',
    [TransactionType.STACKING_ENABLED]: 'Stacking Enabled',
    [TransactionType.STACKING_YIELD_CLAIMED]: 'Stacking Yield',
  };

  transactions.forEach((tx) => {
    const label = typeLabels[tx.type];
    data.set(label, (data.get(label) || 0) + tx.amount);
  });

  return Array.from(data.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

/**
 * Generate status distribution data
 */
export const generateStatusDistribution = (
  transactions: VaultTransaction[]
): ChartDataPoint[] => {
  const data: Map<string, number> = new Map();

  transactions.forEach((tx) => {
    const status = tx.status.charAt(0).toUpperCase() + tx.status.slice(1);
    data.set(status, (data.get(status) || 0) + 1);
  });

  return Array.from(data.entries()).map(([label, value]) => ({ label, value }));
};

/**
 * Generate heatmap data for transaction activity
 */
export const generateActivityHeatmap = (
  transactions: VaultTransaction[]
): Map<string, number> => {
  const heatmap = new Map<string, number>();

  transactions.forEach((tx) => {
    const date = new Date(tx.timestamp);
    const day = date.getDay();
    const hour = date.getHours();
    const key = `${day}-${hour}`;

    heatmap.set(key, (heatmap.get(key) || 0) + 1);
  });

  return heatmap;
};

/**
 * Generate comparison data for two periods
 */
export const generatePeriodComparison = (
  currentPeriod: VaultTransaction[],
  previousPeriod: VaultTransaction[]
): ChartDataPoint[] => {
  const currentVolume = currentPeriod
    .filter((tx) => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const previousVolume = previousPeriod
    .filter((tx) => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return [
    { label: 'Previous Period', value: previousVolume },
    { label: 'Current Period', value: currentVolume },
  ];
};

/**
 * Generate moving average
 */
export const generateMovingAverage = (
  data: ChartDataPoint[],
  windowSize: number = 7
): ChartDataPoint[] => {
  const result: ChartDataPoint[] = [];

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
    const window = data.slice(start, end);
    const avg = window.reduce((sum, point) => sum + point.value, 0) / window.length;

    result.push({
      label: data[i].label,
      value: avg,
    });
  }

  return result;
};

/**
 * Get color for transaction type
 */
export const getTransactionTypeColor = (type: TransactionType): string => {
  const colors: Record<TransactionType, string> = {
    [TransactionType.VAULT_CREATED]: '#3b82f6',
    [TransactionType.DEPOSIT]: '#10b981',
    [TransactionType.WITHDRAWAL]: '#f59e0b',
    [TransactionType.EMERGENCY_WITHDRAWAL]: '#ef4444',
    [TransactionType.PENALTY_APPLIED]: '#dc2626',
    [TransactionType.BENEFICIARY_SET]: '#8b5cf6',
    [TransactionType.UNLOCK_DATE_CHANGED]: '#ec4899',
    [TransactionType.NFT_MINTED]: '#06b6d4',
    [TransactionType.STACKING_ENABLED]: '#14b8a6',
    [TransactionType.STACKING_YIELD_CLAIMED]: '#84cc16',
  };
  return colors[type] || '#6b7280';
};
