import { useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';

/**
 * Calls onExpired when the wallet session expires.
 * Useful for pages that need to redirect or show a modal on expiry.
 */
export function useSessionExpired(onExpired: () => void) {
  const { sessionExpired } = useWallet();

  useEffect(() => {
    if (sessionExpired) {
      onExpired();
    }
  }, [sessionExpired, onExpired]);

  return sessionExpired;
}
