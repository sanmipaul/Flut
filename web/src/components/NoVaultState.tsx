import React from 'react';

interface NoVaultStateProps {
  onCreateVault?: () => void;
}

export const NoVaultState: React.FC<NoVaultStateProps> = ({ onCreateVault }) => (
  <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
    <div className="mb-4 rounded-full bg-indigo-50 p-4">
      <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-700 mb-2">No vaults yet</h3>
    <p className="text-sm text-gray-500 max-w-xs mb-5">
      Create your first savings vault to start tracking deposits and analytics.
    </p>
    {onCreateVault && (
      <button
        onClick={onCreateVault}
        className="rounded bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Create vault
      </button>
    )}
  </div>
);
