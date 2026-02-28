/**
 * Tests for StxAmountInput component.
 */
import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StxAmountInput from './StxAmountInput';

// Wrapper to keep value in sync
function Controlled({ onParsed = vi.fn(), min = 0, max }: { onParsed?: (n: number) => void; min?: number; max?: number }) {
  const [val, setVal] = useState('');
  return (
    <StxAmountInput
      value={val}
      onChange={setVal}
      onParsed={onParsed}
      min={min}
      max={max}
      id="test-input"
    />
  );
}

describe('StxAmountInput', () => {
  it('renders an input', () => {
    render(<Controlled />);
    expect(screen.getByRole('textbox')).toBeDefined();
  });

  it('shows STX suffix', () => {
    render(<Controlled />);
    expect(document.querySelector('.stx-amount-input__suffix')?.textContent).toBe('STX');
  });

  it('accepts numeric input', () => {
    render(<Controlled />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '500' } });
    expect((input as HTMLInputElement).value).toBe('500');
  });

  it('calls onParsed with parsed value on valid input', () => {
    const onParsed = vi.fn();
    render(<Controlled onParsed={onParsed} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '250' } });
    expect(onParsed).toHaveBeenCalledWith(250);
  });

  it('calls onParsed with NaN on invalid input', () => {
    const onParsed = vi.fn();
    render(<Controlled onParsed={onParsed} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onParsed).toHaveBeenCalledWith(NaN);
  });

  it('shows error message for invalid input', () => {
    render(<Controlled />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'xyz' } });
    expect(screen.getByRole('alert')).toBeDefined();
  });

  it('shows error when value is below min', () => {
    render(<Controlled min={100} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '50' } });
    expect(screen.getByRole('alert').textContent).toContain('Minimum');
  });

  it('shows error when value exceeds max', () => {
    render(<Controlled max={100} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '200' } });
    expect(screen.getByRole('alert').textContent).toContain('Maximum');
  });

  it('does not show error on empty input before touch', () => {
    render(<Controlled />);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('accepts compact suffixes like 5k', () => {
    const onParsed = vi.fn();
    render(<Controlled onParsed={onParsed} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '5k' } });
    expect(onParsed).toHaveBeenCalledWith(5000);
  });

  it('sets aria-invalid on the input when there is an error', () => {
    render(<Controlled />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'bad' } });
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });
});
