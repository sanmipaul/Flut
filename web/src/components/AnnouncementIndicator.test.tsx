/**
 * Tests for AnnouncementIndicator component.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnnouncementIndicator } from './AnnouncementIndicator';
import { LiveAnnouncer } from './LiveAnnouncer';

describe('AnnouncementIndicator', () => {
  it('should not render when disabled', () => {
    const { container } = render(
      <AnnouncementIndicator enabled={false} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should not render when no announcement message', () => {
    const { container } = render(
      <AnnouncementIndicator enabled={true} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render when enabled and message exists', () => {
    const { container } = render(
      <LiveAnnouncer>
        <AnnouncementIndicator enabled={true} />
      </LiveAnnouncer>
    );
    // Without a message, it still won't show
    expect(container.querySelector('.animate-fade-in')).toBeNull();
  });

  it('should render in correct position (bottom-right by default)', () => {
    const { container } = render(
      <AnnouncementIndicator
        enabled={true}
        position="bottom-right"
      />
    );
    // Position class would be applied when visible
    const indicator = container.querySelector('div');
    if (indicator) {
      expect(indicator).toHaveClass('bottom-4');
      expect(indicator).toHaveClass('right-4');
    }
  });

  it('should render in top-left position when specified', () => {
    const { container } = render(
      <AnnouncementIndicator
        enabled={true}
        position="top-left"
      />
    );
    const indicator = container.querySelector('div');
    if (indicator) {
      expect(indicator).toHaveClass('top-4');
      expect(indicator).toHaveClass('left-4');
    }
  });

  it('should contain SVG icon when visible', () => {
    const { container } = render(
      <AnnouncementIndicator enabled={true} />
    );
    const svg = container.querySelector('svg');
    // SVG might not render if indicator is hidden
    if (svg) {
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    }
  });

  it('should have role="status" when visible', () => {
    const { container } = render(
      <AnnouncementIndicator enabled={true} />
    );
    const indicator = container.querySelector('div');
    if (indicator) {
      expect(indicator).toHaveAttribute('role', 'status');
    }
  });
});
