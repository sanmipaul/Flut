import React from 'react';
import { useIsMobile } from '../context/ResponsiveContext';

interface VaultCardProps {
  vaultId: string;
  vaultName?: string;
  amount: number;
  unlockDate: string;
  status: 'locked' | 'unlocked' | 'withdrawn';
  owner: string;
  onViewDetails: () => void;
  onWithdraw?: () => void;
  isLoading?: boolean;
  daysRemaining?: number;
}

export const VaultCard: React.FC<VaultCardProps> = ({
  vaultId,
  vaultName = `Vault #${vaultId}`,
  amount,
  unlockDate,
  status,
  owner,
  onViewDetails,
  onWithdraw,
  isLoading = false,
  daysRemaining,
}) => {
  const isMobile = useIsMobile();

  const getStatusColor = (s: string): string => {
    switch (s) {
      case 'unlocked':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'locked':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusDisplay = {
    locked: `Locked - ${daysRemaining || 0} days`,
    unlocked: 'Ready to Withdraw',
    withdrawn: 'Withdrawn',
  };

  return (
    <div
      className={`
        vault-card
        ${isMobile ? 'w-full mb-4' : 'w-80 h-80 mb-4 mr-4'}
        bg-white
        rounded-lg
        shadow-md
        hover:shadow-lg
        transition-shadow
        duration-300
        p-4
        ${isMobile ? 'border border-gray-200' : ''}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} text-gray-900`}>
            {vaultName}
          </h3>
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'} truncate`}>
            ID: {vaultId}
          </p>
        </div>
        <span
          className={`
            px-3 py-1
            rounded-full
            text-sm
            font-medium
            border
            whitespace-nowrap
            ml-2
            ${getStatusColor(status)}
          `}
        >
          {statusDisplay[status as keyof typeof statusDisplay]}
        </span>
      </div>

      {/* Amount Display */}
      <div className={`mb-4 ${isMobile ? 'py-2' : 'py-3'} border-t border-b border-gray-200`}>
        <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Amount</p>
        <p
          className={`font-bold text-blue-600 ${isMobile ? 'text-lg' : 'text-2xl'}`}
        >
          {(amount / 1000000).toFixed(2)} STX
        </p>
      </div>

      {/* Unlock Date */}
      <div className={`mb-4 ${isMobile ? 'text-sm' : ''}`}>
        <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Unlock Date</p>
        <p className={`text-gray-900 font-medium ${isMobile ? 'text-sm' : ''}`}>
          {new Date(unlockDate).toLocaleDateString()}
        </p>
      </div>

      {/* Owner Display */}
      <div className={`mb-4 ${isMobile ? 'text-sm' : ''}`}>
        <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Owner</p>
        <p className={`text-gray-900 font-mono truncate ${isMobile ? 'text-xs' : 'text-sm'}`}>
          {owner.substring(0, 10)}...{owner.substring(owner.length - 8)}
        </p>
      </div>

      {/* Actions */}
      <div className={`flex gap-2 ${isMobile ? 'flex-col' : 'flex-row'} mt-${isMobile ? '3' : '4'}`}>
        <button
          onClick={onViewDetails}
          disabled={isLoading}
          className={`
            flex-1
            px-3 py-2
            bg-blue-500
            text-white
            rounded
            hover:bg-blue-600
            disabled:bg-gray-400
            disabled:cursor-not-allowed
            transition
            ${isMobile ? 'text-sm' : ''}
          `}
        >
          View Details
        </button>
        {status === 'unlocked' && onWithdraw && (
          <button
            onClick={onWithdraw}
            disabled={isLoading}
            className={`
              flex-1
              px-3 py-2
              bg-green-500
              text-white
              rounded
              hover:bg-green-600
              disabled:bg-gray-400
              disabled:cursor-not-allowed
              transition
              ${isMobile ? 'text-sm' : ''}
            `}
          >
            Withdraw
          </button>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 rounded-lg">
          <div className="animate-spin text-blue-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultCard;
