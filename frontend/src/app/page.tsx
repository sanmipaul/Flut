'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { VaultDetailPanel } from '@/components/vault/VaultDetailPanel';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useVaults } from '@/hooks/useVaults';

export default function Home() {
  const [selectedVaultId, setSelectedVaultId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const { vaults, currentBlock, refresh } = useVaults();

  const selectedVault = selectedVaultId !== null
    ? vaults.find((v) => v.vaultId === selectedVaultId) ?? null
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />

      <main className="flex flex-1 flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full p-4">
            <ErrorBoundary>
              <Sidebar
                selectedVaultId={selectedVaultId}
                onSelect={setSelectedVaultId}
                onCreateClick={() => setShowCreate(true)}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Main content */}
        <section className="flex-1 min-w-0">
          <ErrorBoundary>
            {selectedVault ? (
              <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <VaultDetailPanel
                  vault={selectedVault}
                  currentBlock={currentBlock}
                  onWithdraw={async () => { await refresh(); }}
                  onDeposit={async () => { await refresh(); }}
                  onEmergencyWithdraw={async () => { await refresh(); }}
                  onSetBeneficiary={async () => { await refresh(); }}
                />
              </div>
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800">
                <div className="text-center space-y-2 p-8">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-900/20">
                    <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">No vault selected</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    Select a vault from the sidebar or create a new one to get started.
                  </p>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </section>
      </main>

      {/* showCreate modal placeholder — wired to state */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center"
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Create Vault</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Vault creation flow coming soon.</p>
            <button
              onClick={() => setShowCreate(false)}
              className="w-full rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium py-2 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
