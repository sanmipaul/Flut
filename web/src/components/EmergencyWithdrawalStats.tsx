import React from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { EmergencyWithdrawalRequest } from '../types/EmergencyWithdrawal';
import { formatCurrency, formatPercentage } from '../utils/AnalyticsUtils';

interface EmergencyWithdrawalStatsProps {
  withdrawals: EmergencyWithdrawalRequest[];
  totalVaults: number;
  isLoading?: boolean;
}

export const EmergencyWithdrawalStats: React.FC<EmergencyWithdrawalStatsProps> = ({
  withdrawals,
  totalVaults,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalWithdrawals = withdrawals.length;
  const successfulWithdrawals = withdrawals.filter(w => w.status === 'confirmed').length;
  const totalRequested = withdrawals.reduce((sum, w) => sum + w.requestedAmount, 0);
  const totalPenalties = withdrawals.reduce((sum, w) => sum + w.penaltyAmount, 0);
  const totalPaidOut = withdrawals.reduce((sum, w) => sum + w.netAmount, 0);
  const successRate = totalWithdrawals > 0 ? (successfulWithdrawals / totalWithdrawals) * 100 : 0;
  const vaultsWithEmergency = new Set(withdrawals.map(w => w.vaultId)).size;
  const emergencyRate = totalVaults > 0 ? (vaultsWithEmergency / totalVaults) * 100 : 0;

  const stats = [
    {
      label: 'Total Emergency Withdrawals',
      value: totalWithdrawals.toString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Success Rate',
      value: formatPercentage(successRate),
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      label: 'Total Penalties Collected',
      value: formatCurrency(totalPenalties),
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      label: 'Emergency Usage Rate',
      value: formatPercentage(emergencyRate),
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-4 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}

        {/* Additional mobile stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Requested</p>
            <p className="text-lg font-bold text-gray-900">{formatCurrency(totalRequested)} STX</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600 mb-1">Total Paid Out</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaidOut)} STX</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-6 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}>
            <p className="text-sm font-medium text-gray-600 mb-2">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Withdrawal Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Amount Requested</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRequested)} STX</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Penalties Collected</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPenalties)} STX</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Paid to Users</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaidOut)} STX</p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Vaults with Emergency Withdrawals:</span>
              <span className="font-semibold">{vaultsWithEmergency} / {totalVaults}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Withdrawal Amount:</span>
              <span className="font-semibold">
                {totalWithdrawals > 0 ? formatCurrency(totalRequested / totalWithdrawals) : '0'} STX
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Penalty Amount:</span>
              <span className="font-semibold">
                {totalWithdrawals > 0 ? formatCurrency(totalPenalties / totalWithdrawals) : '0'} STX
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Penalty Rate:</span>
              <span className="font-semibold">
                {totalRequested > 0 ? formatPercentage((totalPenalties / totalRequested) * 100) : '0%'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyWithdrawalStats;