import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import VaultImportModal from './VaultImportModal';

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

describe('VaultImportModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <VaultImportModal isOpen={false} onClose={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the title when open', () => {
    render(<VaultImportModal isOpen onClose={jest.fn()} />);
    expect(screen.getByText('Import Vault Backup')).toBeDefined();
  });

  it('shows the drop zone in idle state', () => {
    render(<VaultImportModal isOpen onClose={jest.fn()} />);
    expect(document.querySelector('.drop-zone')).not.toBeNull();
  });

  it('shows "Drop your backup file here" hint', () => {
    render(<VaultImportModal isOpen onClose={jest.fn()} />);
    expect(screen.getByText(/drop your backup file here/i)).toBeDefined();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(<VaultImportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when the X button is clicked', () => {
    const onClose = jest.fn();
    render(<VaultImportModal isOpen onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close import modal/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('has a file input that accepts .json', () => {
    render(<VaultImportModal isOpen onClose={jest.fn()} />);
    const input = document.querySelector('.drop-zone__input') as HTMLInputElement;
    expect(input?.accept).toContain('.json');
  });

  it('drop zone has correct ARIA role and label', () => {
    render(<VaultImportModal isOpen onClose={jest.fn()} />);
    const dropZone = document.querySelector('.drop-zone');
    expect(dropZone?.getAttribute('role')).toBe('button');
    expect(dropZone?.getAttribute('aria-label')).toContain('drop');
  });

  it('renders dialog role with aria-modal', () => {
    render(<VaultImportModal isOpen onClose={jest.fn()} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });
});
