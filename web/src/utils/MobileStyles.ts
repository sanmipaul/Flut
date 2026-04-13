/**
 * Mobile-Specific CSS Utilities
 * Provides CSS-in-JS styles optimized for mobile devices
 */

import { useIsMobile, useIsSmallMobile, useIsPortrait, useScreenSize } from '../context/ResponsiveContext';

export interface MobileStyleConfig {
  /** Base font size */
  fontSize?: number;
  /** Base spacing */
  spacing?: number;
  /** Border radius */
  borderRadius?: number;
  /** Shadow intensity */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Animation duration */
  animationDuration?: number;
}

/**
 * Generate mobile-optimized styles
 */
export const createMobileStyles = (config: MobileStyleConfig = {}) => {
  const {
    fontSize = 16,
    spacing = 16,
    borderRadius = 8,
    shadow = 'md',
    animationDuration = 200,
  } = config;

  return {
    // Typography
    text: {
      xs: { fontSize: Math.max(fontSize * 0.75, 12) },
      sm: { fontSize: Math.max(fontSize * 0.85, 14) },
      base: { fontSize },
      lg: { fontSize: fontSize * 1.125 },
      xl: { fontSize: fontSize * 1.25 },
      '2xl': { fontSize: fontSize * 1.5 },
    },

    // Spacing
    spacing: {
      xs: Math.max(spacing * 0.5, 4),
      sm: Math.max(spacing * 0.75, 8),
      md: spacing,
      lg: spacing * 1.25,
      xl: spacing * 1.5,
      '2xl': spacing * 2,
    },

    // Layout
    layout: {
      container: {
        maxWidth: '100%',
        margin: '0 auto',
        padding: `${spacing}px`,
      },
      card: {
        borderRadius: borderRadius,
        padding: spacing,
        margin: spacing / 2,
      },
      button: {
        minHeight: 44,
        minWidth: 44,
        borderRadius: borderRadius,
        padding: `${spacing * 0.75}px ${spacing}px`,
      },
    },

    // Shadows (optimized for mobile performance)
    shadows: {
      none: 'none',
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },

    // Animations
    animations: {
      fast: `${animationDuration}ms ease-out`,
      normal: `${animationDuration * 1.5}ms ease-out`,
      slow: `${animationDuration * 2}ms ease-out`,
    },

    // Touch targets
    touch: {
      minSize: 44,
      padding: spacing,
      margin: spacing / 2,
    },

    // Touch-friendly styles
    touchFriendly: {
      WebkitTapHighlightColor: 'transparent',
      WebkitTouchCallout: 'none',
      WebkitUserSelect: 'none' as const,
      userSelect: 'none' as const,
    },

    // Smooth scrolling
    smoothScroll: {
      WebkitOverflowScrolling: 'touch',
      scrollBehavior: 'smooth',
    },
  };
};

/**
 * Hook to get mobile-optimized styles
 */
export const useMobileStyles = (config?: MobileStyleConfig) => {
  const styles = createMobileStyles(config);
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const isPortrait = useIsPortrait();
  const screenSize = useScreenSize();

  // Mobile-specific overrides
  const mobileOverrides = {
    text: {
      ...styles.text,
      base: {
        ...styles.text.base,
        fontSize: isSmallMobile ? Math.max(styles.text.base.fontSize * 0.9, 14) : styles.text.base.fontSize,
      },
    },
    layout: {
      ...styles.layout,
      container: {
        ...styles.layout.container,
        padding: isSmallMobile ? styles.spacing.sm : styles.spacing.md,
      },
      button: {
        ...styles.layout.button,
        minHeight: isSmallMobile ? 48 : 44,
        minWidth: isSmallMobile ? 48 : 44,
      },
    },
  };

  return {
    ...styles,
    ...mobileOverrides,
    isMobile,
    isSmallMobile,
    isPortrait,
    screenSize,
  };
};

/**
 * CSS-in-JS styles for common mobile patterns
 */
export const mobileCSS = {
  // Safe area handling
  safeArea: {
    paddingTop: 'env(safe-area-inset-top)',
    paddingBottom: 'env(safe-area-inset-bottom)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  },

  // Touch-friendly interactions
  touchFriendly: {
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
  },

  // Smooth scrolling
  smoothScroll: {
    WebkitOverflowScrolling: 'touch',
    scrollBehavior: 'smooth',
  },

  // Mobile-specific focus styles
  focusRing: {
    outline: 'none',
    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  },

  // High contrast for mobile
  highContrast: {
    color: '#1f2937',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
  },

  // Performance-optimized animations
  performantAnimation: {
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
  },
};

/**
 * Generate responsive grid styles
 */
export const createGridStyles = (columns: number = 12, gap: number = 16) => {
  const columnWidth = (span: number) => `${(span / columns) * 100}%`;

  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`,
      width: '100%',
    },
    gridColumn: (span: number) => ({
      gridColumn: `span ${span}`,
      minWidth: 0, // Prevent overflow
    }),
    // Mobile-first responsive classes
    responsive: {
      xs: {
        gridTemplateColumns: '1fr',
        gap: `${gap * 0.5}px`,
      },
      sm: {
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: `${gap * 0.75}px`,
      },
      md: {
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: `${gap}px`,
      },
      lg: {
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      },
    },
  };
};

export default createMobileStyles;