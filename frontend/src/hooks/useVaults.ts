'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchVaultsForUser, fetchBlockHeight } from '@/lib/contract';
import { useWallet } from '@/hooks/useWallet';
import type { Vault } from '@/types/vault';

interface UseVaultsResult {
  vaults: Vault[];
  currentBlock: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useVaults(): UseVaultsResult {
  const { address, connected } = useWallet();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [currentBlock, setCurrentBlock] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    setError(null);
    try {
      const [userVaults, block] = await Promise.all([
        fetchVaultsForUser(address),
        fetchBlockHeight(),
      ]);
      setVaults(userVaults);
      setCurrentBlock(block);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load vaults');
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (connected && address) {
      refresh();
    } else {
      setVaults([]);
      setCurrentBlock(0);
    }
  }, [connected, address, refresh]);

  return { vaults, currentBlock, loading, error, refresh };
}
