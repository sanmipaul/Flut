/**
 * Analytics Data Hook
 * Provides analytics data and calculations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  VaultTransaction,
  TransactionStats,
  VaultPerformanceMetrics,
  TransactionFilter,
  ANALYTICS_PERIODS,
} from '../types/TransactionHistory';
import {
  calculateTransactionStats,
  calculateVaultPerformance,
  filterTransactions,
} from '../utils/AnalyticsUtils';

export const useAnalytics = (
  transactions: VaultTransaction[] = [],
  vaultId: string,
  createdAt: number,
  currentBalance: number
) => {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [performance, setPerformance] = useState<VaultPerformanceMetrics | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<VaultTransaction[]>(transactions);
  const [currentFilter, setCurrentFilter] = useState<TransactionFilter>({});
  const [selectedPeriod, setSelectedPeriod] = useState(ANALYTICS_PERIODS[2]); // Default to 30 days

  // Calculate stats when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      const newStats = calculateTransactionStats(transactions);
      setStats(newStats);

      const newPerformance = calculateVaultPerformance(
        vaultId,
        createdAt,
        transactions,
        currentBalance
      );
      setPerformance(newPerformance);
    }
  }, [transactions, vaultId, createdAt, currentBalance]);

  // Apply filters
  useEffect(() => {
    const filtered = filterTransactions(transactions, currentFilter);
    setFilteredTransactions(filtered);
  }, [transactions, currentFilter]);

  // Filter by selected period
  const applyPeriodFilter = useCallback((periodValue: string) => {
    const period = ANALYTICS_PERIODS.find((p) => p.value === periodValue);
    if (!period) return;

    setSelectedPeriod(period);

    if (period.value === 'all') {
      setCurrentFilter((prev) => {
        const { startDate, endDate, ...rest } = prev;
        return rest;
      });
    } else {
      const endDate = Date.now();
      const startDate = endDate - period.daysCount * 24 * 60 * 60 * 1000;

      setCurrentFilter((prev) => ({
        ...prev,
        startDate,
        endDate,
      }));
    }
  }, []);

  // Update filters
  const updateFilter = useCallback((newFilter: TransactionFilter) => {
    setCurrentFilter((prev) => ({
      ...prev,
      ...newFilter,
    }));
  }, []);

  // Clear filters
  const clearFilters = useCallback(() => {
    setCurrentFilter({});
    setSelectedPeriod(ANALYTICS_PERIODS[2]);
  }, []);

  return {
    stats,
    performance,
    filteredTransactions,
    currentFilter,
    selectedPeriod,
    applyPeriodFilter,
    updateFilter,
    clearFilters,
  };
};

export default useAnalytics;
