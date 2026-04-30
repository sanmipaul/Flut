import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalyticsDashboard from './AnalyticsDashboard';
import { TransactionType } from '../types/TransactionHistory';

const transactions = [
  {
    id: 'tx-1',
    vaultId: 'vault-1',
    type: TransactionType.DEPOSIT,
    amount: 1000000,
    timestamp: Date.now() - 1000 * 60 * 60 * 24,
    blockHeight: 1,
    txId: '0xabc',
    status: 'confirmed',
    description: 'Initial deposit',
    initiatedBy: 'user',
  },
  {
    id: 'tx-2',
    vaultId: 'vault-1',
    type: TransactionType.WITHDRAWAL,
    amount: 500000,
    timestamp: Date.now() - 1000 * 60 * 60 * 12,
    blockHeight: 2,
    txId: '0xdef',
    status: 'confirmed',
    description: 'Partial withdrawal',
    initiatedBy: 'user',
  },
];

describe('AnalyticsDashboard', () => {
  it('renders key analytics summary cards and transaction list', () => {
    render(
      <AnalyticsDashboard
        vaultId="vault-1"
        transactions={transactions}
        transactionTypes={[TransactionType.DEPOSIT, TransactionType.WITHDRAWAL]}
        createdAt={Date.now() - 1000 * 60 * 60 * 24 * 7}
        currentBalance={500000}
      />
    );

    expect(screen.getByText('Total Transactions')).toBeDefined();
    expect(screen.getByText('Confirmed Volume')).toBeDefined();
    expect(screen.getByText('Recent Transactions')).toBeDefined();
    expect(screen.getByText('Deposit')).toBeDefined();
  });
});
