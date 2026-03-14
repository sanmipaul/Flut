'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { truncateAddress } from '@/lib/stacks';

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
        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all">
          {truncateAddress(currentBeneficiary, 8)}
        </p>
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
            <p className="text-xs text-red-500">Invalid Stacks address</p>
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
