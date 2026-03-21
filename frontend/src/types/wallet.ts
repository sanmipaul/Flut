export interface WalletState {
  connected: boolean;
  address: string | null;
  stxBalance: number | null;
  /** loading state for balance fetch */
  loading: boolean;
  /** true when the last balance fetch failed (distinct from a genuine 0 balance) */
  balanceFetchError: boolean;
}

export interface ConnectOptions {
  appName?: string;
  appIcon?: string;
}
