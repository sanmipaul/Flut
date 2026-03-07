import { Header } from '@/components/layout/Header';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950">
      <Header />

      <main className="flex flex-1 flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — vault list (populated in feat/vault-dashboard) */}
        <aside className="w-full lg:w-72 xl:w-80 shrink-0">
          <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-gray-900 dark:text-white">Your Vaults</h2>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Connect your wallet to view vaults.
            </p>
          </div>
        </aside>

        {/* Main content area */}
        <section className="flex-1 min-w-0">
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
        </section>
      </main>
    </div>
  );
}
