/**
 * Tests for useLiveAnnouncer hook.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLiveAnnouncer } from './useLiveAnnouncer';

describe('useLiveAnnouncer', () => {
  vi.useFakeTimers();

  it('should initialize with empty message and default politeness', () => {
    const { result } = renderHook(() => useLiveAnnouncer());
    expect(result.current.message).toBe('');
    expect(result.current.politeness).toBe('polite');
  });

  it('should initialize with custom politeness', () => {
    const { result } = renderHook(() =>
      useLiveAnnouncer({ defaultPoliteness: 'assertive' })
    );
    expect(result.current.politeness).toBe('assertive');
  });

  it('should announce a message with default politeness', () => {
    const { result } = renderHook(() => useLiveAnnouncer());
    act(() => {
      result.current.announce('Test message');
    });
    expect(result.current.message).toBe('Test message');
    expect(result.current.politeness).toBe('polite');
  });

  it('should announce a message with custom politeness', () => {
    const { result } = renderHook(() => useLiveAnnouncer());
    act(() => {
      result.current.announce('Important', 'assertive');
    });
    expect(result.current.message).toBe('Important');
    expect(result.current.politeness).toBe('assertive');
  });

  it('should clear the announcement message', () => {
    const { result } = renderHook(() => useLiveAnnouncer());
    act(() => {
      result.current.announce('Test message');
    });
    expect(result.current.message).toBe('Test message');
    act(() => {
      result.current.clear();
    });
    expect(result.current.message).toBe('');
  });

  it('should auto-clear message after delay', () => {
    const { result } = renderHook(() => useLiveAnnouncer());
    act(() => {
      result.current.announce('Test message');
    });
    expect(result.current.message).toBe('Test message');
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.message).toBe('');
  });

  it('should debounce rapid announcements', () => {
    const { result } = renderHook(() => useLiveAnnouncer({ debounceMs: 100 }));
    act(() => {
      result.current.announce('First');
      result.current.announce('Second');
      result.current.announce('Third');
    });
    expect(result.current.message).toBe('Third');
  });

  it('should allow new announcement after auto-clear', () => {
    const { result } = renderHook(() => useLiveAnnouncer());
    act(() => {
      result.current.announce('First');
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.message).toBe('');
    act(() => {
      result.current.announce('Second');
    });
    expect(result.current.message).toBe('Second');
  });
});
