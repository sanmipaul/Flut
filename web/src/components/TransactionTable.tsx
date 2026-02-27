import React, { useState } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { VaultTransaction, TransactionType } from '../types/TransactionHistory';
import { getTransactionTypeLabel, formatCurrency } from '../utils/AnalyticsUtils';

interface TransactionTableProps {
  transactions: VaultTransaction[];
  isLoading?: boolean;
  onRowClick?: (transaction: VaultTransaction) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading = false,
  onRowClick,
}) => {
  const isMobile = useIsMobile();
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [sortDesc, setSortDesc] = useState(true);

  const sorted = [...transactions].sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortBy) {
      case 'date':
        aVal = a.timestamp;
        bVal = b.timestamp;
        break;
      case 'amount':
        aVal = a.amount;
        bVal = b.amount;
        break;
      case 'type':
        aVal = a.type;
        bVal = b.type;
        break;
    }
    return sortDesc ? bVal - aVal : aVal - bVal;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {isLoading && <p className="text-center text-gray-500">Loading transactions...</p>}
        {!isLoading && transactions.length === 0 && (
          <p className="text-center text-gray-500">No transactions found</p>
        )}
        {sorted.map((tx) => (
          <div
            key={tx.id}
            onClick={() => onRowClick?.(tx)}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm">{getTransactionTypeLabel(tx.type)}</span>
              <span className={`text-sm font-medium ${getStatusColor(tx.status)}`}>
                {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-blue-600">{formatCurrency(tx.amount)} STX</span>
              <span className="text-xs text-gray-500">{new Date(tx.timestamp).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-gray-600 truncate">{tx.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => { setSortBy('type'); setSortDesc(!sortDesc); }}>
              Type
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => { setSortBy('date'); setSortDesc(!sortDesc); }}>
              Date
            </th>
            <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => { setSortBy('amount'); setSortDesc(!sortDesc); }}>
              Amount
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                Loading transactions...
              </td>
            </tr>
          )}
          {!isLoading && transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                No transactions found
              </td>
            </tr>
          )}
          {sorted.map((tx) => (
            <tr
              key={tx.id}
              onClick={() => onRowClick?.(tx)}
              className="border-b hover:bg-gray-50 transition cursor-pointer"
            >
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {getTransactionTypeLabel(tx.type)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {new Date(tx.timestamp).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-right text-blue-600">
                {formatCurrency(tx.amount)} STX
              </td>
              <td className="px-6 py-4 text-sm">
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(tx.status)} bg-opacity-10`}>
                  {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                {tx.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
