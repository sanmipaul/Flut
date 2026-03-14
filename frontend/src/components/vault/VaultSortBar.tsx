'use client';

import type { SortField } from '@/hooks/useVaultSort';

interface VaultSortBarProps {
  sortField: SortField;
  options: { value: SortField; label: string }[];
  onChange: (field: SortField) => void;
}

export function VaultSortBar({ sortField, options, onChange }: VaultSortBarProps) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">Sort:</span>
      <select
        value={sortField}
        onChange={(e) => onChange(e.target.value as SortField)}
        className="flex-1 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400"
        aria-label="Sort vaults by"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
