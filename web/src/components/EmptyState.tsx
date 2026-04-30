import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, icon, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="mb-4 text-gray-300">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
    {action && <div>{action}</div>}
  </div>
);
