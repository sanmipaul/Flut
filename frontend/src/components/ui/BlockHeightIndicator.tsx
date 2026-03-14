'use client';

import { useBlockHeight } from '@/hooks/useBlockHeight';

/**
 * Shows the current Stacks block height with a live pulse dot.
 * Intended for placement in the sidebar footer or header.
 */
export function BlockHeightIndicator() {
  const { blockHeight, lastUpdated } = useBlockHeight();

  if (blockHeight === 0) return null;

  return (
    <div
      className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500"
      title={lastUpdated ? `Last updated ${lastUpdated.toLocaleTimeString()}` : undefined}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>Block {blockHeight.toLocaleString()}</span>
    </div>
  );
}
