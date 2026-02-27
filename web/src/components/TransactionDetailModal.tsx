import React from 'react';
import { VaultTransaction } from '../types/TransactionHistory';
import { getTransactionTypeLabel, formatCurrency, formatPercentage } from '../utils/AnalyticsUtils';
import { useIsMobile } from '../context/ResponsiveContext';

interface TransactionDetailModalProps {
  transaction: VaultTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, isOpen, onClose }) => {
  const isMobile = useIsMobile();

  if (!isOpen || !transaction) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      vault_created: 'bg-blue-50 border-blue-200',
      deposit: 'bg-green-50 border-green-200',
      withdrawal: 'bg-orange-50 border-orange-200',
      emergency_withdrawal: 'bg-red-50 border-red-200',
      penalty_applied: 'bg-red-100 border-red-300',
      beneficiary_set: 'bg-purple-50 border-purple-200',
      unlock_date_changed: 'bg-indigo-50 border-indigo-200',
      nft_minted: 'bg-pink-50 border-pink-200',
      stacking_enabled: 'bg-teal-50 border-teal-200',
      stacking_yield_claimed: 'bg-emerald-50 border-emerald-200',
    };
    return typeColors[type] || 'bg-gray-50 border-gray-200';
  };

  const contentJSX = (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-4 rounded-lg border-2 ${getTypeColor(transaction.type)}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{getTransactionTypeLabel(transaction.type)}</h2>
            <p className="text-sm text-gray-600 mt-1">{transaction.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(transaction.status)}`}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
        </div>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(transaction.amount)} STX</p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Date & Time</p>
          <p className="text-lg font-semibold text-gray-900">{new Date(transaction.timestamp).toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Block Height</p>
          <p className="text-lg font-semibold text-gray-900">{transaction.blockHeight}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Transaction ID</p>
          <p className="text-sm font-mono text-gray-900 break-all">{transaction.txId}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Initiated By</p>
          <p className="text-sm font-mono text-gray-900 break-all">{transaction.initiatedBy}</p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Description</p>
        <p className="text-gray-900">{transaction.description}</p>
      </div>

      {/* Fees and Gas */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Transaction Costs</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">Gas Used:</span>
            <span className="font-semibold text-gray-900">{transaction.gasUsed}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Fee:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(transaction.fee)} STX</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Additional Metadata</p>
          <div className="space-y-2">
            {Object.entries(transaction.metadata || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-gray-700 capitalize">{key.replace(/_/g, ' ')}:</span>
                <span className="font-semibold text-gray-900">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Close
      </button>
    </div>
  );

  // Mobile drawer style
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
        <div className="bg-white w-full max-h-[90vh] rounded-t-2xl overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">Transaction Details</h1>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              ×
            </button>
          </div>
          {contentJSX}
        </div>
      </div>
    );
  }

  // Desktop modal style
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition text-2xl font-light"
          >
            ×
          </button>
        </div>
        <div className="p-6">{contentJSX}</div>
      </div>
    </div>
  );
};

export default TransactionDetailModal;
