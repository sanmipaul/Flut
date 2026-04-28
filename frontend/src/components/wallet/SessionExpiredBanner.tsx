'use client';

import { useWallet } from '@/context/WalletContext';

export function SessionExpiredBanner() {
  const { sessionExpired, connect } = useWallet();

  if (!sessionExpired) return null;

  return (
    <div
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-yellow-50 border-b border-yellow-300 px-4 py-3 text-sm text-yellow-800"
    >
      <span>Your session has expired. Please reconnect your wallet to continue.</span>
      <button
        onClick={connect}
        className="ml-4 rounded bg-yellow-400 px-3 py-1 font-medium text-yellow-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600"
      >
        Reconnect
      </button>
    </div>
  );
}
