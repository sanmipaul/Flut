'use client';

import { clsx } from 'clsx';
import { STEP_LABELS, type CreateVaultStep } from '@/types/createVault';

interface Props {
  currentStep: CreateVaultStep;
  steps: CreateVaultStep[];
  completedUpTo: number;
}

export function CreateVaultStepIndicator({ currentStep, steps, completedUpTo }: Props) {
  return (
    <nav aria-label="Creation steps" className="flex items-center gap-0 mb-6">
      {steps.map((step, i) => {
        const isCurrent   = step === currentStep;
        const isCompleted = i < completedUpTo;

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={clsx(
                  'h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all',
                  isCurrent
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : isCompleted
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-400',
                )}
              >
                {isCompleted && !isCurrent ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={clsx(
                  'text-xs font-medium',
                  isCurrent ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400 dark:text-gray-500',
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className={clsx(
                  'flex-1 h-0.5 mx-2 mt-[-14px]',
                  isCompleted ? 'bg-brand-500' : 'bg-gray-200 dark:bg-zinc-700',
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
