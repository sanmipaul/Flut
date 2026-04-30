import { useWallet } from '@/context/WalletContext';

/**
 * Returns a concise status string for the current wallet state.
 * Useful for analytics, logging, and conditional rendering.
 */
export function useWalletStatus(): 'disconnected' | 'connecting' | 'connected' | 'expired' {
  const { connected, loading, sessionExpired } = useWallet();

  if (sessionExpired) return 'expired';
  if (loading && !connected) return 'connecting';
  if (connected) return 'connected';
  return 'disconnected';
}
