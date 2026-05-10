/**
 * Tests for FilterPanel persistence functionality.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FilterPanel } from './FilterPanel';
import { TransactionType } from '../types/TransactionHistory';

// Mock storage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true,
});

vi.stubGlobal('localStorage', mockLocalStorage);
vi.stubGlobal('sessionStorage', mockSessionStorage);

const mockTransactionTypes: TransactionType[] = ['transfer', 'mint', 'burn'];

describe('FilterPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
  });

  it('renders filter sections', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );
    expect(screen.getByText('Filters')).toBeDefined();
    expect(screen.getByText('Date Range')).toBeDefined();
    expect(screen.getByText('Transaction Type')).toBeDefined();
    expect(screen.getByText('Amount Range')).toBeDefined();
    expect(screen.getByText('Status')).toBeDefined();
  });

  it('persists filter state to localStorage when type filter changes', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const transferCheckbox = screen.getByLabelText('transfer');
    fireEvent.click(transferCheckbox);

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(mockSessionStorage.setItem).toHaveBeenCalled();
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        types: ['transfer'],
      })
    );
  });

  it('persists date filter changes', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const startDateInput = screen.getByLabelText('Start date') as HTMLInputElement;
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('persists amount filter changes', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const minAmountInput = screen.getByPlaceholderText('Min amount') as HTMLInputElement;
    fireEvent.change(minAmountInput, { target: { value: '100' } });

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(onFilterChange).toHaveBeenCalled();
  });

  it('persists status filter changes', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const confirmedCheckbox = screen.getByLabelText('confirmed');
    fireEvent.click(confirmedCheckbox);

    expect(mockLocalStorage.setItem).toHaveBeenCalled();
    expect(mockSessionStorage.setItem).toHaveBeenCalled();
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ['confirmed'],
      })
    );
  });

  it('shows active filter count', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const transferCheckbox = screen.getByLabelText('transfer');
    fireEvent.click(transferCheckbox);

    expect(screen.getByText(/1 active filter/)).toBeDefined();
  });

  it('resets filters and persists empty state', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    // Add a filter first
    const transferCheckbox = screen.getByLabelText('transfer');
    fireEvent.click(transferCheckbox);

    // Then reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(onFilterChange).toHaveBeenCalledWith({});
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  it('clears storage when clear storage button is clicked', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const clearStorageButton = screen.getByText('Clear Storage');
    fireEvent.click(clearStorageButton);

    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('flut-filter-panel-state');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('flut-filter-panel-state');
    expect(onFilterChange).toHaveBeenCalledWith({});
  });

  it('loads persisted state from storage on mount', () => {
    const persistedState = {
      selectedTypes: ['mint'] as TransactionType[],
      selectedStatuses: ['confirmed'],
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      minAmount: '100',
      maxAmount: '1000',
      expandedSections: {
        dateRange: true,
        type: false,
        amount: false,
        status: false,
      },
    };
    mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(persistedState));

    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    // Verify filter was applied on mount
    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({
        types: ['mint'],
        status: ['confirmed'],
      })
    );
  });

  it('shows multiple active filters count correctly', () => {
    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    // Add multiple filters
    const transferCheckbox = screen.getByLabelText('transfer');
    fireEvent.click(transferCheckbox);

    const confirmedCheckbox = screen.getByLabelText('confirmed');
    fireEvent.click(confirmedCheckbox);

    expect(screen.getByText(/2 active filters/)).toBeDefined();
  });

  it('uses sessionStorage as fallback when localStorage is unavailable', () => {
    // Simulate localStorage being unavailable
    mockLocalStorage.setItem.mockImplementationOnce(() => {
      throw new Error('Quota exceeded');
    });

    const onFilterChange = vi.fn();
    render(
      <FilterPanel
        onFilterChange={onFilterChange}
        transactionTypes={mockTransactionTypes}
      />
    );

    const transferCheckbox = screen.getByLabelText('transfer');
    fireEvent.click(transferCheckbox);

    // Should still save to sessionStorage even if localStorage fails
    expect(mockSessionStorage.setItem).toHaveBeenCalled();
  });
});
