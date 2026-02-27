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
const RESET_DELAY_MS = 2000;
