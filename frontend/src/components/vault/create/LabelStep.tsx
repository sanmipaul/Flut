'use client';

import type { CreateVaultFormState } from '@/types/createVault';

interface Props {
  form: CreateVaultFormState;
  onChange: (patch: Partial<CreateVaultFormState>) => void;
}

export function LabelStep({ form, onChange }: Props) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Give your vault a name so you can identify it easily. This is stored locally and not on-chain.
      </p>

      <div>
        <label htmlFor="cv-label" className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
          Vault Name <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="cv-label"
          type="text"
          value={form.vaultLabel ?? ''}
          onChange={(e) => onChange({ vaultLabel: e.target.value })}
          placeholder='e.g. "House Fund", "Emergency STX"'
          maxLength={40}
          autoFocus
          className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
        />
        <div className="flex justify-between mt-1.5">
          <p className="text-xs text-gray-400">Stored in your browser only</p>
          <p className="text-xs text-gray-400">{(form.vaultLabel ?? '').length}/40</p>
        </div>
      </div>

      <div className="rounded-xl bg-gray-50 dark:bg-zinc-800 px-4 py-3 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-medium text-gray-700 dark:text-gray-300">Skip to use the default name</p>
        <p>You can always rename your vault later from the vault detail view.</p>
      </div>
    </div>
  );
}
