import { VaultTransaction, VaultPerformanceMetrics } from '../types/TransactionHistory';

/**
 * Export transaction data to CSV format
 */
export const exportTransactionsToCSV = (transactions: VaultTransaction[], vaultId: string): string => {
  if (transactions.length === 0) {
    return 'Vault ID,Transaction ID,Type,Amount,Date,Status,Description\n';
  }

  const headers = ['Vault ID', 'Transaction ID', 'Type', 'Amount (STX)', 'Date', 'Status', 'Description'];
  const rows = transactions.map((tx) => [
    vaultId,
    tx.id,
    tx.type,
    tx.amount.toFixed(2),
    new Date(tx.timestamp).toISOString().split('T')[0],
    tx.status,
    `"${tx.description}"`, // Quote to handle commas in descriptions
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
};

/**
 * Export performance metrics to CSV format
 */
export const exportMetricsToCSV = (vaultId: string, metrics: VaultPerformanceMetrics): string => {
  const data = [
    ['Vault ID', vaultId],
    ['Total Deposited (STX)', metrics.totalDeposited.toFixed(2)],
    ['Total Withdrawn (STX)', metrics.totalWithdrawn.toFixed(2)],
    ['Total Penalties (STX)', metrics.totalPenalties.toFixed(2)],
    ['Yield Earned (STX)', (metrics.yield || 0).toFixed(2)],
    ['Transaction Count', metrics.transactionCount || 0],
    ['Success Rate (%)', ((metrics.successRate || 100) * 100).toFixed(2)],
    ['Average Transaction (STX)', (metrics.averageTransactionSize || 0).toFixed(2)],
    ['Penalty Count', metrics.penaltyCount || 0],
    ['Total Lock Days', metrics.totalLockDays || 0],
    ['Average Lock Period (days)', metrics.averageLockPeriod || 0],
  ];

  return data.map((row) => row.join(',')).join('\n');
};

/**
 * Export to JSON format (provides more structure than CSV)
 */
export const exportTransactionsToJSON = (
  transactions: VaultTransaction[],
  vaultId: string,
  metrics?: VaultPerformanceMetrics
): string => {
  const exportData = {
    exportDate: new Date().toISOString(),
    vaultId,
    summary: metrics
      ? {
          totalDeposited: metrics.totalDeposited,
          totalWithdrawn: metrics.totalWithdrawn,
          totalPenalties: metrics.totalPenalties,
          yieldEarned: metrics.yield || 0,
          transactionCount: metrics.transactionCount || 0,
          successRate: metrics.successRate || 1,
          averageTransaction: metrics.averageTransactionSize || 0,
          penaltyCount: metrics.penaltyCount || 0,
        }
      : undefined,
    transactions: transactions.map((tx) => ({
      id: tx.id,
      vaultId: tx.vaultId,
      type: tx.type,
      amount: tx.amount,
      timestamp: new Date(tx.timestamp).toISOString(),
      blockHeight: tx.blockHeight,
      txId: tx.txId,
      status: tx.status,
      description: tx.description,
      initiatedBy: tx.initiatedBy,
      gasUsed: tx.gasUsed,
      fee: tx.fee,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

/**
 * Trigger browser download for exported data
 */
export const downloadExport = (data: string, filename: string, mimeType: string = 'text/plain'): void => {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export transactions with filename based on vault and date
 */
export const exportTransactionsWithDownload = (
  transactions: VaultTransaction[],
  vaultId: string,
  format: 'csv' | 'json' = 'csv'
): void => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `vault-${vaultId}-transactions-${timestamp}.${format}`;

  let data: string;
  let mimeType: string;

  if (format === 'csv') {
    data = exportTransactionsToCSV(transactions, vaultId);
    mimeType = 'text/csv';
  } else {
    data = exportTransactionsToJSON(transactions, vaultId);
    mimeType = 'application/json';
  }

  downloadExport(data, filename, mimeType);
};

/**
 * Export metrics with filename based on vault and date
 */
export const exportMetricsWithDownload = (
  vaultId: string,
  metrics: VaultPerformanceMetrics,
  format: 'csv' | 'json' = 'csv'
): void => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `vault-${vaultId}-metrics-${timestamp}.${format}`;

  let data: string;
  let mimeType: string;

  if (format === 'csv') {
    data = exportMetricsToCSV(vaultId, metrics);
    mimeType = 'text/csv';
  } else {
    data = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        vaultId,
        metrics: {
          totalDeposited: metrics.totalDeposited,
          totalWithdrawn: metrics.totalWithdrawn,
          totalPenalties: metrics.totalPenalties,
          yieldEarned: metrics.yield || 0,
          transactionCount: metrics.transactionCount || 0,
          successRate: metrics.successRate || 1,
          averageTransaction: metrics.averageTransactionSize || 0,
          penaltyCount: metrics.penaltyCount || 0,
          totalLockDays: metrics.totalLockDays || 0,
          averageLockPeriod: metrics.averageLockPeriod || 0,
        },
      },
      null,
      2
    );
    mimeType = 'application/json';
  }

  downloadExport(data, filename, mimeType);
};
