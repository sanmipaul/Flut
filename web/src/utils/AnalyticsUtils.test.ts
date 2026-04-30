import { filterTransactions, calculateTransactionStats } from './AnalyticsUtils';
import { TransactionType } from '../types/TransactionHistory';

const transactions = [
  {
    id: '1',
    vaultId: 'vault-1',
    type: TransactionType.DEPOSIT,
    amount: 1000000,
    timestamp: 1650000000000,
    blockHeight: 1,
    txId: '0x1',
    status: 'confirmed',
    description: 'Initial deposit',
    initiatedBy: 'owner',
  },
  {
    id: '2',
    vaultId: 'vault-1',
    type: TransactionType.WITHDRAWAL,
    amount: 250000,
    timestamp: 1650001000000,
    blockHeight: 2,
    txId: '0x2',
    status: 'confirmed',
    description: 'Withdrawal',
    initiatedBy: 'owner',
  },
  {
    id: '3',
    vaultId: 'vault-1',
    type: TransactionType.PENALTY_APPLIED,
    amount: 50000,
    timestamp: 1650002000000,
    blockHeight: 3,
    txId: '0x3',
    status: 'failed',
    description: 'Penalty',
    initiatedBy: 'owner',
  },
];

describe('AnalyticsUtils', () => {
  it('filters transactions by type and date range', () => {
    const filtered = filterTransactions(transactions, {
      types: [TransactionType.DEPOSIT],
      startDate: 1650000000000,
      endDate: 1650000000000,
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe(TransactionType.DEPOSIT);
  });

  it('calculates transaction stats correctly', () => {
    const stats = calculateTransactionStats(transactions);

    expect(stats.totalTransactions).toBe(3);
    expect(stats.totalVolume).toBe(1250000);
    expect(stats.successRate).toBeCloseTo((2 / 3) * 100, 5);
    expect(stats.transactionsByType[TransactionType.DEPOSIT]).toBe(1);
    expect(stats.transactionsByType[TransactionType.PENALTY_APPLIED]).toBe(1);
  });
});
