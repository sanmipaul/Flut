'use client';

import type { Vault } from '@/types/vault';
import { microToStx } from '@/lib/stacks';

interface VaultAmountRangeBarProps {
  vaults: Vault[];
}

const BUCKETS = [
  { label: '0–1 STX',    min: 0,    max: 1 },
  { label: '1–10 STX',   min: 1,    max: 10 },
  { label: '10–100 STX', min: 10,   max: 100 },
  { label: '100+ STX',   min: 100,  max: Infinity },
];

export function VaultAmountRangeBar({ vaults }: VaultAmountRangeBarProps) {
  const active = vaults.filter((v) => !v.isWithdrawn);
  if (active.length === 0) return null;

  const counts = BUCKETS.map(({ min, max }) =>
    active.filter((v) => {
      const stx = microToStx(v.amount);
      return stx >= min && stx < max;
    }).length,
  );
  const maxCount = Math.max(...counts, 1);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Amount Distribution</p>
      <div className="space-y-2">
        {BUCKETS.map(({ label }, i) => {
          const count = counts[i];
          const pct = Math.round((count / maxCount) * 100);
          return (
            <div key={label} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-gray-500 dark:text-gray-400 text-right">{label}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-400 dark:bg-brand-500 transition-all"
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
