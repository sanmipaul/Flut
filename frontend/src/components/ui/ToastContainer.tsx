'use client';

import { useToast } from '@/context/ToastContext';
import { clsx } from 'clsx';

const variantStyles = {
  success: 'bg-green-500 dark:bg-green-600',
  error:   'bg-red-500 dark:bg-red-600',
  warning: 'bg-yellow-500 dark:bg-yellow-600',
  info:    'bg-brand-500',
};

const icons = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-start gap-3 rounded-xl px-4 py-3 text-white shadow-lg animate-slide-up',
            variantStyles[t.variant],
          )}
          role="alert"
        >
          <span className="text-lg font-bold leading-none mt-0.5">{icons[t.variant]}</span>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug">{t.title}</p>
            {t.description && (
              <p className="text-xs opacity-90 mt-0.5 leading-snug">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Dismiss notification"
            className="text-white/70 hover:text-white text-sm leading-none mt-0.5 shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
