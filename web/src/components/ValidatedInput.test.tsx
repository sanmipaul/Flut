/**
 * Tests for ValidatedInput component with accessibility features.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ValidatedInput } from './ValidatedInput';
import { useValidatedInput } from '../hooks/useValidatedInput';

// Mock the useValidatedInput hook
vi.mock('../hooks/useValidatedInput');

const mockValidator = vi.fn();

function setup(props: Partial<Parameters<typeof ValidatedInput>[0]> = {}) {
  const defaultProps = {
    id: 'test-input',
    label: 'Test Label',
    validator: mockValidator,
    placeholder: 'Enter text',
    required: false,
  };
  return render(<ValidatedInput {...defaultProps} {...props} />);
}

describe('ValidatedInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an input with label', () => {
    setup();
    expect(screen.getByLabelText('Test Label')).toBeDefined();
    expect(screen.getByPlaceholderText('Enter text')).toBeDefined();
  });

  it('renders required indicator when required is true', () => {
    setup({ required: true });
    expect(screen.getByText('*')).toBeDefined();
  });

  it('includes aria-live region for screen reader announcements', () => {
    setup();
    const srRegion = screen.getByRole('status', { hidden: true });
    expect(srRegion).toBeDefined();
    expect(srRegion).toHaveAttribute('aria-live', 'polite');
    expect(srRegion).toHaveAttribute('aria-atomic', 'true');
  });

  it('has sr-only class for visually hidden announcement region', () => {
    setup();
    const srRegion = screen.getByRole('status', { hidden: true });
    expect(srRegion).toHaveClass('sr-only');
  });

  describe('accessibility announcements', () => {
    it('announces validation error when validation fails', () => {
      const mockValidation = {
        isValid: false,
        errors: ['Field is required'],
      };
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: '',
        setValue: vi.fn(),
        validation: mockValidation,
        isDirty: false,
        isTouched: true,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion.textContent).toContain('Error');
    });

    it('announces valid input when validation passes with non-empty value', () => {
      const mockValidation = {
        isValid: true,
        errors: [],
      };
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: 'valid text',
        setValue: vi.fn(),
        validation: mockValidation,
        isDirty: true,
        isTouched: true,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion.textContent).toContain('valid');
    });

    it('has empty announcement region when input is empty and untouched', () => {
      const mockValidation = {
        isValid: true,
        errors: [],
      };
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: '',
        setValue: vi.fn(),
        validation: mockValidation,
        isDirty: false,
        isTouched: false,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion.textContent).toBe('');
    });

    it('sets aria-invalid on input when validation fails', () => {
      const mockValidation = {
        isValid: false,
        errors: ['Invalid input'],
      };
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: 'bad',
        setValue: vi.fn(),
        validation: mockValidation,
        isDirty: true,
        isTouched: true,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });

    it('sets aria-describedby when there is an error', () => {
      const mockValidation = {
        isValid: false,
        errors: ['Error message'],
      };
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: 'bad',
        setValue: vi.fn(),
        validation: mockValidation,
        isDirty: true,
        isTouched: true,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-describedby')).toBe('test-input-error');
    });

    it('does not set aria-describedby when validation passes', () => {
      const mockValidation = {
        isValid: true,
        errors: [],
      };
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: 'good',
        setValue: vi.fn(),
        validation: mockValidation,
        isDirty: true,
        isTouched: true,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const input = screen.getByRole('textbox');
      expect(input.getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('input interaction', () => {
    it('calls setValue on change', () => {
      const setValue = vi.fn();
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: '',
        setValue,
        validation: { isValid: true, errors: [] },
        isDirty: false,
        isTouched: false,
        handleBlur: vi.fn(),
        reset: vi.fn(),
      });

      setup();
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      expect(setValue).toHaveBeenCalledWith('new value');
    });

    it('calls handleBlur on blur', () => {
      const handleBlur = vi.fn();
      (useValidatedInput as vi.Mock).mockReturnValue({
        value: '',
        setValue: vi.fn(),
        validation: { isValid: true, errors: [] },
        isDirty: false,
        isTouched: false,
        handleBlur,
        reset: vi.fn(),
      });

      setup();
      const input = screen.getByRole('textbox');
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });
  });
});
