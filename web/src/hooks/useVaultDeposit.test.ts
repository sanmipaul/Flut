import { renderHook, act } from '@testing-library/react';
import { useVaultDeposit } from './useVaultDeposit';

describe('useVaultDeposit', () => {
  it('initialises with loading=false and empty error', () => {
    const { result } = renderHook(() => useVaultDeposit());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
  });

  it('sets loading=true while deposit is in progress', async () => {
    let resolve: () => void;
    const perform = () => new Promise<void>((res) => { resolve = res; });

    const { result } = renderHook(() => useVaultDeposit());

    act(() => {
      result.current.deposit(1, 100, perform);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => { resolve!(); });

    expect(result.current.loading).toBe(false);
  });

  it('calls onSuccess callback after successful deposit', async () => {
    const onSuccess = jest.fn();
    const perform = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useVaultDeposit({ onSuccess }));

    await act(async () => {
      await result.current.deposit(42, 250, perform);
    });

    expect(onSuccess).toHaveBeenCalledWith(42, 250);
    expect(result.current.error).toBe('');
  });

  it('sets error message when deposit throws', async () => {
    const perform = jest.fn().mockRejectedValue(new Error('Insufficient balance'));

    const { result } = renderHook(() => useVaultDeposit());

    await act(async () => {
      await result.current.deposit(1, 100, perform);
    });

    expect(result.current.error).toBe('Insufficient balance');
    expect(result.current.loading).toBe(false);
  });

  it('calls onError callback when deposit throws', async () => {
    const onError = jest.fn();
    const perform = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useVaultDeposit({ onError }));

    await act(async () => {
      await result.current.deposit(1, 50, perform);
    });

    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Network error' }));
  });

  it('clearError resets the error state', async () => {
    const perform = jest.fn().mockRejectedValue(new Error('Some error'));

    const { result } = renderHook(() => useVaultDeposit());

    await act(async () => {
      await result.current.deposit(1, 100, perform);
    });

    expect(result.current.error).toBe('Some error');

    act(() => { result.current.clearError(); });

    expect(result.current.error).toBe('');
  });
});
