'use client';

import type { Vault } from '@/types/vault';

interface VaultLockDurationBarProps {
  vaults: Vault[];
}

const BUCKETS = [
  { label: '< 1 week',   minBlocks: 0,     maxBlocks: 1_008 },
  { label: '1–4 weeks',  minBlocks: 1_008,  maxBlocks: 4_032 },
  { label: '1–3 months', minBlocks: 4_032,  maxBlocks: 13_104 },
  { label: '3–12 months', minBlocks: 13_104, maxBlocks: 52_416 },
  { label: '> 1 year',   minBlocks: 52_416, maxBlocks: Infinity },
];

export function VaultLockDurationBar({ vaults }: VaultLockDurationBarProps) {
  const withDuration = vaults.filter((v) => v.unlockHeight > v.createdAt);
  if (withDuration.length === 0) return null;

  const counts = BUCKETS.map(({ minBlocks, maxBlocks }) =>
    withDuration.filter((v) => {
      const dur = v.unlockHeight - v.createdAt;
      return dur >= minBlocks && dur < maxBlocks;
    }).length,
  );
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Lock Duration Distribution</p>
      <div className="space-y-2">
        {BUCKETS.map(({ label }, i) => {
          const count = counts[i];
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-gray-500 dark:text-gray-400 text-right">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 dark:bg-amber-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-4 text-xs text-gray-400 dark:text-zinc-500 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
