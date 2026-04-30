import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { EmergencyWithdrawalRequest } from '../types/EmergencyWithdrawal';
import { formatCurrency } from '../utils/AnalyticsUtils';

interface EmergencyWithdrawalNotificationProps {
  withdrawal: EmergencyWithdrawalRequest;
  onDismiss: () => void;
  autoHideDelay?: number; // milliseconds
}

export const EmergencyWithdrawalNotification: React.FC<EmergencyWithdrawalNotificationProps> = ({
  withdrawal,
  onDismiss,
  autoHideDelay = 10000, // 10 seconds
}) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(autoHideDelay / 1000);

  useEffect(() => {
    if (autoHideDelay > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsVisible(false);
            onDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [autoHideDelay, onDismiss]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <svg className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'pending':
        return (
          <svg className="animate-spin h-6 w-6 text-yellow-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Emergency withdrawal completed successfully!';
      case 'pending':
        return 'Emergency withdrawal is being processed...';
      case 'failed':
        return 'Emergency withdrawal failed. Please try again.';
      default:
        return 'Emergency withdrawal status unknown.';
    }
  };

  if (!isVisible) return null;

  const notificationContent = (
    <div className={`p-4 rounded-lg border shadow-lg ${getStatusColor(withdrawal.status)}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getStatusIcon(withdrawal.status)}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {getStatusMessage(withdrawal.status)}
          </p>

          <div className="mt-2 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <span>Vault #{withdrawal.vaultId}</span>
              <span className="font-semibold">{formatCurrency(withdrawal.netAmount)} STX received</span>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
              <span>Penalty: {formatCurrency(withdrawal.penaltyAmount)} STX</span>
              <span>{new Date(withdrawal.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          {withdrawal.txId && (
            <div className="mt-2 text-xs text-gray-600 font-mono bg-white p-2 rounded">
              TX: {withdrawal.txId}
            </div>
          )}

          {autoHideDelay > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Auto-dismissing in {timeLeft}s
              </span>
              <button
                onClick={() => {
                  setIsVisible(false);
                  onDismiss();
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed top-4 left-4 right-4 z-50">
        {notificationContent}
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      {notificationContent}
    </div>
  );
};

export default EmergencyWithdrawalNotification;