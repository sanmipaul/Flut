'use client';

import { useState } from 'react';
import type { Vault } from '@/types/vault';
import { getVaultStatus, blocksRemaining } from '@/types/vault';
import { microToStx } from '@/lib/stacks';

interface AnalyticsExportButtonProps {
  vaults: Vault[];
  currentBlock: number;
}

export function AnalyticsExportButton({ vaults, currentBlock }: AnalyticsExportButtonProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('csv');

  function buildRows() {
    return vaults.map((v) => ({
      vaultId:         v.vaultId,
      label:           v.label ?? '',
      amountStx:       microToStx(v.amount).toFixed(6),
      status:          getVaultStatus(v, currentBlock),
      unlockHeight:    v.unlockHeight,
      blocksRemaining: blocksRemaining(v, currentBlock),
      createdAt:       v.createdAt,
      stackingEnabled: v.stackingEnabled,
      stackingPool:    v.stackingPool ?? '',
      beneficiary:     v.beneficiaries[0] ?? '',
      creator:         v.creator,
    }));
  }

  function downloadCsv() {
    const rows = buildRows();
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]) as (keyof typeof rows[0])[];
    const lines = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => JSON.stringify(String(r[h]))).join(','),
      ),
    ];
    download('flut-vaults.csv', lines.join('\n'), 'text/csv');
  }

  function downloadJson() {
    download('flut-vaults.json', JSON.stringify(buildRows(), null, 2), 'application/json');
  }

  function download(filename: string, content: string, type: string) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={format}
        onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
        className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs px-2.5 py-1.5 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-400"
      >
        <option value="csv">CSV</option>
        <option value="json">JSON</option>
      </select>
      <button
        onClick={() => (format === 'csv' ? downloadCsv() : downloadJson())}
        disabled={vaults.length === 0}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-gray-700 dark:text-gray-300 px-3 py-1.5 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export
      </button>
    </div>
  );
}
