/**
 * Unit tests for useDebounce
 *
 * Uses jest's fake timer API to control time without real async waits.
 */
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 200));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 200),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe('hello');
  });

  it('updates to the latest value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 200),
      { initialProps: { value: 'hello' } }
    );

    rerender({ value: 'world' });
    act(() => { jest.advanceTimersByTime(200); });
    expect(result.current).toBe('world');
  });

  it('uses 200ms as the default delay', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => { jest.advanceTimersByTime(199); });
    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current).toBe('b');
  });

  it('resets the timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 200),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => { jest.advanceTimersByTime(100); });

    rerender({ value: 'c' });
    act(() => { jest.advanceTimersByTime(100); });

    // Still 'a' because neither update fully elapsed
    expect(result.current).toBe('a');

    act(() => { jest.advanceTimersByTime(100); });
    // Now 200ms after last change
    expect(result.current).toBe('c');
  });
});
