export {
  useVaultHistory,
  createVaultCreatedEvent,
  createBeneficiarySetEvent,
  createBeneficiaryRemovedEvent,
  createWithdrawalEvent,
  createEmergencyWithdrawalEvent,
} from './useVaultHistory';
export type { UseVaultHistoryReturn } from './useVaultHistory';

export { useEstimatedTime, estimateTimeLabel } from './useEstimatedTime';
export type { UseEstimatedTimeOptions, EstimatedTimeResult } from './useEstimatedTime';
