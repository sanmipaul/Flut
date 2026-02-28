import React, { useState, useMemo } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { TransactionTable } from './TransactionTable';
import { PerformanceMetrics } from './PerformanceMetrics';
import { FilterPanel } from './FilterPanel';
import { PeriodSelector } from './PeriodSelector';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { TransactionDetailModal } from './TransactionDetailModal';
import { useIsMobile } from '../context/ResponsiveContext';
import { VaultTransaction, TransactionType } from '../types/TransactionHistory';
import {
  generateTimeSeriesData,
  generateCumulativeVolumeData,
  generateTransactionTypeDistribution,
  generateActivityHeatmap,
  getTransactionTypeColor,
} from '../utils/ChartDataUtils';
import { exportTransactionsWithDownload, exportMetricsWithDownload } from '../utils/ExportUtils';

interface AnalyticsDashboardProps {
  vaultId: string;
  transactions: VaultTransaction[];
  transactionTypes: TransactionType[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  vaultId,
  transactions,
  transactionTypes,
}) => {
  const isMobile = useIsMobile();
  const { stats, performance, filteredTransactions, currentFilter, selectedPeriod, applyPeriodFilter, updateFilter, clearFilters } = useAnalytics(transactions);

  const [selectedTransaction, setSelectedTransaction] = useState<VaultTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'patterns'>('overview');

  // Generate chart data
  const timeSeriesData = useMemo(() => generateTimeSeriesData(filteredTransactions, 'daily'), [filteredTransactions]);
  const cumulativeData = useMemo(() => generateCumulativeVolumeData(filteredTransactions), [filteredTransactions]);
  const distributionData = useMemo(() => generateTransactionTypeDistribution(filteredTransactions), [filteredTransactions]);
  const heatmapData = useMemo(() => generateActivityHeatmap(filteredTransactions), [filteredTransactions]);

  const handleTransactionClick = (tx: VaultTransaction) => {
    setSelectedTransaction(tx);
    setShowDetailModal(true);
  };

  const handleExportCSV = () => {
    exportTransactionsWithDownload(filteredTransactions, vaultId, 'csv');
  };

  const handleExportJSON = () => {
    exportTransactionsWithDownload(filteredTransactions, vaultId, 'json');
  };

  const handleExportMetricsCSV = () => {
    exportMetricsWithDownload(vaultId, performance, 'csv');
  };

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4 p-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>

        <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={applyPeriodFilter} />

        {/* Tabs */}
        <div className="flex gap-2 bg-white rounded-lg p-2 border border-gray-200">
          {(['overview', 'transactions', 'patterns'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <PerformanceMetrics metrics={performance} />
            {timeSeriesData.length > 0 && (
              <LineChart data={timeSeriesData} title="Transaction Volume" yAxisLabel="STX" height={250} />
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Export JSON
              </button>
            </div>
            <TransactionTable transactions={filteredTransactions} onRowClick={handleTransactionClick} />
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {distributionData.length > 0 && (
              <PieChart data={distributionData} title="Transaction Types" height={250} />
            )}
            {heatmapData && heatmapData.length > 0 && (
              <ActivityHeatmap
                data={heatmapData}
                title="Activity by Day/Hour"
                rowLabels={Array.from({ length: 7 }, (_, i) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i])}
                colLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                colorScheme="blue"
              />
            )}
          </div>
        )}

        <TransactionDetailModal transaction={selectedTransaction} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Vault ID: {vaultId}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportMetricsCSV}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 text-sm"
          >
            Export Metrics
          </button>
          <button onClick={clearFilters} className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 text-sm">
            Reset Filters
          </button>
        </div>
      </div>

      {/* Controls */}
      <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={applyPeriodFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div>
          <FilterPanel onFilterChange={updateFilter} transactionTypes={transactionTypes} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Performance Metrics Cards */}
          <PerformanceMetrics metrics={performance} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {timeSeriesData.length > 0 && (
              <LineChart data={timeSeriesData} title="Transaction Volume Over Time" yAxisLabel="STX" height={300} />
            )}

            {cumulativeData.length > 0 && (
              <BarChart data={cumulativeData} title="Cumulative Volume by Month" yAxisLabel="Total STX" height={300} barColor="#10b981" />
            )}

            {distributionData.length > 0 && (
              <PieChart data={distributionData} title="Transaction Type Distribution" height={300} />
            )}

            {heatmapData && heatmapData.length > 0 && (
              <ActivityHeatmap
                data={heatmapData}
                title="Activity Heatmap (Day × Hour)"
                rowLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                colLabels={Array.from({ length: 24 }, (_, i) => (i % 6 === 0 ? `${i}:00` : ''))}
                colorScheme="blue"
              />
            )}
          </div>

          {/* Transaction Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                >
                  CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  JSON
                </button>
              </div>
            </div>
            <TransactionTable transactions={filteredTransactions} onRowClick={handleTransactionClick} />
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal transaction={selectedTransaction} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
    </div>
  );
};

export default AnalyticsDashboard;
