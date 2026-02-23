import React from 'react';
import { AnalyticsPeriod } from '../types/TransactionHistory';

interface PeriodSelectorProps {
  selectedPeriod: AnalyticsPeriod;
  onPeriodChange: (period: AnalyticsPeriod) => void;
}

const PERIOD_OPTIONS: { label: string; value: AnalyticsPeriod }[] = [
  { label: 'Last 24 Hours', value: 'last_24h' },
  { label: 'Last 7 Days', value: 'last_7d' },
  { label: 'Last 30 Days', value: 'last_30d' },
  { label: 'Last Year', value: 'last_year' },
  { label: 'All Time', value: 'all_time' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Time Period</h3>
      <div className="flex flex-wrap gap-2">
        {PERIOD_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onPeriodChange(option.value)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedPeriod === option.value
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
