import React from 'react';
import { EmergencyWithdrawalStatus } from '../types/EmergencyWithdrawal';

interface EmergencyWithdrawalStatusProps {
  status: EmergencyWithdrawalStatus;
  error?: string;
  txId?: string;
  onRetry?: () => void;
  onClose?: () => void;
}

export const EmergencyWithdrawalStatusDisplay: React.FC<EmergencyWithdrawalStatusProps> = ({
  status,
  error,
  txId,
  onRetry,
  onClose,
}) => {
  const getStatusConfig = (status: EmergencyWithdrawalStatus) => {
    switch (status) {
      case 'validating':
        return {
          icon: (
            <svg className="animate-spin h-6 w-6 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
          title: 'Validating Request',
          message: 'Checking withdrawal requirements and calculating penalties...',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
        };

      case 'confirming':
        return {
          icon: (
            <svg className="h-6 w-6 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Awaiting Confirmation',
          message: 'Please review and confirm the emergency withdrawal details.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
        };

      case 'processing':
        return {
          icon: (
            <svg className="animate-spin h-6 w-6 text-orange-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ),
          title: 'Processing Withdrawal',
          message: 'Executing emergency withdrawal transaction on the blockchain...',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-800',
        };

      case 'completed':
        return {
          icon: (
            <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Withdrawal Completed',
          message: 'Emergency withdrawal has been successfully processed.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
        };

      case 'failed':
        return {
          icon: (
            <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
          title: 'Withdrawal Failed',
          message: error || 'An error occurred during the emergency withdrawal process.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
        };

      default:
        return {
          icon: null,
          title: 'Unknown Status',
          message: 'The withdrawal status is unknown.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`rounded-lg border p-6 ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
            {config.message}
          </p>

          {txId && status === 'completed' && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-1">Transaction ID:</p>
              <p className="text-xs font-mono bg-white px-2 py-1 rounded border break-all">
                {txId}
              </p>
            </div>
          )}

          {status === 'failed' && onRetry && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
              >
                Retry
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition"
                >
                  Close
                </button>
              )}
            </div>
          )}

          {status === 'completed' && onClose && (
            <div className="mt-4">
              <button
                onClick={onClose}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyWithdrawalStatusDisplay;