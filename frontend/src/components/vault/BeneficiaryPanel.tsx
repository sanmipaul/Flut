'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { truncateAddress, explorerUrl } from '@/lib/stacks';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

interface BeneficiaryPanelProps {
  vaultId: number;
  currentBeneficiary?: string;
  onSetBeneficiary: (vaultId: number, address: string) => Promise<void>;
}

const SP_REGEX = /^S[PT][A-Z0-9]{39}$/;

export function BeneficiaryPanel({ vaultId, currentBeneficiary, onSetBeneficiary }: BeneficiaryPanelProps) {
  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [copied, copy]        = useCopyToClipboard();

  const isValid = SP_REGEX.test(address.trim());

  async function handleSave() {
    if (!isValid) return;
    setLoading(true);
    setError(null);
    try {
      await onSetBeneficiary(vaultId, address.trim());
      setEditing(false);
      setAddress('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg && !msg.toLowerCase().includes('cancel')) {
        setError(msg || 'Failed to set beneficiary');
      } else {
        setEditing(false);
        setAddress('');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-100 dark:border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Beneficiary</h3>
        {!editing && (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            {currentBeneficiary ? 'Change' : 'Set'}
          </Button>
        )}
      </div>

      {currentBeneficiary && !editing && (
        <div className="flex items-center gap-2">
          <p
            className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all"
            title={currentBeneficiary}
          >
            {truncateAddress(currentBeneficiary, 8)}
          </p>
          <button
            onClick={() => copy(currentBeneficiary)}
            title="Copy address"
            className="shrink-0 text-gray-300 dark:text-zinc-600 hover:text-brand-400 transition-colors"
          >
            {copied ? (
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
            href={explorerUrl('address', currentBeneficiary)}
            target="_blank"
            rel="noopener noreferrer"
            title="View on Stacks Explorer"
            className="shrink-0 text-gray-300 dark:text-zinc-600 hover:text-brand-400 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}

      {!currentBeneficiary && !editing && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          No beneficiary set. Funds will return to you on withdrawal.
        </p>
      )}

      {editing && (
        <div className="space-y-2.5">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="SP… or ST…"
            aria-label="Beneficiary Stacks address"
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {address && !isValid && (
            <p className="text-xs text-red-500">Invalid Stacks address (must start with SP or ST, 41 chars)</p>
          )}
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setEditing(false); setAddress(''); }}>
              Cancel
            </Button>
            <Button size="sm" className="flex-1" disabled={!isValid} loading={loading} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
