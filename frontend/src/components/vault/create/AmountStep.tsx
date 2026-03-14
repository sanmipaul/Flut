'use client';

import { useWallet } from '@/hooks/useWallet';
import { microToStx } from '@/lib/stacks';
import { MIN_AMOUNT_STX, MAX_AMOUNT_STX } from '@/types/createVault';
import type { CreateVaultFormState } from '@/types/createVault';

interface Props {
  form: CreateVaultFormState;
  onChange: (patch: Partial<CreateVaultFormState>) => void;
}

export function AmountStep({ form, onChange }: Props) {
  const { stxBalance } = useWallet();
  const walletStx = stxBalance != null ? microToStx(stxBalance) : null;
  const parsed = parseFloat(form.amountStx);

  const validationMsg = (() => {
    if (!form.amountStx) return null;
    if (isNaN(parsed) || parsed <= 0) return 'Enter a positive amount';
    if (parsed < MIN_AMOUNT_STX) return `Minimum is ${MIN_AMOUNT_STX} STX`;
    if (parsed > MAX_AMOUNT_STX) return `Maximum is ${MAX_AMOUNT_STX} STX`;
    if (walletStx != null && parsed > walletStx) return `Insufficient balance (${walletStx.toFixed(2)} STX)`;
    return null;
  })();

  function handleMax() {
    if (walletStx == null) return;
    onChange({ amountStx: Math.min(walletStx, MAX_AMOUNT_STX).toFixed(6) });
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          How much STX do you want to lock in this vault?
        </p>

        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="cv-amount" className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Amount (STX)
          </label>
          {walletStx != null && (
            <span className="text-xs text-gray-400">
              Available: {walletStx.toFixed(2)} STX
            </span>
          )}
        </div>

        <div className="relative">
          <input
            id="cv-amount"
            type="number"
            min={MIN_AMOUNT_STX}
            max={MAX_AMOUNT_STX}
            step="0.000001"
            value={form.amountStx}
            onChange={(e) => onChange({ amountStx: e.target.value })}
            placeholder={`${MIN_AMOUNT_STX}.00`}
            autoFocus
            className="w-full rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2.5 pr-14 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {walletStx != null && (
            <button
              type="button"
              onClick={handleMax}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-500 hover:text-brand-700"
            >
              MAX
            </button>
          )}
        </div>

        {validationMsg ? (
          <p className="mt-1.5 text-xs text-red-500">{validationMsg}</p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-400">
            Min {MIN_AMOUNT_STX} STX · Max {MAX_AMOUNT_STX} STX per creation
          </p>
        )}
      </div>

      {/* Info box */}
      <div className="rounded-xl bg-brand-50 dark:bg-brand-900/10 border border-brand-100 dark:border-brand-800 px-4 py-3 text-xs text-brand-700 dark:text-brand-300 space-y-1">
        <p className="font-semibold">You can always add more later</p>
        <p>Additional deposits can be made at any time before the vault unlocks.</p>
      </div>
    </div>
  );
}
