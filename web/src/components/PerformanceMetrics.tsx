import React from 'react';
import { VaultPerformanceMetrics } from '../types/TransactionHistory';
import { formatCurrency, formatPercentage } from '../utils/AnalyticsUtils';

interface PerformanceMetricsProps {
  metrics: VaultPerformanceMetrics;
  isLoading?: boolean;
}

const MetricCard: React.FC<{ label: string; value: string; trend?: number; format?: 'currency' | 'percentage' }> = ({
  label,
  value,
  trend,
  format,
}) => {
  const trendColor = trend === undefined ? '' : trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend === undefined ? '' : trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend !== undefined && (
          <span className={`text-sm font-semibold ${trendColor}`}>
            {trendIcon} {Math.abs(trend).toFixed(2)}%
          </span>
        )}
      </div>
    </div>
  );
};

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, isLoading = false }) => {
  if (isLoading) {
    return <div className="text-center text-gray-500 py-8">Loading metrics...</div>;
  }

  const totalValue = metrics.totalDeposited - metrics.totalWithdrawn - metrics.totalPenalties + (metrics.yield || 0);
  const roiPercentage = metrics.totalDeposited > 0 ? ((totalValue - metrics.totalDeposited) / metrics.totalDeposited) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Deposited" value={formatCurrency(metrics.totalDeposited)} />
        <MetricCard label="Total Withdrawn" value={formatCurrency(metrics.totalWithdrawn)} />
        <MetricCard label="Penalties Applied" value={formatCurrency(metrics.totalPenalties)} format="currency" />
        <MetricCard label="Yield Earned" value={formatCurrency(metrics.yield || 0)} format="currency" />
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm border border-blue-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Current Vault Value</p>
          <p className="text-3xl font-bold text-blue-600 mb-4">{formatCurrency(totalValue)} STX</p>
          <div className="text-sm space-y-1">
            <p className="text-gray-600">Net Position: <span className="font-semibold text-gray-900">{formatCurrency(totalValue - metrics.totalDeposited)} STX</span></p>
            <p className="text-gray-600">ROI: <span className={`font-semibold ${roiPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatPercentage(roiPercentage)}</span></p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-sm border border-purple-200">
          <p className="text-sm font-medium text-gray-600 mb-2">Lock Period Analytics</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Lock Days</p>
              <p className="text-2xl font-bold text-purple-600">{metrics.totalLockDays || 0}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Avg Lock Duration</p>
              <p className="text-lg font-semibold text-purple-700">{metrics.averageLockPeriod || 0} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.transactionCount || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Successful Rate</p>
            <p className="text-2xl font-bold text-green-600">{formatPercentage(metrics.successRate || 100)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Avg Transaction</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(metrics.averageTransactionSize || 0)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Penalty Incidents</p>
            <p className="text-2xl font-bold text-red-600">{metrics.penaltyCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-orange-50 p-6 rounded-lg shadow-sm border border-orange-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Risk Assessment</h3>
        <div className="space-y-2 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold">Penalty Ratio:</span> {metrics.totalDeposited > 0 ? formatPercentage((metrics.totalPenalties / metrics.totalDeposited) * 100) : '0%'}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Withdrawal Activity:</span> {metrics.totalDeposited > 0 ? formatPercentage((metrics.totalWithdrawn / metrics.totalDeposited) * 100) : '0%'}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Lock Compliance:</span> {metrics.penaltyCount === 0 ? 'Excellent' : metrics.penaltyCount <= 2 ? 'Good' : 'At Risk'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
