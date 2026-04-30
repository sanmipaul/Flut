import React from 'react';

interface LoadingStateProps {
  label?: string;
  height?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  label = 'Loading analytics...',
  height = 200,
}) => (
  <div
    className="flex flex-col items-center justify-center rounded-lg bg-gray-50"
    style={{ height }}
  >
    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    <p className="text-sm text-gray-400">{label}</p>
  </div>
);
