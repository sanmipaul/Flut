import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VaultExportModal from './VaultExportModal';
import { VaultSnapshot } from '../utils/vaultExport';

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

// Stub download APIs
jest.spyOn(document.body, 'appendChild').mockImplementation((el) => el);
jest.spyOn(document.body, 'removeChild').mockImplementation((el) => el);
const mockAnchor = { href: '', download: '', click: jest.fn() };
jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
// @ts-ignore
global.URL.createObjectURL = jest.fn(() => 'blob:mock');
// @ts-ignore
global.URL.revokeObjectURL = jest.fn();

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

const vaults: VaultSnapshot[] = [
  { vaultId: 1, creator: 'SP1', amount: 2000, unlockHeight: 100, createdAt: 5, isWithdrawn: false, currentBlockHeight: 10 },
  { vaultId: 2, creator: 'SP2', amount: 500, unlockHeight: 50, createdAt: 3, isWithdrawn: true, currentBlockHeight: 10 },
];

describe('VaultExportModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <VaultExportModal isOpen={false} vaults={vaults} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the title when open', () => {
    render(<VaultExportModal isOpen vaults={vaults} onClose={jest.fn()} />);
    expect(screen.getByText('Export Vault Backup')).toBeDefined();
  });

  it('shows total vault count in summary', () => {
    render(<VaultExportModal isOpen vaults={vaults} onClose={jest.fn()} />);
    expect(screen.getByText('2')).toBeDefined();
  });

  it('shows active vault count in summary', () => {
    render(<VaultExportModal isOpen vaults={vaults} onClose={jest.fn()} />);
    expect(screen.getByText('1')).toBeDefined();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(<VaultExportModal isOpen vaults={vaults} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the X button is clicked', () => {
    const onClose = jest.fn();
    render(<VaultExportModal isOpen vaults={vaults} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close export modal/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('download button triggers exportVaults', () => {
    render(<VaultExportModal isOpen vaults={vaults} onClose={jest.fn()} />);
    fireEvent.click(screen.getByText(/download backup/i));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('download button is disabled when vaults list is empty', () => {
    render(<VaultExportModal isOpen vaults={[]} onClose={jest.fn()} />);
    const btn = screen.getByText(/download backup/i) as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('shows "Settings Included: Yes" in the summary', () => {
    render(<VaultExportModal isOpen vaults={vaults} onClose={jest.fn()} />);
    expect(screen.getByText('✓ Yes')).toBeDefined();
  });
});
