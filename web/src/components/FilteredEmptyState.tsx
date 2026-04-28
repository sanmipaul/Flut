import React from 'react';

interface FilteredEmptyStateProps {
  onClear: () => void;
}

export const FilteredEmptyState: React.FC<FilteredEmptyStateProps> = ({ onClear }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <h3 className="text-base font-semibold text-gray-600 mb-2">No transactions match your filters</h3>
    <p className="text-sm text-gray-400 mb-4">Try adjusting the period or filter criteria.</p>
    <button
      onClick={onClear}
      className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      Clear filters
    </button>
  </div>
);
