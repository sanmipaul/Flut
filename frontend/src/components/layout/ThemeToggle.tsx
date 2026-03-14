'use client';

import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { resolved, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={resolved === 'dark'}
      title={`Current: ${resolved} mode`}
      className="rounded-lg p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
    >
      {resolved === 'dark' ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 110 10A5 5 0 0112 7z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
