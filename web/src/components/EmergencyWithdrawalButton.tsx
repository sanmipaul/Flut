import React from 'react';
// Emergency withdrawal button component for initiating emergency withdrawals
import { useIsMobile } from '../context/ResponsiveContext';

interface EmergencyWithdrawalButtonProps {
  onClick: () => void;
  isAvailable: boolean;
  isLoading?: boolean;
  penaltyRate: number;
  className?: string;
}

export const EmergencyWithdrawalButton: React.FC<EmergencyWithdrawalButtonProps> = ({
  onClick,
  isAvailable,
  isLoading = false,
  penaltyRate,
  className = '',
}) => {
  const isMobile = useIsMobile();

  if (!isAvailable) {
    return (
      <button
        disabled
        className={`w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed ${className}`}
        aria-disabled="true"
        title="Emergency withdrawal is not available for this vault"
      >
        Emergency Withdrawal Unavailable
      </button>
    );
  }

  const buttonContent = (
    <div className="flex items-center justify-center gap-2">
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span>
        {isLoading ? 'Processing...' : 'Emergency Withdrawal'}
      </span>
      {!isLoading && (
        <span className="text-xs opacity-75">
          ({(penaltyRate * 100).toFixed(0)}% penalty)
        </span>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`w-full px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 ${className}`}
        aria-label={`Emergency withdrawal with ${(penaltyRate * 100).toFixed(0)}% penalty`}
        aria-busy={isLoading}
      >
        {buttonContent}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-700 ${className}`}
      aria-label={`Emergency withdrawal with ${(penaltyRate * 100).toFixed(0)}% penalty`}
      aria-busy={isLoading}
    >
      {buttonContent}
    </button>
  );
};

export default EmergencyWithdrawalButton;