export interface WalletState {
  connected: boolean;
  address: string | null;
  stxBalance: number | null;
  /** loading state for balance fetch */
  loading: boolean;
}

export interface ConnectOptions {
  appName?: string;
  appIcon?: string;
}
