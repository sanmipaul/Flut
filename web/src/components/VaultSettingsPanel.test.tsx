import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VaultSettingsPanel from './VaultSettingsPanel';

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

describe('VaultSettingsPanel', () => {
  it('renders a toggle button', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    expect(screen.getByRole('button', { name: /vault settings/i })).toBeDefined();
  });

  it('panel body is hidden by default', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    const body = document.getElementById('vault-settings-1');
    expect(body?.hidden).toBe(true);
  });

  it('toggle button expands the panel', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    const body = document.getElementById('vault-settings-1');
    expect(body?.hidden).toBe(false);
  });

  it('toggle button collapses after second click', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    const btn = screen.getByRole('button', { name: /vault settings/i });
    fireEvent.click(btn);
    fireEvent.click(btn);
    const body = document.getElementById('vault-settings-1');
    expect(body?.hidden).toBe(true);
  });

  it('aria-expanded reflects panel state', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    const btn = screen.getByRole('button', { name: /vault settings/i });
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('shows nickname input when expanded', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    expect(screen.getByPlaceholderText(/emergency fund/i)).toBeDefined();
  });

  it('typing in nickname input calls updateSettings', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    const input = screen.getByPlaceholderText(/emergency fund/i);
    fireEvent.change(input, { target: { value: 'Holiday Savings' } });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'flut:vault-settings:1',
      expect.stringContaining('Holiday Savings')
    );
  });

  it('shows color tag buttons for all 6 variants', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    const tagButtons = document.querySelectorAll('.color-tag-btn');
    expect(tagButtons.length).toBe(6);
  });

  it('clicking a color tag button marks it as pressed', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    const redBtn = screen.getByRole('button', { name: /red/i });
    fireEvent.click(redBtn);
    expect(redBtn.getAttribute('aria-pressed')).toBe('true');
  });

  it('Reset to defaults button resets the settings', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    // Enter a nickname
    const input = screen.getByPlaceholderText(/emergency fund/i);
    fireEvent.change(input, { target: { value: 'My Vault' } });
    // Reset
    fireEvent.click(screen.getByRole('button', { name: /reset to defaults/i }));
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('shows personal note textarea when expanded', () => {
    render(<VaultSettingsPanel vaultId={1} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    expect(screen.getByRole('textbox', { name: /personal note/i }) ?? document.querySelector('.settings-textarea')).toBeDefined();
  });

  it('calls onSettingsChange prop when a setting is changed', () => {
    const onSettingsChange = jest.fn();
    render(<VaultSettingsPanel vaultId={1} onSettingsChange={onSettingsChange} />);
    fireEvent.click(screen.getByRole('button', { name: /vault settings/i }));
    const input = screen.getByPlaceholderText(/emergency fund/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    expect(onSettingsChange).toHaveBeenCalled();
  });
});
