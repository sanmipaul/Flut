/**
 * Tests for useFormValidation hook with accessibility features.
 */
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from './useFormValidation';
import type { ValidationResult } from '../utils/validation';

describe('useFormValidation', () => {
  it('should initialize with correct values', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '', email: '' },
        validators: {
          name: () => ({ isValid: true, errors: [] }),
          email: () => ({ isValid: true, errors: [] }),
        },
      })
    );
    expect(result.current.values).toEqual({ name: '', email: '' });
    expect(result.current.isValid).toBe(true);
    expect(result.current.isDirty).toBe(false);
  });

  it('should update field value', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '' },
        validators: {
          name: () => ({ isValid: true, errors: [] }),
        },
      })
    );
    act(() => {
      result.current.setFieldValue('name', 'John');
    });
    expect(result.current.values.name).toBe('John');
    expect(result.current.isDirty).toBe(true);
  });

  it('should validate fields', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '' },
        validators: {
          name: (value) => ({
            isValid: value.length > 0,
            errors: value.length > 0 ? [] : ['Name is required'],
          }),
        },
      })
    );
    expect(result.current.isValid).toBe(false);
    expect(result.current.validations.name.isValid).toBe(false);
    expect(result.current.validations.name.errors).toContain('Name is required');
  });

  it('should reset to initial values', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: 'initial' },
        validators: {
          name: () => ({ isValid: true, errors: [] }),
        },
      })
    );
    act(() => {
      result.current.setFieldValue('name', 'changed');
      result.current.reset();
    });
    expect(result.current.values.name).toBe('initial');
    expect(result.current.isDirty).toBe(false);
  });

  it('should include announcement metadata when enabled', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '' },
        validators: {
          name: () => ({
            isValid: false,
            errors: ['Name is required'],
          }),
        },
        enableAnnouncements: true,
      })
    );
    expect(result.current.validations.name.shouldAnnounce).toBe(true);
    expect(result.current.validations.name.announcement).toContain('Error in name');
    expect(result.current.validations.name.announcement).toContain('Name is required');
  });

  it('should not include announcement metadata when disabled', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '' },
        validators: {
          name: () => ({
            isValid: false,
            errors: ['Name is required'],
          }),
        },
        enableAnnouncements: false,
      })
    );
    // Should still be ValidationResultWithAnnouncement but without announcement fields
    expect(result.current.validations.name.isValid).toBe(false);
    expect(result.current.validations.name.errors).toContain('Name is required');
  });

  it('should handle multiple fields with validations', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '', email: '', age: 0 },
        validators: {
          name: (v) => ({ isValid: v.length > 0, errors: v.length > 0 ? [] : ['Required'] }),
          email: (v) => ({ isValid: v.includes('@'), errors: v.includes('@') ? [] : ['Invalid email'] }),
          age: (v) => ({ isValid: v > 0, errors: v > 0 ? [] : ['Must be positive'] }),
        },
        enableAnnouncements: true,
      })
    );
    expect(result.current.isValid).toBe(false);
    expect(result.current.validations.name.isValid).toBe(false);
    expect(result.current.validations.email.isValid).toBe(false);
    expect(result.current.validations.age.isValid).toBe(false);
  });

  it('should update validations when values change', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: '' },
        validators: {
          name: (v) => ({ isValid: v.length >= 3, errors: v.length >= 3 ? [] : ['Too short'] }),
        },
      })
    );
    expect(result.current.isValid).toBe(false);
    act(() => {
      result.current.setFieldValue('name', 'Jo');
    });
    expect(result.current.isValid).toBe(false);
    act(() => {
      result.current.setFieldValue('name', 'John');
    });
    expect(result.current.isValid).toBe(true);
  });

  it('should include announcement for valid state when enabled', () => {
    const { result } = renderHook(() =>
      useFormValidation({
        initialValues: { name: 'John' },
        validators: {
          name: () => ({ isValid: true, errors: [] }),
        },
        enableAnnouncements: true,
      })
    );
    expect(result.current.validations.name.isValid).toBe(true);
    expect(result.current.validations.name.shouldAnnounce).toBe(false);
    expect(result.current.validations.name.announcement).toBeUndefined();
  });
});
