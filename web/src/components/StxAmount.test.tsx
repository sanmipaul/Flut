/**
 * Tests for StxAmount display component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StxAmount from './StxAmount';

describe('StxAmount', () => {
  it('renders a STX amount with symbol', () => {
    render(<StxAmount amount={500} />);
    const el = document.querySelector('.stx-amount');
    expect(el?.textContent).toContain('STX');
    expect(el?.textContent).toContain('500');
  });

  it('sets data-amount attribute to the raw value', () => {
    render(<StxAmount amount={1234} />);
    const el = document.querySelector('[data-amount]');
    expect(el?.getAttribute('data-amount')).toBe('1234');
  });

  it('sets data-unit to "stx" by default', () => {
    render(<StxAmount amount={500} />);
    expect(document.querySelector('[data-unit="stx"]')).not.toBeNull();
  });

  it('sets data-unit to "microstx" when fromMicroStx=true', () => {
    render(<StxAmount amount={1_000_000} fromMicroStx />);
    expect(document.querySelector('[data-unit="microstx"]')).not.toBeNull();
  });

  it('applies positive highlight class', () => {
    render(<StxAmount amount={100} highlight="positive" />);
    expect(document.querySelector('.stx-amount--positive')).not.toBeNull();
  });

  it('applies negative highlight class', () => {
    render(<StxAmount amount={100} highlight="negative" />);
    expect(document.querySelector('.stx-amount--negative')).not.toBeNull();
  });

  it('applies warning highlight class', () => {
    render(<StxAmount amount={100} highlight="warning" />);
    expect(document.querySelector('.stx-amount--warning')).not.toBeNull();
  });

  it('neutral highlight adds no extra class', () => {
    render(<StxAmount amount={100} highlight="neutral" />);
    const el = document.querySelector('.stx-amount');
    expect(el?.className.trim()).toBe('stx-amount');
  });

  it('hides symbol when showSymbol=false', () => {
    render(<StxAmount amount={100} showSymbol={false} />);
    expect(document.querySelector('.stx-amount')?.textContent).not.toContain('STX');
  });

  it('applies custom className', () => {
    render(<StxAmount amount={100} className="my-class" />);
    expect(document.querySelector('.my-class')).not.toBeNull();
  });
});
