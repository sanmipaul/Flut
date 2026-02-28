/**
 * useVaultAnalytics
 *
 * Memoised wrapper around computeVaultAnalytics. Re-computes only when the
 * vault list reference changes, keeping the component tree efficient.
 */
import { useMemo } from 'react';
import { computeVaultAnalytics } from '../utils/computeVaultAnalytics';
import type { AnalyticsVaultInput, VaultAnalytics } from '../types/VaultAnalytics';

export function useVaultAnalytics(vaults: AnalyticsVaultInput[]): VaultAnalytics {
  return useMemo(() => computeVaultAnalytics(vaults), [vaults]);
}
