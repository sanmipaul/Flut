export { useLockProgress, blocksToTimeString } from './useLockProgress';
export type { UseLockProgressInput } from './useLockProgress';

// Re-export LockProgressState for consumers who import from hooks
export type { LockProgressState, VaultLockStatus } from '../types/LockProgress';
