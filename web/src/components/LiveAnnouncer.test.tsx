/**
 * Tests for LiveAnnouncer component with accessibility features.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LiveAnnouncer, SSRSafeAnnouncement } from './LiveAnnouncer';

describe('LiveAnnouncer', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      ...global.window,
      document: {
        ...global.document,
        querySelector: vi.fn(),
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should not render on server (no window)', () => {
    const originalWindow = global.window;
    // @ts-ignore
    delete global.window;

    const { container } = render(
      <LiveAnnouncer message="Test" politeness="polite" />
    );
    expect(container.innerHTML).toBe('');

    // @ts-ignore
    global.window = originalWindow;
  });

  it('should render aria-live region on client', () => {
    const { container } = render(
      <LiveAnnouncer message="Test message" politeness="polite" />
    );
    const srRegion = container.querySelector('.sr-only');
    expect(srRegion).toBeDefined();
    expect(srRegion).toHaveAttribute('role', 'status');
    expect(srRegion).toHaveAttribute('aria-live', 'polite');
    expect(srRegion).toHaveAttribute('aria-atomic', 'true');
    expect(srRegion).toHaveClass('sr-only');
  });

  it('should render with assertive politeness', () => {
    const { container } = render(
      <LiveAnnouncer message="Important" politeness="assertive" />
    );
    const srRegion = container.querySelector('.sr-only');
    expect(srRegion).toHaveAttribute('aria-live', 'assertive');
  });

  it('should not render when politeness is off', () => {
    const { container } = render(
      <LiveAnnouncer message="Test" politeness="off" />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render custom className', () => {
    const { container } = render(
      <LiveAnnouncer message="Test" politeness="polite" className="custom-class" />
    );
    const srRegion = container.querySelector('.sr-only');
    expect(srRegion).toHaveClass('custom-class');
  });

  it('should render the message content', () => {
    const { container } = render(
      <LiveAnnouncer message="Announcement text" politeness="polite" />
    );
    const srRegion = container.querySelector('.sr-only');
    expect(srRegion?.textContent).toBe('Announcement text');
  });
});

describe('SSRSafeAnnouncement', () => {
  it('should render aria-live region', () => {
    const { container } = render(
      <SSRSafeAnnouncement message="Test" politeness="polite" />
    );
    const srRegion = container.querySelector('.sr-only');
    expect(srRegion).toBeDefined();
  });

  it('should render with default politeness', () => {
    const { container } = render(
      <SSRSafeAnnouncement message="Test" />
    );
    const srRegion = container.querySelector('.sr-only');
    expect(srRegion).toHaveAttribute('aria-live', 'polite');
  });
});
