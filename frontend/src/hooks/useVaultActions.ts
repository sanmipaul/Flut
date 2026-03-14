'use client';

import { useCallback, useRef, useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  withdrawArgs,
  depositArgs,
  emergencyWithdrawArgs,
  setBeneficiaryArgs,
} from '@/lib/contract';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK_NAME } from '@/lib/stacks';
import { useToast } from '@/context/ToastContext';

export interface UseVaultActionsResult {
  withdraw:          (vaultId: number) => Promise<void>;
  deposit:           (vaultId: number, amountMicroStx: number) => Promise<void>;
  emergencyWithdraw: (vaultId: number) => Promise<void>;
  setBeneficiary:    (vaultId: number, address: string) => Promise<void>;
  lastTxid:          string | null;
  clearTxid:         () => void;
}

const APP_DETAILS = { name: 'Flut', icon: '/logo.png' };

/**
 * Provides contract-call actions for vault operations.
 * Each action opens the wallet for signing, shows toasts on start/finish/error,
 * and captures the resulting txid for display.
 */
export function useVaultActions(onSuccess?: () => void): UseVaultActionsResult {
  const { toast } = useToast();
  const [lastTxid, setLastTxid] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const clearTxid = useCallback(() => setLastTxid(null), []);

  const callContract = useCallback(
    (
      functionName: string,
      functionArgs: ReturnType<typeof withdrawArgs>,
      messages: { pending: string; success: string; error: string },
    ): Promise<void> => {
      if (pendingRef.current) {
        toast.warning('A transaction is already pending — please wait');
        return Promise.resolve();
      }
      pendingRef.current = true;
      return new Promise((resolve, reject) => {
        toast.info(messages.pending, { duration: 10_000 });

        openContractCall({
          network: NETWORK_NAME,
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName,
          functionArgs,
          appDetails: APP_DETAILS,
          onFinish: (data) => {
            pendingRef.current = false;
            if (data.txId) setLastTxid(data.txId);
            toast.success(messages.success, {
              description: 'Transaction submitted — changes appear after 1–2 blocks.',
            });
            onSuccess?.();
            resolve();
          },
          onCancel: () => {
            pendingRef.current = false;
            toast.warning('Transaction cancelled');
            resolve();
          },
        }).catch((err: unknown) => {
          pendingRef.current = false;
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

  return { withdraw, deposit, emergencyWithdraw, setBeneficiary, lastTxid, clearTxid };
}
