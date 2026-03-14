'use client';

import { clsx } from 'clsx';
import {
  DURATION_PRESETS,
  MIN_LOCK_BLOCKS,
  MAX_LOCK_BLOCKS,
  type CreateVaultFormState,
} from '@/types/createVault';
import { formatBlockDuration } from '@/lib/stacks';

interface Props {
  form: CreateVaultFormState;
  onChange: (patch: Partial<CreateVaultFormState>) => void;
  currentBlock: number;
}

export function DurationStep({ form, onChange, currentBlock }: Props) {
  const resolvedBlocks = form.lockBlocks ?? parseInt(form.customBlocks, 10);
  const validBlocks = !isNaN(resolvedBlocks) && resolvedBlocks >= MIN_LOCK_BLOCKS && resolvedBlocks <= MAX_LOCK_BLOCKS;

  const unlockBlock = currentBlock + (validBlocks ? resolvedBlocks : 0);
  const unlockDate = validBlocks
    ? new Date(Date.now() + resolvedBlocks * 10 * 60 * 1000)
    : null;

  function selectPreset(blocks: number) {
    onChange({ lockBlocks: blocks, customBlocks: '' });
  }

  function handleCustomChange(val: string) {
    onChange({ lockBlocks: null, customBlocks: val });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Choose how long your STX will be locked.
      </p>

      {/* Preset buttons */}
      <div>
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick presets</p>
        <div className="grid grid-cols-3 gap-2">
          {DURATION_PRESETS.map((p) => (
            <button
              key={p.blocks}
              type="button"
              onClick={() => selectPreset(p.blocks)}
              className={clsx(
                'rounded-xl border px-3 py-2 text-xs font-medium transition-all',
                form.lockBlocks === p.blocks
                  ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:border-brand-300',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom block input */}
      <div>
        <label htmlFor="cv-custom-blocks" className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
          Or enter custom block count
        </label>
        <div className="relative">
          <input
            id="cv-custom-blocks"
            type="number"
            min={MIN_LOCK_BLOCKS}
            max={MAX_LOCK_BLOCKS}
            step={1}
            value={form.lockBlocks !== null ? '' : form.customBlocks}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder={`Min ${MIN_LOCK_BLOCKS} · Max ${MAX_LOCK_BLOCKS.toLocaleString()}`}
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">1 block ≈ 10 minutes (anchored to Bitcoin)</p>
      </div>

      {/* Preview */}
      {validBlocks && (
        <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 divide-y divide-gray-100 dark:divide-zinc-700 text-xs">
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400">Duration</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {resolvedBlocks.toLocaleString()} blocks · {formatBlockDuration(resolvedBlocks)}
            </span>
          </div>
          <div className="flex justify-between px-4 py-2.5">
            <span className="text-gray-500 dark:text-gray-400">Unlock block</span>
            <span className="font-mono text-gray-900 dark:text-white">{unlockBlock.toLocaleString()}</span>
          </div>
          {unlockDate && (
            <div className="flex justify-between px-4 py-2.5">
              <span className="text-gray-500 dark:text-gray-400">Estimated unlock</span>
              <span className="text-gray-900 dark:text-white">
                {unlockDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
