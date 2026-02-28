import React from 'react';
import { render, screen } from '@testing-library/react';
import VaultDetail from './VaultDetail';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: jest.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

const mockVault = {
  vaultId: 1,
  creator: 'SP1ABCDEF',
  amount: 5000,
  unlockHeight: 100,
  createdAt: 10,
  isWithdrawn: false,
  currentBlockHeight: 50,
};

const onFetchVault = jest.fn().mockResolvedValue(mockVault);
const onWithdraw = jest.fn().mockResolvedValue(undefined);
const onSetBeneficiary = jest.fn().mockResolvedValue(undefined);

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

  it('renders VaultSettingsPanel toggle after load', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    const toggle = await screen.findByRole('button', { name: /vault settings/i });
    expect(toggle).toBeDefined();
  });

  it('shows vault id in header when no nickname is set', async () => {
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    const heading = await screen.findByRole('heading', { level: 2 });
    expect(heading.textContent).toContain('#1');
  });

  it('shows nickname in header when set in localStorage', async () => {
    localStorageMock.setItem(
      'flut:vault-settings:1',
      JSON.stringify({ nickname: 'Savings Goal', note: '', colorTag: 'none', compactDisplay: false, pinned: false })
    );
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    const heading = await screen.findByRole('heading', { level: 2 });
    expect(heading.textContent).toContain('Savings Goal');
  });

  it('shows note banner when note is set', async () => {
    localStorageMock.setItem(
      'flut:vault-settings:1',
      JSON.stringify({ nickname: '', note: 'My reminder', colorTag: 'none', compactDisplay: false, pinned: false })
    );
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    const note = await screen.findByText('My reminder');
    expect(note).toBeDefined();
  });

  it('applies color tag CSS class when colorTag is set', async () => {
    localStorageMock.setItem(
      'flut:vault-settings:1',
      JSON.stringify({ nickname: '', note: '', colorTag: 'blue', compactDisplay: false, pinned: false })
    );
    render(
      <VaultDetail
        vaultId={1}
        onFetchVault={onFetchVault}
        onWithdraw={onWithdraw}
        onSetBeneficiary={onSetBeneficiary}
      />
    );
    await screen.findByRole('heading', { level: 2 });
    const detail = document.querySelector('.vault-detail--tag-blue');
    expect(detail).not.toBeNull();
  });
});
