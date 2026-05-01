/**
 * FilterPanel
 *
 * Sidebar filter panel for transaction analytics with persistent state.
 * Supports filtering by date range, transaction type, amount range, and status.
 * All filter state is persisted to localStorage and sessionStorage.
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TransactionType, TransactionFilter } from '../types/TransactionHistory';
import { getTransactionTypeLabel } from '../utils/AnalyticsUtils';
import {
  saveDualStorage,
  loadDualStorage,
  clearDualStorage,
} from '../utils/storage';

const FILTER_STORAGE_KEY = 'flut-filter-panel-state';

interface FilterPanelState {
  selectedTypes: TransactionType[];
  selectedStatuses: string[];
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  expandedSections: { [key: string]: boolean };
}

interface FilterPanelProps {
  onFilterChange: (filter: TransactionFilter) => void;
  transactionTypes: TransactionType[];
}

const getDefaultState = (): FilterPanelState => ({
  selectedTypes: [],
  selectedStatuses: [],
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  expandedSections: {
    dateRange: true,
    type: false,
    amount: false,
    status: false,
  });

  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  // Use useEffect to ensure filter is applied after all state updates are complete
  // This prevents race conditions and stale closure issues
  useEffect(() => {
    const filter: TransactionFilter = {
      types: selectedTypes.length > 0 ? selectedTypes : undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses as ('pending' | 'confirmed' | 'failed')[] : undefined,
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      endDate: endDate ? new Date(endDate).getTime() : undefined,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined,
    };
    onFilterChange(filter);
  }, [selectedTypes, selectedStatuses, startDate, endDate, minAmount, maxAmount, onFilterChange]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTypeToggle = (type: TransactionType) => {
    setSelectedTypes((prevTypes) =>
      prevTypes.includes(type)
        ? prevTypes.filter((t) => t !== type)
        : [...prevTypes, type]
    );
  };

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses((prevStatuses) =>
      prevStatuses.includes(status)
        ? prevStatuses.filter((s) => s !== status)
        : [...prevStatuses, status]
    );
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    const selectedDate = value ? new Date(value).getTime() : 0;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Prevent selecting future dates
    if (selectedDate > today.getTime()) {
      return;
    }
    
    if (type === 'start') {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  const handleAmountChange = (type: 'min' | 'max', value: string) => {
    // Validate input: only allow positive numbers or empty string
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (type === 'min') {
        setMinAmount(value);
      } else {
        setMaxAmount(value);
      }
    }
    // If input is invalid (negative, non-numeric), ignore it
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    onFilterChange({});
  };

  const clearAllStorage = () => {
    clearDualStorage(FILTER_STORAGE_KEY);
    resetFilters();
  };

  const activeFilterCount = selectedTypes.length + selectedStatuses.length + (startDate ? 1 : 0) + (endDate ? 1 : 0) + (minAmount ? 1 : 0) + (maxAmount ? 1 : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="text-xs text-blue-600 font-medium">
              {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={clearAllStorage}
            className="text-xs text-gray-500 hover:text-gray-700 font-medium px-2 py-1 rounded hover:bg-gray-100"
            title="Clear saved filters"
          >
            Clear Storage
          </button>
          <button
            onClick={resetFilters}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Reset
          </button>
        </div>
      </div>

      <FilterSection title="Date Range" sectionKey="dateRange">
        <div className="space-y-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </FilterSection>

      <FilterSection title="Transaction Type" sectionKey="type">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {transactionTypes.map((type) => (
            <label key={type} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{getTransactionTypeLabel(type)}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Amount Range" sectionKey="amount">
        <div className="space-y-2">
          <input
            type="number"
            value={minAmount}
            onChange={(e) => handleAmountChange('min', e.target.value)}
            placeholder="Min amount"
            inputMode="decimal"
            min="0"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => handleAmountChange('max', e.target.value)}
            placeholder="Max amount"
            inputMode="decimal"
            min="0"
            step="any"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </FilterSection>

      <FilterSection title="Status" sectionKey="status">
        <div className="space-y-2">
          {['confirmed', 'pending', 'failed'].map((status) => (
            <label key={status} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => handleStatusToggle(status)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 capitalize">{status}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default FilterPanel;
