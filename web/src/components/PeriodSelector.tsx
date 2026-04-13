import React from 'react';
import { AnalyticsPeriod } from '../types/TransactionHistory';

interface PeriodSelectorProps {
  selectedPeriod: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod['value'] }[] = [
  { label: 'Last 24 Hours', value: 'day' },
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last Year', value: 'year' },
  { label: 'All Time', value: 'all' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  const handlePeriodClick = (value: AnalyticsPeriod['value']): void => {
    const period = {
      value,
      label: PERIOD_OPTIONS.find((p) => p.value === value)?.label || '',
      daysCount: value === 'day' ? 1 : value === 'week' ? 7 : value === 'month' ? 30 : value === 'year' ? 365 : Infinity,
    } as AnalyticsPeriod;
    onPeriodChange(period);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Time Period</h3>
      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handlePeriodClick(option.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod.value === option.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PeriodSelector;
