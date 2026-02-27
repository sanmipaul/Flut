export {
  useVaultHistory,
  createVaultCreatedEvent,
  createBeneficiarySetEvent,
  createBeneficiaryRemovedEvent,
  createWithdrawalEvent,
  createEmergencyWithdrawalEvent,
  MAX_HISTORY_EVENTS,
} from './useVaultHistory';
export type { UseVaultHistoryReturn } from './useVaultHistory';

export { useEstimatedTime, estimateTimeLabel } from './useEstimatedTime';
export type { UseEstimatedTimeOptions, EstimatedTimeResult } from './useEstimatedTime';
