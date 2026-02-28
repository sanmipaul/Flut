/**
 * Tests for useCopyToClipboard hook.
 *
 * Because the hook uses the browser Clipboard API and timers, tests rely on:
 *   - vi.useFakeTimers()  — to control the 2-second auto-reset
 *   - vi.stubGlobal()     — to replace navigator.clipboard with a mock
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useCopyToClipboard } from './useCopyToClipboard';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeClipboard(shouldReject = false) {
  return {
    writeText: shouldReject
      ? vi.fn().mockRejectedValue(new Error('denied'))
      : vi.fn().mockResolvedValue(undefined),
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('starts in idle state', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    expect(result.current.copyState).toBe('idle');
  });

  it('transitions to copied when clipboard write succeeds', async () => {
    vi.stubGlobal('navigator', { clipboard: makeClipboard() });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copyState).toBe('copied');
  });

  it('auto-resets to idle after 2 seconds', async () => {
    vi.stubGlobal('navigator', { clipboard: makeClipboard() });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copyState).toBe('copied');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.copyState).toBe('idle');
  });

  it('transitions to error when clipboard write fails and execCommand unavailable', async () => {
    // No clipboard API, no execCommand
    vi.stubGlobal('navigator', {});
    // document.execCommand doesn't exist in the test env by default

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copyState).toBe('error');
  });

  it('resets timer when copy is called again before auto-reset fires', async () => {
    vi.stubGlobal('navigator', { clipboard: makeClipboard() });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('first');
    });

    // Advance only 1 second (not the full 2)
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Copy again — should restart the 2-second timer
    await act(async () => {
      await result.current.copy('second');
    });

    expect(result.current.copyState).toBe('copied');

    // Advance another 1 second (2 total since second copy) — should still be copied
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copyState).toBe('copied');

    // Advance another 1 second (3 total, 2 since second copy) — should now reset
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.copyState).toBe('idle');
  });

  it('reset() returns state to idle immediately', async () => {
    vi.stubGlobal('navigator', { clipboard: makeClipboard() });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copyState).toBe('copied');

    act(() => {
      result.current.reset();
    });

    expect(result.current.copyState).toBe('idle');
  });

  it('respects a custom resetDelay option', async () => {
    vi.stubGlobal('navigator', { clipboard: makeClipboard() });

    const { result } = renderHook(() =>
      useCopyToClipboard({ resetDelay: 500 })
    );

    await act(async () => {
      await result.current.copy('hello');
    });

    expect(result.current.copyState).toBe('copied');

    // Should still be copied at 499ms
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.copyState).toBe('copied');

    // Should reset at 500ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.copyState).toBe('idle');
  });

  it('falls back to execCommand when async clipboard API is unavailable', async () => {
    // No clipboard on navigator
    vi.stubGlobal('navigator', {});
    // Provide execCommand stub
    const execCommand = vi.fn().mockReturnValue(true);
    vi.stubGlobal('document', {
      ...document,
      execCommand,
      createElement: document.createElement.bind(document),
      body: document.body,
    });

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copy('fallback text');
    });

    expect(result.current.copyState).toBe('copied');
  });
});
