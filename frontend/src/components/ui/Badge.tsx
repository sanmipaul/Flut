import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'locked' | 'unlocked';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-gray-200',
  success:  'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
  warning:  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
  danger:   'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
  info:     'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
  locked:   'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300',
  unlocked: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
