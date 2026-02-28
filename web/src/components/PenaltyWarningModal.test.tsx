/**
 * Tests for PenaltyWarningModal component.
 * Verifies that STX amounts are displayed using the StxAmount component.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PenaltyWarningModal from './PenaltyWarningModal';

const defaultProps = {
  isOpen: true,
  vaultId: 1,
  vaultAmount: 1000,
  penaltyRate: 10,
  penaltyAmount: 100,
  userReceiveAmount: 900,
  onConfirm: vi.fn().mockResolvedValue(undefined),
  onCancel: vi.fn(),
};

describe('PenaltyWarningModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(<PenaltyWarningModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(<PenaltyWarningModal {...defaultProps} />);
    expect(screen.getByText('Emergency Withdrawal Penalty')).toBeDefined();
  });

  it('displays vaultAmount using StxAmount component', () => {
    render(<PenaltyWarningModal {...defaultProps} />);
    const el = document.querySelector('[data-amount="1000"]');
    expect(el).not.toBeNull();
  });

  it('displays penaltyAmount with negative highlight', () => {
    render(<PenaltyWarningModal {...defaultProps} />);
    const el = document.querySelector('[data-amount="100"].stx-amount--negative');
    expect(el).not.toBeNull();
  });

  it('displays userReceiveAmount with positive highlight', () => {
    render(<PenaltyWarningModal {...defaultProps} />);
    const el = document.querySelector('[data-amount="900"].stx-amount--positive');
    expect(el).not.toBeNull();
  });

  it('shows the penalty rate percentage', () => {
    render(<PenaltyWarningModal {...defaultProps} penaltyRate={15} />);
    expect(screen.getByText('15%')).toBeDefined();
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<PenaltyWarningModal {...defaultProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('shows error when confirming without checkbox', () => {
    render(<PenaltyWarningModal {...defaultProps} />);
    fireEvent.click(screen.getByText('Emergency Withdraw'));
    expect(screen.getByText(/confirm/i)).toBeDefined();
  });

  it('enables confirm button after checking the checkbox', () => {
    render(<PenaltyWarningModal {...defaultProps} />);
    const checkbox = document.getElementById('penalty-confirm') as HTMLInputElement;
    fireEvent.click(checkbox);
    const btn = screen.getByText('Emergency Withdraw') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('calls onConfirm with vaultId after confirming', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<PenaltyWarningModal {...defaultProps} onConfirm={onConfirm} />);
    const checkbox = document.getElementById('penalty-confirm') as HTMLInputElement;
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByText('Emergency Withdraw'));
    await vi.waitFor(() => expect(onConfirm).toHaveBeenCalledWith(1));
  });
});
