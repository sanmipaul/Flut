import { useMemo } from 'react';
import { VaultTransaction } from '../types/TransactionHistory';

interface EmptyStateInfo {
  hasTransactions: boolean;
  hasFilteredTransactions: boolean;
  isFilteredEmpty: boolean;
}

export function useEmptyState(
  transactions: VaultTransaction[],
  filteredTransactions: VaultTransaction[],
): EmptyStateInfo {
  return useMemo(() => {
    const hasTransactions = transactions.length > 0;
    const hasFilteredTransactions = filteredTransactions.length > 0;
    return {
      hasTransactions,
      hasFilteredTransactions,
      isFilteredEmpty: hasTransactions && !hasFilteredTransactions,
    };
  }, [transactions, filteredTransactions]);
}
