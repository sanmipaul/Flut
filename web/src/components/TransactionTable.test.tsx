import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TransactionTable from './TransactionTable';
import { TransactionType } from '../types/TransactionHistory';

const transactions = [
  {
    id: 'tx-a',
    vaultId: 'vault-1',
    type: TransactionType.WITHDRAWAL,
    amount: 500000,
    timestamp: 1650000000000,
    blockHeight: 12,
    txId: '0x123',
    status: 'confirmed',
    description: 'Withdraw',
    initiatedBy: 'user',
  },
  {
    id: 'tx-b',
    vaultId: 'vault-1',
    type: TransactionType.DEPOSIT,
    amount: 1000000,
    timestamp: 1650000001000,
    blockHeight: 13,
    txId: '0x456',
    status: 'confirmed',
    description: 'Deposit',
    initiatedBy: 'user',
  },
];

describe('TransactionTable', () => {
  it('sorts transaction rows by type when the Type header is clicked', () => {
    render(<TransactionTable transactions={transactions} />);

    const typeHeader = screen.getByText('Type');
    fireEvent.click(typeHeader);

    const rows = screen.getAllByRole('row');
    expect(rows[1].textContent).toContain('Deposit');
    expect(rows[2].textContent).toContain('Withdraw');
  });
});
