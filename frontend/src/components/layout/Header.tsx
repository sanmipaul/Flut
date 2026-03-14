import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold">F</span>
          <span className="hidden sm:inline">Flut</span>
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

        {/* Right side — wallet button added in feat/wallet-connect */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* WalletConnect placeholder */}
          <div id="wallet-connect-slot" />
        </div>
      </div>
    </header>
  );
}
