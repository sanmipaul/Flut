import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { VaultDetail } from './VaultDetail';

const mockVault = {
  vaultId: 1,
  creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  amount: 1000,
  unlockHeight: 300,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 150,
};

const lockedFetchVault = jest.fn().mockResolvedValue(mockVault);
const withdrawnFetchVault = jest.fn().mockResolvedValue({ ...mockVault, isWithdrawn: true });
const unlockedFetchVault = jest.fn().mockResolvedValue({
  ...mockVault,
  currentBlockHeight: 350,
});

describe('VaultDetail — VaultCountdown integration', () => {
  it('renders a timer when vault is locked', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onWithdraw={jest.fn()}
        onSetBeneficiary={jest.fn()}
        onFetchVault={lockedFetchVault}
        onEmergencyWithdraw={jest.fn()}
        penaltyRate={10}
      />,
    );
    await waitFor(() => expect(screen.getByRole('timer')).toBeDefined());
  });

  it('renders Withdrawn badge when vault is withdrawn', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onWithdraw={jest.fn()}
        onSetBeneficiary={jest.fn()}
        onFetchVault={withdrawnFetchVault}
        onEmergencyWithdraw={jest.fn()}
        penaltyRate={10}
      />,
    );
    await waitFor(() => expect(screen.getByText('Withdrawn')).toBeDefined());
  });

  it('renders "ready to withdraw" when vault is unlocked', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onWithdraw={jest.fn()}
        onSetBeneficiary={jest.fn()}
        onFetchVault={unlockedFetchVault}
        onEmergencyWithdraw={jest.fn()}
        penaltyRate={10}
      />,
    );
    await waitFor(() => expect(screen.getByText(/ready to withdraw/i)).toBeDefined());
  });
});
