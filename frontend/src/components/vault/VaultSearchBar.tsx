'use client';

interface VaultSearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  resultCount?: number;
}

export function VaultSearchBar({ query, onQueryChange, resultCount }: VaultSearchBarProps) {
  return (
    <div role="search" aria-label="Vault search" className="relative mb-3">
      {query && resultCount !== undefined && (
        <span className="sr-only" aria-live="polite">
          {resultCount} vault{resultCount !== 1 ? 's' : ''} found
        </span>
      )}
      <svg
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
      </svg>
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search vaults…"
        aria-label="Search vaults"
        className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-8 pr-3 py-2 text-xs text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      {query && (
        <button
          onClick={() => onQueryChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <span aria-hidden="true">✕</span>
        </button>
      )}
    </div>
  );
}
