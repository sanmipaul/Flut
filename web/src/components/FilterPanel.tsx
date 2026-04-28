import React, { useState, useEffect } from 'react';
import { TransactionType, TransactionFilter } from '../types/TransactionHistory';
import { getTransactionTypeLabel } from '../utils/AnalyticsUtils';

interface FilterPanelProps {
  onFilterChange: (filter: TransactionFilter) => void;
  transactionTypes: TransactionType[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange, transactionTypes }) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    dateRange: true,
    type: false,
    amount: false,
    status: false,
  });

  // State for selected transaction types with type safety
  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
  // State for selected status filters
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  // State for date range filters
  const [startDate, setStartDate] = useState<string>('');

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
    // Validate amount range to ensure min <= max when both are set
    if (filter.minAmount !== undefined && filter.maxAmount !== undefined && filter.minAmount > filter.maxAmount) {
      return;
    }
    onFilterChange(filter);
  }, [selectedTypes, selectedStatuses, startDate, endDate, minAmount, maxAmount, onFilterChange]);


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

  const resetFilters = useCallback(() => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    onFilterChange({});
  }, [onFilterChange]);

  const FilterSection: React.FC<{ title: string; sectionKey: string; children: React.ReactNode }> = ({
    title,
    sectionKey,
    children,
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <span className={`text-gray-500 transition-transform ${expandedSections[sectionKey] ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>
      {expandedSections[sectionKey] && <div className="px-4 py-3 bg-gray-50 space-y-3">{children}</div>}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-fit sticky top-4">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Reset
        </button>
      </div>

      {/* Date Range Filter */}
      <FilterSection title="Date Range" sectionKey="dateRange">
        <div className="space-y-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleDateChange('start', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="End date"
          />
        </div>
      </FilterSection>

      {/* Transaction Type Filter */}
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

      {/* Amount Range Filter */}
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

      {/* Status Filter */}
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
