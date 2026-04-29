import React from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { formatCurrency, formatPenaltyRate } from '../utils/AnalyticsUtils';
import { formatPenaltyDestination } from '../utils/EmergencyWithdrawalUtils';

interface EmergencyWithdrawalConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vaultId: number;
  requestedAmount: number;
  penaltyAmount: number;
  netAmount: number;
  penaltyRate: number;
  penaltyDestination: string;
  isProcessing?: boolean;
}

export const EmergencyWithdrawalConfirmModal: React.FC<EmergencyWithdrawalConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vaultId,
  requestedAmount,
  penaltyAmount,
  netAmount,
  penaltyRate,
  penaltyDestination,
  isProcessing = false,
}) => {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  const content = (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Confirm Emergency Withdrawal</h3>
            <p className="text-sm text-red-700 mt-1">
              This action will permanently withdraw funds from your vault with a penalty.
            </p>
          </div>
        </div>
      </div>

      {/* Vault Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Vault Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Vault ID:</span>
            <span className="font-mono font-semibold">#{vaultId}</span>
          </div>
        </div>
      </div>

      {/* Withdrawal Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Withdrawal Breakdown</h4>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Requested Amount:</span>
            <span className="font-semibold">{formatCurrency(requestedAmount)} STX</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Penalty ({formatPenaltyRate(penaltyRate)}):</span>
            <span className="font-semibold text-red-600">-{formatCurrency(penaltyAmount)} STX</span>
          </div>
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
            <span className="text-gray-900">You Will Receive:</span>
            <span className="text-green-600 text-lg">{formatCurrency(netAmount)} STX</span>
          </div>
        </div>
      </div>

      {/* Penalty Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Penalty Information</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            <strong>Penalty Rate:</strong> {formatPenaltyRate(penaltyRate)}
          </p>
          <p>
            <strong>Destination:</strong> {formatPenaltyDestination(penaltyDestination)}
          </p>
          <p className="mt-2">
            The penalty amount will be sent to the protocol treasury to support the ecosystem.
          </p>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important Notice</h3>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• This action cannot be reversed</li>
              <li>• Your vault will be permanently closed</li>
              <li>• You will lose access to any remaining funds</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={isProcessing}
          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Confirm Withdrawal'}
        </button>
      </div>
    </div>
  );

  // Mobile drawer
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
        <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Confirm Emergency Withdrawal</h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  // Desktop modal
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Confirm Emergency Withdrawal</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition text-2xl font-light"
          >
            ×
          </button>
        </div>
        <div className="p-6">{content}</div>
      </div>
    </div>
  );
};

export default EmergencyWithdrawalConfirmModal;