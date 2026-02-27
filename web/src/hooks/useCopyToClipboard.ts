import { useState, useCallback, useRef } from 'react';

/** The three possible states of a copy operation */
export type CopyState = 'idle' | 'copied' | 'error';

export interface UseCopyToClipboardReturn {
  /** Current copy state */
  copyState: CopyState;
  /** Call with the text to copy; resolves once the state has been set */
  copy: (text: string) => Promise<void>;
  /** Manually reset state back to idle */
  reset: () => void;
}

/** Milliseconds the "copied" or "error" state persists before reverting to idle */
export const RESET_DELAY_MS = 2000;

/**
 * Writes `text` to the clipboard using the modern async Clipboard API.
 * Returns true on success, false when the API is unavailable or denied.
 */
async function writeToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard?.writeText) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Legacy fallback using document.execCommand('copy').
 * Works in older browsers and non-secure contexts where the async API fails.
 */
function execCommandCopy(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}

export interface UseCopyToClipboardOptions {
  /** Override the auto-reset delay in ms (default: RESET_DELAY_MS = 2000) */
  resetDelay?: number;
}

/**
 * useCopyToClipboard
 *
 * Returns a `copy` function and a `copyState` indicator.
 * Tries the modern Clipboard API first, falls back to execCommand.
 * The state automatically resets to 'idle' after `resetDelay` ms.
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {}
): UseCopyToClipboardReturn {
  const { resetDelay = RESET_DELAY_MS } = options;
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setCopyState('idle');
  }, []);

  const copy = useCallback(
    async (text: string) => {
      // Cancel any pending auto-reset
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);

      const ok = (await writeToClipboard(text)) || execCommandCopy(text);
      setCopyState(ok ? 'copied' : 'error');

      resetTimerRef.current = setTimeout(() => {
        setCopyState('idle');
      }, resetDelay);
    },
    [resetDelay]
  );

  return { copyState, copy, reset };
}
