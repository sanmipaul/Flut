/**
 * Tests for FormField component with accessibility features.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormField } from './FormField';
import type { ValidationResult } from '../utils/validation';

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField id="test" label="Test Label">
        <input />
      </FormField>
    );
    expect(screen.getByLabelText('Test Label')).toBeDefined();
  });

  it('renders required indicator when required is true', () => {
    render(
      <FormField id="test" label="Test Label" required>
        <input />
      </FormField>
    );
    expect(screen.getByText('*')).toBeDefined();
  });

  it('renders help text when provided and no error', () => {
    render(
      <FormField id="test" label="Test Label" helpText="Help text">
        <input />
      </FormField>
    );
    expect(screen.getByText('Help text')).toBeDefined();
  });

  it('does not render help text when there is an error', () => {
    const validation: ValidationResult = {
      isValid: false,
      errors: ['Error'],
    };
    render(
      <FormField id="test" label="Test Label" helpText="Help text" validation={validation}>
        <input />
      </FormField>
    );
    expect(screen.queryByText('Help text')).toBeNull();
  });

  it('renders error message when validation fails', () => {
    const validation: ValidationResult = {
      isValid: false,
      errors: ['Error message'],
    };
    render(
      <FormField id="test" label="Test Label" validation={validation}>
        <input />
      </FormField>
    );
    expect(screen.getByText('Error message')).toBeDefined();
  });

  it('renders multiple error messages when validation fails', () => {
    const validation: ValidationResult = {
      isValid: false,
      errors: ['Error 1', 'Error 2'],
    };
    render(
      <FormField id="test" label="Test Label" validation={validation}>
        <input />
      </FormField>
    );
    expect(screen.getByText('Error 1')).toBeDefined();
    expect(screen.getByText('Error 2')).toBeDefined();
  });

  describe('accessibility announcements', () => {
    it('does not include aria-live region by default', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Error'],
      };
      render(
        <FormField id="test" label="Test Label" validation={validation}>
          <input />
        </FormField>
      );
      const srRegions = screen.queryAllByRole('status', { hidden: true });
      expect(srRegions).toHaveLength(0);
    });

    it('includes aria-live region when showAnnouncement is true and there is an error', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Error message'],
      };
      render(
        <FormField id="test" label="Test Label" validation={validation} showAnnouncement>
          <input />
        </FormField>
      );
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion).toBeDefined();
      expect(srRegion).toHaveAttribute('aria-live', 'polite');
      expect(srRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('has sr-only class when showAnnouncement is enabled', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Error'],
      };
      render(
        <FormField id="test" label="Test Label" validation={validation} showAnnouncement>
          <input />
        </FormField>
      );
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion).toHaveClass('sr-only');
    });

    it('announces error message when showAnnouncement is true and validation fails', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Field is required'],
      };
      render(
        <FormField id="test" label="Test Label" validation={validation} showAnnouncement>
          <input />
        </FormField>
      );
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion.textContent).toContain('Error');
      expect(srRegion.textContent).toContain('Field is required');
    });

    it('announces valid state when showAnnouncement is true and validation passes', () => {
      const validation: ValidationResult = {
        isValid: true,
        errors: [],
      };
      render(
        <FormField id="test" label="Test Label" validation={validation} showAnnouncement>
          <input />
        </FormField>
      );
      const srRegion = screen.getByRole('status', { hidden: true });
      expect(srRegion.textContent).toContain('Input is valid');
    });

    it('does not announce when showAnnouncement is false', () => {
      const validation: ValidationResult = {
        isValid: false,
        errors: ['Error'],
      };
      render(
        <FormField id="test" label="Test Label" validation={validation} showAnnouncement={false}>
          <input />
        </FormField>
      );
      const srRegions = screen.queryAllByRole('status', { hidden: true });
      expect(srRegions).toHaveLength(0);
    });
  });
});
