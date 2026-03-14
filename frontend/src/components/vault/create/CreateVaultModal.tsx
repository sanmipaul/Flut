'use client';

import { useCallback, useEffect, useState } from 'react';
import { openContractCall } from '@stacks/connect';
import {
  uintCV,
  boolCV,
  someCV,
  noneCV,
  principalCV,
} from '@stacks/transactions';

import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { CreateVaultStepIndicator } from './CreateVaultStepIndicator';
import { AmountStep } from './AmountStep';
import { DurationStep } from './DurationStep';
import { StackingStep } from './StackingStep';
import { ReviewStep } from './ReviewStep';
import { LabelStep } from './LabelStep';
import { CreateVaultPending } from './CreateVaultPending';
import { CreateVaultSuccess } from './CreateVaultSuccess';
import { CreateVaultError } from './CreateVaultError';

import { useCreateVaultForm } from '@/hooks/useCreateVaultForm';
import { useBlockHeight } from '@/hooks/useBlockHeight';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK_NAME } from '@/lib/stacks';
import { CREATE_VAULT_STEPS } from '@/types/createVault';
import { useVaultLabel } from '@/hooks/useVaultLabel';

type ModalPhase = 'form' | 'pending' | 'success' | 'error';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function CreateVaultModal({ open, onClose, onCreated }: Props) {
  const form = useCreateVaultForm();
  const { blockHeight } = useBlockHeight();
  const [phase, setPhase]     = useState<ModalPhase>('form');
  const [txid, setTxid]         = useState<string | null>(null);
  const [vaultId, setVaultId]   = useState<number | null>(null);
  const [errMsg, setErrMsg]     = useState('');
  const [, setLabel]            = useVaultLabel(vaultId ?? -1);

  // Keyboard: Enter to advance, Escape to go back/close
  useEffect(() => {
    if (!open || phase !== 'form') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        if (form.canProceed) {
          form.step === 'review' ? handleSubmit() : form.nextStep();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, phase, form.canProceed, form.step]);

  function handleClose() {
    if (phase === 'pending') return; // block close while signing
    form.resetForm();
    setPhase('form');
    setTxid(null);
    setVaultId(null);
    onClose();
  }

  const handleSubmit = useCallback(async () => {
    setPhase('pending');
    setErrMsg('');

    const amountMicro = Math.round(parseFloat(form.form.amountStx) * 1_000_000);
    const poolArg = form.form.enableStacking && form.form.stackingPool
      ? someCV(principalCV(form.form.stackingPool.trim()))
      : noneCV();

    try {
      await openContractCall({
        network: NETWORK_NAME,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-vault',
        functionArgs: [
          uintCV(form.resolvedBlocks),
          uintCV(amountMicro),
          boolCV(form.form.enableStacking),
          poolArg,
        ],
        appDetails: { name: 'Flut', icon: '/logo.png' },
        onFinish: (data) => {
          setTxid(data.txId ?? null);
          setPhase('success');
          // Persist label if provided — vault ID comes from txResult eventually,
          // for now use the label saving hook after vault list refresh
          if (form.form.vaultLabel?.trim()) {
            // label saved after vault appears — saved in onCreated callback via refresh
          }
          onCreated?.();
        },
        onCancel: () => {
          setPhase('form');
        },
      });
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : 'Transaction failed');
      setPhase('error');
    }
  }, [form, onCreated]);

  const modalTitle = phase === 'success' ? 'Vault Created'
    : phase === 'error'   ? 'Error'
    : phase === 'pending' ? 'Awaiting Signature'
    : 'Create Vault';

  return (
    <Modal open={open} onClose={handleClose} title={modalTitle} size="md">
      {phase === 'pending' && <CreateVaultPending />}

      {phase === 'success' && (
        <CreateVaultSuccess vaultId={vaultId} txid={txid} onDone={handleClose} />
      )}

      {phase === 'error' && (
        <CreateVaultError
          message={errMsg}
          onRetry={() => setPhase('form')}
          onClose={handleClose}
        />
      )}

      {phase === 'form' && (
        <div>
          <CreateVaultStepIndicator
            currentStep={form.step}
            steps={CREATE_VAULT_STEPS}
            completedUpTo={form.stepIndex}
          />

          {/* Step content */}
          <div className="min-h-[220px]">
            {form.step === 'amount'   && <AmountStep   form={form.form} onChange={form.updateForm} />}
            {form.step === 'duration' && <DurationStep form={form.form} onChange={form.updateForm} currentBlock={blockHeight} />}
            {form.step === 'stacking' && <StackingStep form={form.form} onChange={form.updateForm} />}
            {form.step === 'label'    && <LabelStep    form={form.form} onChange={form.updateForm} />}
            {form.step === 'review'   && (
              <ReviewStep
                form={form.form}
                resolvedBlocks={form.resolvedBlocks}
                currentBlock={blockHeight}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={form.stepIndex === 0 ? handleClose : form.prevStep}
            >
              {form.stepIndex === 0 ? 'Cancel' : '← Back'}
            </Button>

            {form.step !== 'review' ? (
              <Button
                className="flex-1"
                disabled={!form.canProceed}
                onClick={form.nextStep}
              >
                Next →
              </Button>
            ) : (
              <Button
                className="flex-1"
                disabled={!form.canProceed}
                onClick={handleSubmit}
              >
                Create Vault
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
