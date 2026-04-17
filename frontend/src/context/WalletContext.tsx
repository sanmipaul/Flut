'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { NETWORK, STACKS_API, truncateAddress } from '@/lib/stacks';
import type { WalletState } from '@/types/wallet';

interface WalletContextValue extends WalletState {
  connect: () => void;
  disconnect: () => void;
  refreshBalance: () => void;
  truncatedAddress: string | null;
  isReconnecting: boolean;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

interface BalanceResult {
  balance: number;
  error: boolean;
}

const BALANCE_FETCH_TIMEOUT_MS = 10_000;
const BALANCE_POLL_MS = 30_000;
const SESSION_CHECK_MS = 60_000;

function isSessionValid(): boolean {
  try {
    return userSession.isUserSignedIn();
  } catch {
    return false;
  }
}

async function fetchStxBalance(address: string): Promise<BalanceResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BALANCE_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${STACKS_API}/v2/accounts/${address}?proof=0`, {
      signal: controller.signal,
    });
    if (!res.ok) {
      console.error(`[WalletContext] Balance fetch failed: HTTP ${res.status}`);
      return { balance: 0, error: true };
    }
    const data = await res.json();
    return { balance: Number(data.balance ?? 0), error: false };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.error('[WalletContext] Balance fetch timed out after 10s');
    } else {
      console.error('[WalletContext] Balance fetch error:', err);
    }
    return { balance: 0, error: true };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    stxBalance: null,
    loading: false,
    balanceFetchError: false,
    sessionExpired: false,
  });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const mountedRef = useRef(true);
  const sessionCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function stopSessionCheck() {
    if (sessionCheckRef.current) {
      clearInterval(sessionCheckRef.current);
      sessionCheckRef.current = null;
    }
  }

  function handleSessionExpiry() {
    console.warn('[WalletContext] Session expired — disconnecting');
    stopPolling();
    stopSessionCheck();
    userSession.signUserOut();
    setState({ connected: false, address: null, stxBalance: null, loading: false, balanceFetchError: false, sessionExpired: true });
  }

  function startPolling(address: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchStxBalance(address).then(({ balance, error }) =>
        setState((s) => ({ ...s, stxBalance: balance, balanceFetchError: error })),
      );
    }, BALANCE_POLL_MS);
  }

  function startSessionCheck() {
    if (sessionCheckRef.current) clearInterval(sessionCheckRef.current);
    sessionCheckRef.current = setInterval(() => {
      if (!isSessionValid()) {
        handleSessionExpiry();
      }
    }, SESSION_CHECK_MS);
  }

  // Rehydrate session on mount
  useEffect(() => {
    if (isSessionValid()) {
      const userData = userSession.loadUserData();
      const address =
        NETWORK.constructor.name === 'StacksMainnet'
          ? userData.profile.stxAddress.mainnet
          : userData.profile.stxAddress.testnet;
      setState((s) => ({ ...s, connected: true, address, loading: true }));
      fetchStxBalance(address).then(({ balance, error }) => {
        setState((s) => ({ ...s, stxBalance: balance, loading: false, balanceFetchError: error }));
        startPolling(address);
        startSessionCheck();
      });
    }
    return () => {
      stopPolling();
      stopSessionCheck();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setState((s) => ({ ...s, connected: true, address, loading: true, sessionExpired: false }));
        fetchStxBalance(address).then(({ balance, error }) => {
          setState((s) => ({ ...s, stxBalance: balance, loading: false, balanceFetchError: error }));
          startPolling(address);
          startSessionCheck();
        });
      },
      onCancel: () => {},
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disconnect = useCallback(() => {
    stopPolling();
    stopSessionCheck();
    userSession.signUserOut();
    setState({ connected: false, address: null, stxBalance: null, loading: false, balanceFetchError: false, sessionExpired: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshBalance = useCallback(() => {
    if (!state.address || !state.connected) return;
    setState((s) => ({ ...s, loading: true }));
    fetchStxBalance(state.address).then(({ balance, error }) =>
      setState((s) => ({ ...s, stxBalance: balance, loading: false, balanceFetchError: error })),
    );
  }, [state.address]);

  const truncatedAddress = state.address ? truncateAddress(state.address) : null;

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, refreshBalance, truncatedAddress, isReconnecting }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
