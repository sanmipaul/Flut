/**
 * Tests for CopyButton component.
 *
 * Covers rendering, state-based icon/class changes, size prop,
 * showText prop, and stopPropagation behaviour.
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CopyButton from './CopyButton';

// ---------------------------------------------------------------------------
// Mock useCopyToClipboard so component tests are deterministic
// ---------------------------------------------------------------------------

const mockCopy = vi.fn();
const mockReset = vi.fn();
let mockCopyState: 'idle' | 'copied' | 'error' = 'idle';

vi.mock('../hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copyState: mockCopyState,
    copy: mockCopy,
    reset: mockReset,
  }),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CopyButton', () => {
  beforeEach(() => {
    mockCopyState = 'idle';
    mockCopy.mockClear();
    mockReset.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders in idle state with clipboard icon', () => {
    render(<CopyButton text="SP123" />);
    const btn = screen.getByRole('button');
    expect(btn).toBeDefined();
    expect(btn.textContent).toContain('⎘');
    expect(btn.className).toContain('copy-btn--idle');
  });

  it('renders the default aria-label when idle', () => {
    render(<CopyButton text="SP123" label="Copy address" />);
    const btn = screen.getByRole('button', { name: /copy address/i });
    expect(btn).toBeDefined();
  });

  it('calls copy() with the correct text when clicked', () => {
    render(<CopyButton text="SP123ABC" />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockCopy).toHaveBeenCalledWith('SP123ABC');
  });

  it('shows checkmark and copied class in copied state', () => {
    mockCopyState = 'copied';
    render(<CopyButton text="SP123" />);
    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('✓');
    expect(btn.className).toContain('copy-btn--copied');
  });

  it('shows error icon and error class in error state', () => {
    mockCopyState = 'error';
    render(<CopyButton text="SP123" />);
    const btn = screen.getByRole('button');
    expect(btn.textContent).toContain('✕');
    expect(btn.className).toContain('copy-btn--error');
  });

  it('applies size class for sm (default)', () => {
    render(<CopyButton text="SP123" />);
    expect(screen.getByRole('button').className).toContain('copy-btn--sm');
  });

  it('applies size class for md', () => {
    render(<CopyButton text="SP123" size="md" />);
    expect(screen.getByRole('button').className).toContain('copy-btn--md');
  });

  it('does not show text by default', () => {
    render(<CopyButton text="SP123" />);
    const btn = screen.getByRole('button');
    expect(btn.querySelector('.copy-btn__text')).toBeNull();
  });

  it('shows text when showText is true', () => {
    render(<CopyButton text="SP123" showText />);
    const btn = screen.getByRole('button');
    const textSpan = btn.querySelector('.copy-btn__text');
    expect(textSpan).not.toBeNull();
    expect(textSpan?.textContent).toBe('Copy');
  });

  it('shows Copied! text in copied state when showText is true', () => {
    mockCopyState = 'copied';
    render(<CopyButton text="SP123" showText />);
    const btn = screen.getByRole('button');
    expect(btn.querySelector('.copy-btn__text')?.textContent).toBe('Copied!');
  });

  it('stops propagation on click', () => {
    const parentHandler = vi.fn();
    render(
      <div onClick={parentHandler}>
        <CopyButton text="SP123" />
      </div>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(parentHandler).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<CopyButton text="SP123" className="my-custom-class" />);
    expect(screen.getByRole('button').className).toContain('my-custom-class');
  });
});
