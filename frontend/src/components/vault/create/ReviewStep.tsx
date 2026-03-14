'use client';

import { formatBlockDuration, truncateAddress } from '@/lib/stacks';
import type { CreateVaultFormState } from '@/types/createVault';

interface Props {
  form: CreateVaultFormState;
  resolvedBlocks: number;
  currentBlock: number;
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center px-4 py-2.5 text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={`font-medium text-gray-900 dark:text-white ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

export function ReviewStep({ form, resolvedBlocks, currentBlock }: Props) {
  const unlockBlock = currentBlock + resolvedBlocks;
  const unlockDate  = new Date(Date.now() + resolvedBlocks * 10 * 60 * 1000);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Review your vault settings before confirming. Your wallet will prompt you to sign the transaction.
      </p>

      {/* Summary table */}
      <div className="rounded-xl border border-gray-100 dark:border-zinc-800 divide-y divide-gray-100 dark:divide-zinc-800 overflow-hidden">
        <Row label="Initial deposit" value={`${parseFloat(form.amountStx).toFixed(6)} STX`} mono />
        <Row label="Lock duration"   value={`${resolvedBlocks.toLocaleString()} blocks · ${formatBlockDuration(resolvedBlocks)}`} />
        <Row label="Unlock block"    value={unlockBlock.toLocaleString()} mono />
        <Row
          label="Estimated unlock"
          value={unlockDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        />
        <Row label="Stacking"        value={form.enableStacking ? '⚡ Enabled' : 'Off'} />
        {form.enableStacking && form.stackingPool && (
          <Row label="Pool address" value={truncateAddress(form.stackingPool, 8)} mono />
        )}
        <Row
          label="Vault name"
          value={form.vaultLabel?.trim() || '(default)'}
        />
      </div>

      {/* Warnings */}
      <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Before you confirm</p>
        <ul className="text-xs text-amber-600 dark:text-amber-500 list-disc list-inside space-y-0.5">
          <li>Funds are locked until block {unlockBlock.toLocaleString()}</li>
          <li>Early withdrawal incurs a 10% penalty</li>
          <li>Transaction fees apply (paid in STX)</li>
        </ul>
      </div>
    </div>
  );
}
