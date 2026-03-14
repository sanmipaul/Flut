'use client';

interface VaultStatusDistributionBarProps {
  locked: number;
  unlocked: number;
  withdrawn: number;
}

export function VaultStatusDistributionBar({ locked, unlocked, withdrawn }: VaultStatusDistributionBarProps) {
  const total = locked + unlocked + withdrawn;
  if (total === 0) return null;

  const pct = (n: number) => Math.round((n / total) * 100);
  const lockedPct   = pct(locked);
  const unlockedPct = pct(unlocked);
  const withdrawnPct = 100 - lockedPct - unlockedPct;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-5 py-4">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">Vault Status Distribution</p>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {lockedPct > 0 && (
          <div
            className="bg-amber-400 dark:bg-amber-500 transition-all"
            style={{ width: `${lockedPct}%` }}
            title={`Locked: ${locked}`}
          />
        )}
        {unlockedPct > 0 && (
          <div
            className="bg-green-400 dark:bg-green-500 transition-all"
            style={{ width: `${unlockedPct}%` }}
            title={`Unlocked: ${unlocked}`}
          />
        )}
        {withdrawnPct > 0 && (
          <div
            className="bg-gray-300 dark:bg-zinc-600 transition-all"
            style={{ width: `${withdrawnPct}%` }}
            title={`Withdrawn: ${withdrawn}`}
          />
        )}
      </div>
      <div className="flex gap-4 mt-2.5 flex-wrap">
        <LegendItem color="bg-amber-400 dark:bg-amber-500"  label="Locked"    count={locked}    pct={lockedPct} />
        <LegendItem color="bg-green-400 dark:bg-green-500"  label="Unlocked"  count={unlocked}  pct={unlockedPct} />
        <LegendItem color="bg-gray-300 dark:bg-zinc-600"    label="Withdrawn" count={withdrawn} pct={100 - lockedPct - unlockedPct} />
      </div>
    </div>
  );
}

function LegendItem({ color, label, count, pct }: { color: string; label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      <span>{label}: {count} <span className="text-gray-400 dark:text-zinc-500">({pct}%)</span></span>
    </div>
  );
}
