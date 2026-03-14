'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Vault } from '@/types/vault';
import { getVaultStatus, blocksRemaining } from '@/types/vault';
import { microToStx, formatBlockDuration, truncateAddress } from '@/lib/stacks';
import { Badge } from '@/components/ui/Badge';

type SortKey = 'id' | 'amount' | 'unlock' | 'status';
type SortDir = 'asc' | 'desc';

interface VaultBreakdownTableProps {
  vaults: Vault[];
  currentBlock: number;
}

const STATUS_ORDER: Record<string, number> = { locked: 0, unlocked: 1, withdrawn: 2 };

export function VaultBreakdownTable({ vaults, currentBlock }: VaultBreakdownTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('id');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = [...vaults].sort((a, b) => {
    let diff = 0;
    if (sortKey === 'id')     diff = a.vaultId - b.vaultId;
    if (sortKey === 'amount') diff = a.amount - b.amount;
    if (sortKey === 'unlock') diff = a.unlockHeight - b.unlockHeight;
    if (sortKey === 'status') {
      const sa = getVaultStatus(a, currentBlock);
      const sb = getVaultStatus(b, currentBlock);
      diff = STATUS_ORDER[sa] - STATUS_ORDER[sb];
    }
    return sortDir === 'asc' ? diff : -diff;
  });

  if (vaults.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-zinc-800">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Vault Breakdown</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 dark:bg-zinc-800/50">
            <tr>
              <Th label="Vault" sortKey="id"     current={sortKey} dir={sortDir} onSort={toggleSort} />
              <Th label="Amount" sortKey="amount" current={sortKey} dir={sortDir} onSort={toggleSort} />
              <Th label="Unlock" sortKey="unlock" current={sortKey} dir={sortDir} onSort={toggleSort} />
              <Th label="Status" sortKey="status" current={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-4 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium">Beneficiary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-zinc-800">
            {sorted.map((vault) => {
              const status = getVaultStatus(vault, currentBlock);
              const remaining = blocksRemaining(vault, currentBlock);
              return (
                <tr key={vault.vaultId} className="hover:bg-gray-50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">
                    <Link href={`/vault/${vault.vaultId}`} className="hover:text-brand-500 transition-colors">
                      #{vault.vaultId}
                    </Link>
                    {vault.label && (
                      <span className="ml-1.5 text-gray-400 dark:text-zinc-500 truncate max-w-[80px] inline-block align-middle">
                        {vault.label}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-900 dark:text-gray-100">
                    {microToStx(vault.amount).toFixed(2)} STX
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400">
                    {status === 'withdrawn' ? '—' : remaining === 0 ? 'Now' : formatBlockDuration(remaining)}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={status === 'locked' ? 'warning' : status === 'unlocked' ? 'success' : 'default'}>
                      {status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-gray-400 dark:text-zinc-500">
                    {vault.beneficiaries[0] ? truncateAddress(vault.beneficiaries[0], 6) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  label, sortKey, current, dir, onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = current === sortKey;
  return (
    <th
      className="px-4 py-2.5 text-left text-gray-500 dark:text-gray-400 font-medium cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className="ml-1 text-gray-300 dark:text-zinc-600">
        {active ? (dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  );
}
