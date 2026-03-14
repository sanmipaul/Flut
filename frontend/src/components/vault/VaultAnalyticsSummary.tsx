'use client';

import { microToStx } from '@/lib/stacks';
import { getVaultStatus, type Vault } from '@/types/vault';

interface Props {
  vaults: Vault[];
  currentBlock: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5 text-center">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <span className="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

export function VaultAnalyticsSummary({ vaults, currentBlock }: Props) {
  if (vaults.length === 0) return null;

  const totalStx = microToStx(vaults.reduce((s, v) => s + v.amount, 0));
  const locked    = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'locked').length;
  const unlocked  = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'unlocked').length;
  const withdrawn = vaults.filter((v) => getVaultStatus(v, currentBlock) === 'withdrawn').length;

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      <Stat label="Total Locked" value={`${totalStx.toFixed(2)} STX`} />
      <Stat label="Vaults" value={vaults.length} />
      <Stat label="Locked" value={locked} />
      <Stat label="Unlocked" value={unlocked + withdrawn} />
    </div>
  );
}
