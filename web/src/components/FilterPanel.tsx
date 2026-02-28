import React, { useState } from 'react';
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

  const [selectedTypes, setSelectedTypes] = useState<TransactionType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTypeToggle = (type: TransactionType) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    applyFilter(newTypes, selectedStatuses, startDate, endDate, minAmount, maxAmount);
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = selectedStatuses.includes(status)
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];
    setSelectedStatuses(newStatuses);
    applyFilter(selectedTypes, newStatuses, startDate, endDate, minAmount, maxAmount);
  };

  const applyFilter = (types: TransactionType[], statuses: string[], start: string, end: string, min: string, max: string) => {
    const filter: TransactionFilter = {
      types: types.length > 0 ? types : undefined,
      statuses: statuses.length > 0 ? statuses : undefined,
      startDate: start ? new Date(start).getTime() : undefined,
      endDate: end ? new Date(end).getTime() : undefined,
      minAmount: min ? parseFloat(min) : undefined,
      maxAmount: max ? parseFloat(max) : undefined,
    };
    onFilterChange(filter);
  };

  const handleDateChange = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      setStartDate(value);
      applyFilter(selectedTypes, selectedStatuses, value, endDate, minAmount, maxAmount);
    } else {
      setEndDate(value);
      applyFilter(selectedTypes, selectedStatuses, startDate, value, minAmount, maxAmount);
    }
  };

  const handleAmountChange = (type: 'min' | 'max', value: string) => {
    if (type === 'min') {
      setMinAmount(value);
      applyFilter(selectedTypes, selectedStatuses, startDate, endDate, value, maxAmount);
    } else {
      setMaxAmount(value);
      applyFilter(selectedTypes, selectedStatuses, startDate, endDate, minAmount, value);
    }
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Start date"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange('end', e.target.value)}
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
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            value={maxAmount}
            onChange={(e) => handleAmountChange('max', e.target.value)}
            placeholder="Max amount"
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
