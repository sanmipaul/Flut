import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useStxFormat } from './useStxFormat';

describe('useStxFormat', () => {
  it('returns fmt function that formats with STX symbol', () => {
    const { result } = renderHook(() => useStxFormat());
    const out = result.current.fmt(500);
    expect(out).toContain('500');
    expect(out).toContain('STX');
  });

  it('fmtCompact abbreviates millions', () => {
    const { result } = renderHook(() => useStxFormat());
    const out = result.current.fmtCompact(1_200_000);
    expect(out).toContain('M');
  });

  it('fmtMicro converts from microSTX', () => {
    const { result } = renderHook(() => useStxFormat());
    const out = result.current.fmtMicro(1_000_000);
    expect(out).toContain('1');
    expect(out).toContain('STX');
  });

  it('fmtWhole rounds to nearest integer', () => {
    const { result } = renderHook(() => useStxFormat());
    const out = result.current.fmtWhole(1.9);
    expect(out).not.toContain('.');
    expect(out).toContain('2');
  });

  it('fmtPenalty includes minus sign and fee label', () => {
    const { result } = renderHook(() => useStxFormat());
    const out = result.current.fmtPenalty(100);
    expect(out).toContain('−');
    expect(out).toContain('fee');
  });

  it('parse converts string to number', () => {
    const { result } = renderHook(() => useStxFormat());
    expect(result.current.parse('250')).toBe(250);
  });

  it('toMicro converts STX to uSTX', () => {
    const { result } = renderHook(() => useStxFormat());
    expect(result.current.toMicro(1)).toBe(1_000_000);
  });

  it('fromMicro converts uSTX to STX', () => {
    const { result } = renderHook(() => useStxFormat());
    expect(result.current.fromMicro(1_000_000)).toBe(1);
  });

  it('exposes a locale string', () => {
    const { result } = renderHook(() => useStxFormat());
    expect(typeof result.current.locale).toBe('string');
    expect(result.current.locale.length).toBeGreaterThan(0);
  });
});
