'use client';

import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/Button';
import { WalletDropdown } from './WalletDropdown';

export function WalletConnect() {
  const { connected, connect, loading } = useWallet();

  if (connected) return <WalletDropdown />;

  return (
    <Button
      onClick={connect}
      loading={loading}
      size="sm"
      aria-label="Connect Stacks wallet"
    >
      Connect Wallet
    </Button>
  );
}
