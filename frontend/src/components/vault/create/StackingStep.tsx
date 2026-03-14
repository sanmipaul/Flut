'use client';

import { clsx } from 'clsx';
import type { CreateVaultFormState } from '@/types/createVault';

interface Props {
  form: CreateVaultFormState;
  onChange: (patch: Partial<CreateVaultFormState>) => void;
}

const SP_REGEX = /^S[PT][A-Z0-9]{39}$/;

export function StackingStep({ form, onChange }: Props) {
  const poolValid = SP_REGEX.test(form.stackingPool.trim());
  const showPoolError = form.enableStacking && form.stackingPool.length > 0 && !poolValid;

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Optionally delegate your locked STX to a stacking pool to earn Bitcoin rewards.
      </p>

      {/* Toggle */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-zinc-700 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">Enable Stacking</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Earn BTC rewards while your STX is locked</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.enableStacking}
          onClick={() => onChange({ enableStacking: !form.enableStacking })}
          className={clsx(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            form.enableStacking ? 'bg-brand-500' : 'bg-gray-200 dark:bg-zinc-700',
          )}
        >
          <span
            className={clsx(
              'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
              form.enableStacking ? 'translate-x-6' : 'translate-x-1',
            )}
          />
        </button>
      </div>

      {/* Pool input — shown when stacking enabled */}
      {form.enableStacking && (
        <div>
          <label htmlFor="cv-pool" className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
            Pool Address <span className="text-red-500">*</span>
          </label>
          <input
            id="cv-pool"
            type="text"
            value={form.stackingPool}
            onChange={(e) => onChange({ stackingPool: e.target.value })}
            placeholder="SP… or ST…"
            autoFocus
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {showPoolError && (
            <p className="mt-1.5 text-xs text-red-500">Invalid Stacks address (must start with SP or ST, 41 chars)</p>
          )}
          {!showPoolError && form.enableStacking && poolValid && (
            <p className="mt-1.5 text-xs text-green-600 dark:text-green-400">✓ Valid pool address</p>
          )}
          <p className="mt-1.5 text-xs text-gray-400">
            Enter the Stacks principal address of your preferred stacking pool.
          </p>
        </div>
      )}

      {/* Info box */}
      <div className={clsx(
        'rounded-xl px-4 py-3 text-xs space-y-1 border',
        form.enableStacking
          ? 'bg-brand-50 dark:bg-brand-900/10 border-brand-100 dark:border-brand-800 text-brand-700 dark:text-brand-300'
          : 'bg-gray-50 dark:bg-zinc-800 border-gray-100 dark:border-zinc-700 text-gray-500 dark:text-gray-400',
      )}>
        {form.enableStacking ? (
          <>
            <p className="font-semibold">⚡ Stacking will be enabled</p>
            <p>Your STX will be delegated to the pool. Rewards are distributed by the pool operator.</p>
          </>
        ) : (
          <>
            <p className="font-semibold">Stacking is optional</p>
            <p>Skip this step to create a simple savings vault without stacking.</p>
          </>
        )}
      </div>
    </div>
  );
}
