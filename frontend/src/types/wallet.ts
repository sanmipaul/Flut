export interface WalletState {
  connected: boolean;
  address: string | null;
  stxBalance: number | null;
  /** loading state for balance fetch */
  loading: boolean;
  /** true when the last balance fetch failed (distinct from a genuine 0 balance) */
  balanceFetchError: boolean;
  /** true when the session expired and the user was auto-disconnected */
  sessionExpired: boolean;
  /** Unix timestamp (ms) of last successful connect */
  lastConnectedAt: number | null;
}

export interface ConnectOptions {
  appName?: string;
  appIcon?: string;
}
