'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { microToStx, truncateAddress, explorerUrl, formatBlockDuration } from '@/lib/stacks';
import { getVaultStatus, blocksRemaining, type Vault } from '@/types/vault';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useVaultLabel } from '@/hooks/useVaultLabel';

interface VaultDetailHeaderProps {
  vault: Vault;
  currentBlock: number;
}

const statusConfig = {
  locked:    { variant: 'locked'    as const, label: 'Locked'    },
  unlocked:  { variant: 'unlocked'  as const, label: 'Unlocked'  },
  withdrawn: { variant: 'default'   as const, label: 'Withdrawn' },
};

export function VaultDetailHeader({ vault, currentBlock }: VaultDetailHeaderProps) {
  const status = getVaultStatus(vault, currentBlock);
  const { variant, label } = statusConfig[status];
  const stx = microToStx(vault.amount).toFixed(6);
  const remaining = blocksRemaining(vault, currentBlock);
  const ageBlocks = Math.max(0, currentBlock - vault.createdAt);

  const [copiedCreator, copyCreator] = useCopyToClipboard();
  const [copiedId, copyId] = useCopyToClipboard();
  const [vaultLabel, setVaultLabel] = useVaultLabel(vault.vaultId);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState('');

  function startEdit() {
    setLabelDraft(vaultLabel || `Vault #${vault.vaultId}`);
    setEditingLabel(true);
  }

  function saveLabel() {
    setVaultLabel(labelDraft);
    setEditingLabel(false);
  }

  function cancelEdit() {
    setEditingLabel(false);
  }

  return (
    <div className="pb-5 border-b border-gray-100 dark:border-zinc-800 mb-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {editingLabel ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveLabel();
                  if (e.key === 'Escape') cancelEdit();
                }}
                className="text-lg font-bold bg-transparent border-b border-brand-400 focus:outline-none text-gray-900 dark:text-white w-full"
                maxLength={40}
              />
              <button onClick={saveLabel} className="text-xs text-brand-500 hover:text-brand-700 font-medium shrink-0">Save</button>
              <button onClick={cancelEdit} className="text-xs text-gray-400 hover:text-gray-600 shrink-0">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {vaultLabel || `Vault #${vault.vaultId}`}
              </h1>
              <button
                onClick={startEdit}
                title="Edit label"
                className="text-gray-300 dark:text-zinc-600 hover:text-brand-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              ID #{vault.vaultId}
            </p>
            <button
              onClick={() => copyId(String(vault.vaultId))}
              title="Copy vault ID"
              className="text-gray-300 dark:text-zinc-600 hover:text-brand-400 transition-colors"
            >
              {copiedId ? (
                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              Creator: {truncateAddress(vault.creator)}
            </span>
            <button
              onClick={() => copyCreator(vault.creator)}
              title="Copy creator address"
              className="text-gray-300 dark:text-zinc-600 hover:text-brand-400 transition-colors"
            >
              {copiedCreator ? (
                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            <a
              href={explorerUrl('address', vault.creator)}
              target="_blank"
              rel="noopener noreferrer"
              title="View on Stacks Explorer"
              className="text-gray-300 dark:text-zinc-600 hover:text-brand-400 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <Badge variant={variant}>{label}</Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono mt-0.5">{stx} STX</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Unlock Block</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white font-mono mt-0.5">{vault.unlockHeight.toLocaleString()}</p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Time Remaining</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
            {status === 'locked' ? formatBlockDuration(remaining) : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2.5">
          <p className="text-xs text-gray-500 dark:text-gray-400">Vault Age</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
            {ageBlocks > 0 ? formatBlockDuration(ageBlocks) : '&lt; 1 block'}
          </p>
        </div>
      </div>
    </div>
  );
}
