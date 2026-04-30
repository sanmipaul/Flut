import { useState, useCallback } from 'react';

export interface UseVaultDepositOptions {
  onSuccess?: (vaultId: number, amount: number) => void;
  onError?: (error: Error) => void;
}

export interface UseVaultDepositResult {
  loading: boolean;
  error: string;
  deposit: (vaultId: number, amount: number, perform: (id: number, amt: number) => Promise<void>) => Promise<void>;
  clearError: () => void;
}

export function useVaultDeposit(options: UseVaultDepositOptions = {}): UseVaultDepositResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deposit = useCallback(
    async (
      vaultId: number,
      amount: number,
      perform: (id: number, amt: number) => Promise<void>
    ) => {
      setError('');
      setLoading(true);
      try {
        await perform(vaultId, amount);
        options.onSuccess?.(vaultId, amount);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Deposit failed';
        setError(msg);
        options.onError?.(err instanceof Error ? err : new Error(msg));
      } finally {
        setLoading(false);
      }
    },
    [options]
  );

  const clearError = useCallback(() => setError(''), []);

  return { loading, error, deposit, clearError };
}

export default useVaultDeposit;
