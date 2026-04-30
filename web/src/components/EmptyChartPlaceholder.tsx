import React from 'react';

interface EmptyChartPlaceholderProps {
  label?: string;
  height?: number;
}

export const EmptyChartPlaceholder: React.FC<EmptyChartPlaceholderProps> = ({
  label = 'No data for selected period',
  height = 200,
}) => (
  <div
    className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50"
    style={{ height }}
  >
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);
