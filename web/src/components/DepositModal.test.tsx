import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DepositModal from './DepositModal';

const noop = async () => {};

describe('DepositModal', () => {
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DepositModal isOpen={false} vaultId={1} onDeposit={noop} onClose={noop} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(
      <DepositModal isOpen vaultId={7} onDeposit={noop} onClose={noop} />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/Deposit to Vault #7/i)).toBeInTheDocument();
  });

  it('shows current balance when currentAmount is provided', () => {
    render(
      <DepositModal isOpen vaultId={1} currentAmount={500} onDeposit={noop} onClose={noop} />
    );
    expect(screen.getByText('500 STX')).toBeInTheDocument();
  });

  it('calls onClose when Cancel button is clicked', () => {
    const onClose = jest.fn();
    render(<DepositModal isOpen vaultId={1} onDeposit={noop} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it('disables Deposit button when amount is empty', () => {
    render(<DepositModal isOpen vaultId={1} onDeposit={noop} onClose={noop} />);
    expect(screen.getByRole('button', { name: /confirm deposit/i })).toBeDisabled();
  });

  it('shows validation error when submitting with no amount', async () => {
    const user = userEvent.setup();
    render(<DepositModal isOpen vaultId={1} onDeposit={noop} onClose={noop} />);
    await user.click(screen.getByRole('button', { name: /confirm deposit/i }));
    expect(await screen.findByText(/valid amount/i)).toBeInTheDocument();
  });

  it('calls onDeposit with correct vaultId and parsed amount', async () => {
    const onDeposit = jest.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(<DepositModal isOpen vaultId={3} onDeposit={onDeposit} onClose={noop} />);
    await user.type(screen.getByLabelText(/amount/i), '100');
    await user.click(screen.getByRole('button', { name: /confirm deposit/i }));

    await waitFor(() => expect(onDeposit).toHaveBeenCalledWith(3, 100));
  });

  it('displays error message when onDeposit rejects', async () => {
    const onDeposit = jest.fn().mockRejectedValue(new Error('Vault locked'));
    const user = userEvent.setup();

    render(<DepositModal isOpen vaultId={1} onDeposit={onDeposit} onClose={noop} />);
    await user.type(screen.getByLabelText(/amount/i), '50');
    await user.click(screen.getByRole('button', { name: /confirm deposit/i }));

    expect(await screen.findByText('Vault locked')).toBeInTheDocument();
  });
});
