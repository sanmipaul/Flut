/**
 * Tests for useToast hook.
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useToast, DISMISS_DELAY_MS, MAX_TOASTS } from './useToast';
import { TOAST_DURATION_DEFAULT, TOAST_DURATION_ERROR } from '../types/Toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts with no toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toHaveLength(0);
  });

  it('addToast appends a toast and returns its id', () => {
    const { result } = renderHook(() => useToast());

    let id: string;
    act(() => {
      id = result.current.addToast('Hello world', { variant: 'info' });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].id).toBe(id!);
    expect(result.current.toasts[0].message).toBe('Hello world');
    expect(result.current.toasts[0].variant).toBe('info');
  });

  it('toast.success creates a success toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast.success('Done!'); });
    expect(result.current.toasts[0].variant).toBe('success');
  });

  it('toast.error creates an error toast with longer duration', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast.error('Oops'); });
    expect(result.current.toasts[0].variant).toBe('error');
    expect(result.current.toasts[0].duration).toBe(TOAST_DURATION_ERROR);
  });

  it('toast.warning creates a warning toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast.warning('Careful'); });
    expect(result.current.toasts[0].variant).toBe('warning');
  });

  it('toast.info creates an info toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast.info('FYI'); });
    expect(result.current.toasts[0].variant).toBe('info');
  });

  it('auto-dismisses after duration', () => {
    const { result } = renderHook(() => useToast());
    act(() => { result.current.toast.success('Fast'); });

    expect(result.current.toasts).toHaveLength(1);

    act(() => { vi.advanceTimersByTime(TOAST_DURATION_DEFAULT); });

    // Toast should be in dismissing state
    expect(result.current.toasts[0].dismissing).toBe(true);

    // After DISMISS_DELAY_MS the toast is fully removed
    act(() => { vi.advanceTimersByTime(DISMISS_DELAY_MS); });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('dismissToast marks the toast as dismissing', () => {
    const { result } = renderHook(() => useToast());
    let id: string;
    act(() => { id = result.current.toast.info('Bye'); });

    act(() => { result.current.dismissToast(id!); });
    expect(result.current.toasts[0].dismissing).toBe(true);
  });

  it('dismissToast removes the toast after DISMISS_DELAY_MS', () => {
    const { result } = renderHook(() => useToast());
    let id: string;
    act(() => { id = result.current.toast.info('Bye'); });

    act(() => { result.current.dismissToast(id!); });
    act(() => { vi.advanceTimersByTime(DISMISS_DELAY_MS); });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('clearAll removes every toast immediately', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast.info('A');
      result.current.toast.info('B');
      result.current.toast.info('C');
    });
    expect(result.current.toasts).toHaveLength(3);

    act(() => { result.current.clearAll(); });
    expect(result.current.toasts).toHaveLength(0);
  });

  it(`evicts oldest toasts when over MAX_TOASTS (${MAX_TOASTS})`, () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      for (let i = 0; i < MAX_TOASTS + 2; i++) {
        result.current.toast.info(`Toast ${i}`);
      }
    });
    expect(result.current.toasts).toHaveLength(MAX_TOASTS);
  });

  it('stores optional description on the toast', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('Title', { variant: 'info', description: 'Details here' });
    });
    expect(result.current.toasts[0].description).toBe('Details here');
  });

  it('persistent toast (duration=0) does not auto-dismiss', () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.addToast('Sticky', { variant: 'info', duration: 0 });
    });
    act(() => { vi.advanceTimersByTime(60000); });
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].dismissing).toBe(false);
  });
});
