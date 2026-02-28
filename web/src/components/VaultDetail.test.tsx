import React from 'react';
import { render, screen } from '@testing-library/react';
import VaultDetail from './VaultDetail';

const mockVault = {
  vaultId: 1,
  creator: 'SP1ABC',
  amount: 5000,
  unlockHeight: 200,
  createdAt: 100,
  isWithdrawn: false,
  currentBlockHeight: 150,
};

const onFetchVault = jest.fn().mockResolvedValue(mockVault);
const onWithdraw = jest.fn().mockResolvedValue(undefined);
const onSetBeneficiary = jest.fn().mockResolvedValue(undefined);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('VaultDetail', () => {
  it('renders loading state initially', () => {
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    expect(screen.getByText(/loading/i)).toBeDefined();
  });

  it('renders VaultLockProgress after vault loads', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    const bar = await screen.findByRole('progressbar');
    expect(bar).toBeDefined();
  });

  it('progressbar shows correct percentage when vault is 50% through lock', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    const bar = await screen.findByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('50');
  });

  it('shows Lock Progress title', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    expect(await screen.findByText('Lock Progress')).toBeDefined();
  });
});
