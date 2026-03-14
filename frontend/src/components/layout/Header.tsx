import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { NETWORK_NAME } from '@/lib/stacks';

export function Header() {
  const isTestnet = NETWORK_NAME === 'testnet';

  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold">F</span>
          <span className="hidden sm:inline">Flut</span>
          {isTestnet && (
            <span className="hidden sm:inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-2 py-0.5 border border-amber-200 dark:border-amber-700">
              Testnet
            </span>
          )}
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/analytics" className="hover:text-gray-900 dark:hover:text-white transition-colors">
            Analytics
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
