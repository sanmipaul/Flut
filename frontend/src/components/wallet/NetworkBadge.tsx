import { NETWORK_NAME } from '@/lib/stacks';
import { clsx } from 'clsx';

export function NetworkBadge({ className }: { className?: string }) {
  const isMainnet = NETWORK_NAME === 'mainnet';
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isMainnet
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
        className,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full', isMainnet ? 'bg-green-500' : 'bg-yellow-500')} />
      {isMainnet ? 'Mainnet' : 'Testnet'}
    </span>
  );
}
