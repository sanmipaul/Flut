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

interface BalanceResult {
  balance: number;
  error: boolean;
}

async function fetchStxBalance(address: string): Promise<BalanceResult> {
  try {
    const res = await fetch(`${STACKS_API}/v2/accounts/${address}?proof=0`);
    if (!res.ok) {
      console.error(`[WalletContext] Balance fetch failed: HTTP ${res.status}`);
      return { balance: 0, error: true };
    }
    const data = await res.json();
    return { balance: Number(data.balance ?? 0), error: false };
  } catch (err) {
    console.error('[WalletContext] Balance fetch error:', err);
    return { balance: 0, error: true };
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    stxBalance: null,
    loading: false,
    balanceFetchError: false,
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
      fetchStxBalance(address).then(({ balance, error }) =>
        setState((s) => ({ ...s, stxBalance: balance, loading: false, balanceFetchError: error })),
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
        fetchStxBalance(address).then(({ balance, error }) =>
          setState((s) => ({ ...s, stxBalance: balance, loading: false, balanceFetchError: error })),
        );
      },
      onCancel: () => {},
    });
  }, []);

  const disconnect = useCallback(() => {
    userSession.signUserOut();
    setState({ connected: false, address: null, stxBalance: null, loading: false, balanceFetchError: false });
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
