'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { NETWORK, STACKS_API, truncateAddress } from '@/lib/stacks';
import type { WalletState } from '@/types/wallet';

interface WalletContextValue extends WalletState {
  connect: () => void;
  disconnect: () => void;
  truncatedAddress: string | null;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

async function fetchStxBalance(address: string): Promise<number> {
  try {
    const res = await fetch(`${STACKS_API}/v2/accounts/${address}?proof=0`);
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.balance ?? 0);
  } catch {
    return 0;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    stxBalance: null,
    loading: false,
  });

  // Rehydrate session on mount
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const address =
        NETWORK.constructor.name === 'StacksMainnet'
          ? userData.profile.stxAddress.mainnet
          : userData.profile.stxAddress.testnet;
      setState((s) => ({ ...s, connected: true, address, loading: true }));
      fetchStxBalance(address).then((stxBalance) =>
        setState((s) => ({ ...s, stxBalance, loading: false })),
      );
    }
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: { name: 'Flut', icon: '/logo.png' },
      network: NETWORK,
      userSession,
      onFinish: () => {
        const userData = userSession.loadUserData();
        const address =
          NETWORK.constructor.name === 'StacksMainnet'
            ? userData.profile.stxAddress.mainnet
            : userData.profile.stxAddress.testnet;
        setState((s) => ({ ...s, connected: true, address, loading: true }));
        fetchStxBalance(address).then((stxBalance) =>
          setState((s) => ({ ...s, stxBalance, loading: false })),
        );
      },
      onCancel: () => {},
    });
  }, []);

  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setState({ connected: false, address: null, stxBalance: null, loading: false });
  }, []);

  const truncatedAddress = state.address ? truncateAddress(state.address) : null;

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, truncatedAddress }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
