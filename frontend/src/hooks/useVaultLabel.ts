'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'flut:vault-labels';

function readLabels(): Record<number, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<number, string>) : {};
  } catch {
    return {};
  }
}

/**
 * Per-vault label stored in localStorage.
 * Returns [label, setLabel] for a specific vaultId.
 */
export function useVaultLabel(vaultId: number): [string, (label: string) => void] {
  const [label, setLabelState] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return readLabels()[vaultId] ?? '';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setLabelState(readLabels()[vaultId] ?? '');
  }, [vaultId]);

  const setLabel = useCallback(
    (newLabel: string) => {
      const labels = readLabels();
      if (newLabel.trim()) {
        labels[vaultId] = newLabel.trim();
      } else {
        delete labels[vaultId];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
      setLabelState(newLabel.trim());
    },
    [vaultId],
  );

  return [label, setLabel];
}
