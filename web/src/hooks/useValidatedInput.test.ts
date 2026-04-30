/**
 * Tests for useValidatedInput hook with accessibility features.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useValidatedInput } from './useValidatedInput';
import type { Validator } from '../utils/validation';

describe('useValidatedInput', () => {
  it('should initialize with correct default values', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: true,
      errors: [],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnBlur: true,
      })
    );
    expect(result.current.value).toBe('');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isTouched).toBe(false);
    expect(result.current.validation.isValid).toBe(true);
  });

  it('should update value when setValue is called', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: true,
      errors: [],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnBlur: true,
      })
    );
    act(() => {
      result.current.setValue('new value');
    });
    expect(result.current.value).toBe('new value');
    expect(result.current.isDirty).toBe(true);
  });

  it('should mark field as touched on blur', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: true,
      errors: [],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnBlur: true,
      })
    );
    act(() => {
      result.current.handleBlur();
    });
    expect(result.current.isTouched).toBe(true);
  });

  it('should reset to initial state', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: true,
      errors: [],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: 'initial',
        validator,
        validateOnBlur: true,
      })
    );
    act(() => {
      result.current.setValue('changed');
      result.current.handleBlur();
      result.current.reset();
    });
    expect(result.current.value).toBe('initial');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isTouched).toBe(false);
  });

  it('should return validation errors when validation fails', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: false,
      errors: ['Required field'],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnBlur: true,
      })
    );
    act(() => {
      result.current.handleBlur();
    });
    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.errors).toContain('Required field');
  });

  it('should not validate when not touched and validateOnBlur is true', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: false,
      errors: ['Should not show'],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnBlur: true,
      })
    );
    expect(result.current.validation.isValid).toBe(true);
    expect(result.current.validation.errors).toEqual([]);
  });

  it('should validate when validateOnChange is true', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: false,
      errors: ['Invalid'],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnChange: true,
        validateOnBlur: false,
      })
    );
    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.errors).toContain('Invalid');
  });

  it('should validate after touch when validateOnBlur is true', () => {
    const validator: Validator<string> = vi.fn(() => ({
      isValid: false,
      errors: ['Invalid after touch'],
    }));
    const { result } = renderHook(() =>
      useValidatedInput({
        initialValue: '',
        validator,
        validateOnBlur: true,
      })
    );
    act(() => {
      result.current.handleBlur();
    });
    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.errors).toContain('Invalid after touch');
  });
});
