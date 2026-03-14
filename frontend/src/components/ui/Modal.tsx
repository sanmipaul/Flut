'use client';

import { useEffect, useRef } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      if (!el.open) el.showModal();
    } else {
      if (el.open) el.close();
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  // Close on backdrop click
  function handleClick(e: React.MouseEvent<HTMLDialogElement>) {
    const rect = dialogRef.current?.getBoundingClientRect();
    if (rect && (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom)) {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onClose={onClose}
      className={clsx(
        'rounded-2xl bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100',
        'shadow-2xl border border-gray-200 dark:border-zinc-700 p-0 w-full backdrop:bg-black/50 backdrop:backdrop-blur-sm',
        sizeClasses[size],
      )}
    >
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors ml-4 mt-0.5"
        >
          ✕
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
