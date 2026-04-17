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
import { ErrorBoundary } from './ErrorBoundary';
import { EmptyState } from './EmptyState';
import { EmptyChartPlaceholder } from './EmptyChartPlaceholder';
import { useIsMobile, useIsSmallMobile, useIsPortrait } from '../context/ResponsiveContext';
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
  const isSmallMobile = useIsSmallMobile();
  const isPortrait = useIsPortrait();
  const { stats, performance, filteredTransactions, currentFilter, selectedPeriod, applyPeriodFilter, updateFilter, clearFilters } = useAnalytics(transactions);

  const [selectedTransaction, setSelectedTransaction] = useState<VaultTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'patterns'>('overview');

  const hasTransactions = transactions.length > 0;
  const hasFilteredTransactions = filteredTransactions.length > 0;

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
    if (performance) {
      exportMetricsWithDownload(vaultId, performance, 'csv');
    }
  };


  if (!hasTransactions) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Once you create a vault and make deposits, your analytics will appear here."
      />
    );
  }

  // Mobile layout with optimizations
  if (isMobile) {
    return (
      <ErrorBoundary maxRetries={3}>
        <div className="space-y-4 p-4 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        </div>

        <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={(period) => applyPeriodFilter(period)} />

        {/* Tabs with mobile optimizations */}
        <div className="flex gap-2 bg-white rounded-lg p-2 border border-gray-200">
          {(['overview', 'transactions', 'patterns'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition ${
                activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{
                minHeight: isSmallMobile ? 48 : 44,
                minWidth: isSmallMobile ? 48 : 44,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {performance && <PerformanceMetrics metrics={performance} />}
            {timeSeriesData.length > 0 && (
              <LineChart 
                data={timeSeriesData} 
                title="Transaction Volume" 
                yAxisLabel="STX" 
                height={isSmallMobile ? 200 : 250} 
              />
            )}
          </div>
        )}

        {/* Transactions Tab with virtualization */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                style={{
                  minHeight: isSmallMobile ? 48 : 44,
                }}
              >
                Export CSV
              </button>
              <button
                onClick={handleExportJSON}
                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                style={{
                  minHeight: isSmallMobile ? 48 : 44,
                }}
              >
                Export JSON
              </button>
            </div>
            <div style={{ maxHeight: isSmallMobile ? '40vh' : '50vh', overflow: 'auto' }}>
              <TransactionTable 
                transactions={filteredTransactions} 
                onRowClick={handleTransactionClick} 
              />
            </div>
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <div className="space-y-4">
            {distributionData.length > 0 && (
              <PieChart 
                data={distributionData} 
                title="Transaction Types" 
                height={isSmallMobile ? 200 : 250} 
              />
            )}
            {heatmapData && heatmapData.length > 0 && (
              <div style={{ maxHeight: isSmallMobile ? '300px' : '400px', overflow: 'auto' }}>
                <ActivityHeatmap
                  data={heatmapData}
                  title="Activity by Day/Hour"
                  rowLabels={Array.from({ length: 7 }, (_, i) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i])}
                  colLabels={Array.from({ length: 24 }, (_, i) => `${i}:00`)}
                  colorScheme="blue"
                />
              </div>
            )}
          </div>
        )}

        <TransactionDetailModal transaction={selectedTransaction} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
      </div>
      </ErrorBoundary>
    );
  }

  // Desktop layout
  return (
    <ErrorBoundary maxRetries={3}>
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
            style={{
              minHeight: isSmallMobile ? 48 : 44,
              minWidth: isSmallMobile ? 48 : 44,
            }}
          >
            Export Metrics
          </button>
          <button 
            onClick={clearFilters} 
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg font-medium hover:bg-gray-400 text-sm"
            style={{
              minHeight: isSmallMobile ? 48 : 44,
              minWidth: isSmallMobile ? 48 : 44,
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Controls */}
      <PeriodSelector selectedPeriod={selectedPeriod} onPeriodChange={(period) => applyPeriodFilter(period)} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Filters */}
        <div>
          <FilterPanel onFilterChange={updateFilter} transactionTypes={transactionTypes} />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Performance Metrics Cards */}
          {performance && <PerformanceMetrics metrics={performance} />}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {timeSeriesData.length > 0 && (
              <LineChart 
                data={timeSeriesData} 
                title="Transaction Volume Over Time" 
                yAxisLabel="STX" 
                height={isSmallMobile ? 250 : 300} 
              />
            )}

            {cumulativeData.length > 0 && (
              <BarChart 
                data={cumulativeData} 
                title="Cumulative Volume by Month" 
                yAxisLabel="Total STX" 
                height={isSmallMobile ? 250 : 300} 
                barColor="#10b981" 
              />
            )}

            {distributionData.length > 0 && (
              <PieChart 
                data={distributionData} 
                title="Transaction Type Distribution" 
                height={isSmallMobile ? 250 : 300} 
              />
            )}

            {heatmapData && heatmapData.length > 0 && (
              <div style={{ maxHeight: isSmallMobile ? '350px' : '450px', overflow: 'auto' }}>
                <ActivityHeatmap
                  data={heatmapData}
                  title="Activity Heatmap (Day × Hour)"
                  rowLabels={['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']}
                  colLabels={Array.from({ length: 24 }, (_, i) => (i % 6 === 0 ? `${i}:00` : ''))}
                  colorScheme="blue"
                />
              </div>
            )}
          </div>

          {/* Transaction Table with mobile optimizations */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
              <div className="flex gap-2">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                  style={{
                    minHeight: isSmallMobile ? 36 : 32,
                    minWidth: isSmallMobile ? 36 : 32,
                  }}
                >
                  CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                  style={{
                    minHeight: isSmallMobile ? 36 : 32,
                    minWidth: isSmallMobile ? 36 : 32,
                  }}
                >
                  JSON
                </button>
              </div>
            </div>
            <div style={{ maxHeight: isSmallMobile ? '400px' : '500px', overflow: 'auto' }}>
              <TransactionTable 
                transactions={filteredTransactions} 
                onRowClick={handleTransactionClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <TransactionDetailModal transaction={selectedTransaction} isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} />
    </div>
    </ErrorBoundary>
  );
};

export default AnalyticsDashboard;
