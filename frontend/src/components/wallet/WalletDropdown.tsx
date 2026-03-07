'use client';

import { useEffect, useRef, useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { AddressDisplay } from './AddressDisplay';
import { NetworkBadge } from './NetworkBadge';
import { microToStx } from '@/lib/stacks';

export function WalletDropdown() {
  const { address, truncatedAddress, stxBalance, loading, disconnect } = useWallet();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!address) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="h-2 w-2 rounded-full bg-green-400 shrink-0" />
        {truncatedAddress}
        <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl z-50 p-3 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Connected Wallet</span>
            <NetworkBadge />
          </div>

          {address && (
            <AddressDisplay address={address} truncated={truncatedAddress ?? undefined} className="w-full justify-between mb-3" />
          )}

          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-3 py-2 mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">STX Balance</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-0.5">
              {loading ? '…' : stxBalance !== null ? `${microToStx(stxBalance).toFixed(2)} STX` : '—'}
            </p>
          </div>

          <button
            onClick={() => { disconnect(); setOpen(false); }}
            className="w-full rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-3 py-2 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
