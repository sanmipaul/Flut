/** Steps in the multi-step vault creation flow */
export type CreateVaultStep = 'amount' | 'duration' | 'stacking' | 'label' | 'review';

export const CREATE_VAULT_STEPS: CreateVaultStep[] = ['amount', 'duration', 'stacking', 'label', 'review'];

export const STEP_LABELS: Record<CreateVaultStep, string> = {
  amount:   'Amount',
  duration: 'Duration',
  stacking: 'Stacking',
  label:    'Name',
  review:   'Review',
};

/** Preset lock durations — blocks at ~10 min/block */
export const DURATION_PRESETS: { label: string; blocks: number }[] = [
  { label: '1 week',   blocks: 1_008   },
  { label: '1 month',  blocks: 4_320   },
  { label: '3 months', blocks: 12_960  },
  { label: '6 months', blocks: 25_920  },
  { label: '1 year',   blocks: 52_560  },
];

export const MIN_LOCK_BLOCKS = 144;   // ~1 day
export const MAX_LOCK_BLOCKS = 262_800; // ~5 years
export const MIN_AMOUNT_STX  = 1;     // 1 STX minimum
export const MAX_AMOUNT_STX  = 1_000; // contract limit per tx

/** Mutable form state passed between steps */
export interface CreateVaultFormState {
  amountStx: string;
  lockBlocks: number | null;
  customBlocks: string;
  enableStacking: boolean;
  stackingPool: string;
  vaultLabel?: string;
}

export const INITIAL_FORM_STATE: CreateVaultFormState = {
  amountStx:      '',
  lockBlocks:     null,
  customBlocks:   '',
  enableStacking: false,
  stackingPool:   '',
  vaultLabel:     '',
};
