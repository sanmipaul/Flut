'use client';

import { useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  withdrawArgs,
  depositArgs,
  emergencyWithdrawArgs,
  setBeneficiaryArgs,
} from '@/lib/contract';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK_NAME } from '@/lib/stacks';
import { useToast } from '@/context/ToastContext';

interface UseVaultActionsResult {
  withdraw:          (vaultId: number) => Promise<void>;
  deposit:           (vaultId: number, amountMicroStx: number) => Promise<void>;
  emergencyWithdraw: (vaultId: number) => Promise<void>;
  setBeneficiary:    (vaultId: number, address: string) => Promise<void>;
}

const APP_DETAILS = { name: 'Flut', icon: '/logo.png' };

/**
 * Provides contract-call actions for vault operations.
 * Each action opens the wallet for signing, shows toasts on start/finish/error,
 * and resolves the returned Promise once the wallet flow completes.
 */
export function useVaultActions(onSuccess?: () => void): UseVaultActionsResult {
  const { toast } = useToast();

  const callContract = useCallback(
    (
      functionName: string,
      functionArgs: ReturnType<typeof withdrawArgs>,
      messages: { pending: string; success: string; error: string },
    ): Promise<void> => {
      return new Promise((resolve, reject) => {
        toast.info(messages.pending, { duration: 10_000 });

        openContractCall({
          network: NETWORK_NAME,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName,
          functionArgs,
          appDetails: APP_DETAILS,
          onFinish: () => {
            toast.success(messages.success, {
              description: 'Transaction submitted — changes appear after 1–2 blocks.',
            });
            onSuccess?.();
            resolve();
          },
          onCancel: () => {
            toast.warning('Transaction cancelled');
            resolve(); // not an error — user cancelled
          },
        }).catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Unexpected error';
          toast.error(messages.error, { description: msg });
          reject(err);
        });
      });
    },
    [toast, onSuccess],
  );

  const withdraw = useCallback(
    (vaultId: number) =>
      callContract('withdraw', withdrawArgs(vaultId), {
        pending: 'Awaiting withdrawal signature…',
        success: 'Withdrawal submitted',
        error:   'Withdrawal failed',
      }),
    [callContract],
  );

  const deposit = useCallback(
    (vaultId: number, amountMicroStx: number) =>
      callContract('deposit', depositArgs(vaultId, amountMicroStx), {
        pending: 'Awaiting deposit signature…',
        success: 'Deposit submitted',
        error:   'Deposit failed',
      }),
    [callContract],
  );

  const emergencyWithdraw = useCallback(
    (vaultId: number) =>
      callContract('emergency-withdraw', emergencyWithdrawArgs(vaultId), {
        pending: 'Awaiting emergency withdrawal signature…',
        success: 'Emergency withdrawal submitted',
        error:   'Emergency withdrawal failed',
      }),
    [callContract],
  );

  const setBeneficiary = useCallback(
    (vaultId: number, address: string) =>
      callContract('set-beneficiary', setBeneficiaryArgs(vaultId, address), {
        pending: 'Awaiting beneficiary update signature…',
        success: 'Beneficiary updated',
        error:   'Failed to update beneficiary',
      }),
    [callContract],
  );

  return { withdraw, deposit, emergencyWithdraw, setBeneficiary };
}
