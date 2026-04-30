import React from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { EmergencyWithdrawalRequest } from '../types/EmergencyWithdrawal';
import { formatCurrency } from '../utils/AnalyticsUtils';

interface EmergencyWithdrawalHistoryProps {
  history: EmergencyWithdrawalRequest[];
  isLoading?: boolean;
}

export const EmergencyWithdrawalHistory: React.FC<EmergencyWithdrawalHistoryProps> = ({
  history,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No Emergency Withdrawals</h3>
        <p className="mt-1 text-sm text-gray-500">
          This vault has not had any emergency withdrawals.
        </p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Emergency Withdrawal History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {history.map((withdrawal) => (
            <div key={withdrawal.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  Vault #{withdrawal.vaultId}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Requested</p>
                  <p className="font-semibold">{formatCurrency(withdrawal.requestedAmount)} STX</p>
                </div>
                <div>
                  <p className="text-gray-500">Penalty</p>
                  <p className="font-semibold text-red-600">-{formatCurrency(withdrawal.penaltyAmount)} STX</p>
                </div>
                <div>
                  <p className="text-gray-500">Received</p>
                  <p className="font-semibold text-green-600">{formatCurrency(withdrawal.netAmount)} STX</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold">{new Date(withdrawal.timestamp).toLocaleDateString()}</p>
                </div>
              </div>

              {withdrawal.txId && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {withdrawal.txId}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Emergency Withdrawal History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vault ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Penalty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Net Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((withdrawal) => (
              <tr key={withdrawal.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{withdrawal.vaultId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(withdrawal.requestedAmount)} STX
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  -{formatCurrency(withdrawal.penaltyAmount)} STX
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  {formatCurrency(withdrawal.netAmount)} STX
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(withdrawal.timestamp).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                  {withdrawal.txId ? `${withdrawal.txId.slice(0, 8)}...` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmergencyWithdrawalHistory;