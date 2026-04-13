/**
 * Mobile Optimized Interactions Hook
 * Provides utilities for better mobile UX
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useIsMobile, useIsSmallMobile, useIsPortrait, useScreenSize } from '../context/ResponsiveContext';

export interface MobileOptimizationConfig {
  /** Minimum touch target size in pixels */
  minTouchTarget?: number;
  /** Enable pull-to-refresh behavior */
  enablePullToRefresh?: boolean;
  /** Debounce time for scroll events */
  scrollDebounce?: number;
  /** Enable swipe gestures */
  enableSwipeGestures?: boolean;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  duration: number;
}

/**
 * Hook to get mobile-optimized styles and behaviors
 */
export const useMobileOptimized = (config: MobileOptimizationConfig = {}) => {
  const {
    minTouchTarget = 44,
    enablePullToRefresh = false,
    scrollDebounce = 150,
    enableSwipeGestures = true,
  } = config;

  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const isPortrait = useIsPortrait();
  const screenSize = useScreenSize();

  // Touch target size based on screen size
  const touchTargetSize = isSmallMobile ? Math.max(minTouchTarget, 44) : minTouchTarget;

  // Calculate optimal font sizes
  const getFontSize = useCallback((baseSize: number) => {
    if (isSmallMobile) return Math.max(baseSize * 0.9, 14);
    if (isMobile) return baseSize * 0.95;
    return baseSize;
  }, [isSmallMobile, isMobile]);

  // Calculate optimal spacing
  const getSpacing = useCallback((baseSpacing: number) => {
    if (isSmallMobile) return Math.max(baseSpacing * 0.8, 8);
    if (isMobile) return baseSpacing * 0.9;
    return baseSpacing;
  }, [isSmallMobile, isMobile]);

  // Swipe gesture detection
  const [swipeGesture, setSwipeGesture] = useState<SwipeGesture | null>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!enableSwipeGestures) return;

    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const duration = Date.now() - touchStartTime.current;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Minimum swipe distance (50px)
    if (absDeltaX < 50 && absDeltaY < 50) return;

    // Determine direction
    let direction: 'left' | 'right' | 'up' | 'down';
    let distance: number;

    if (absDeltaX > absDeltaY) {
      direction = deltaX > 0 ? 'right' : 'left';
      distance = absDeltaX;
    } else {
      direction = deltaY > 0 ? 'down' : 'up';
      distance = absDeltaY;
    }

    setSwipeGesture({ direction, distance, duration });
  }, [enableSwipeGestures]);

  // Debounced scroll handler
  const handleScroll = useCallback((callback: () => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, scrollDebounce);
    };
  }, [scrollDebounce]);

  // Mobile-specific CSS classes
  const mobileClasses = {
    touchTarget: `min-h-[${touchTargetSize}px] min-w-[${touchTargetSize}px]`,
    safeArea: 'safe-area-inset-top safe-area-inset-bottom safe-area-inset-left safe-area-inset-right',
    noSelect: isMobile ? 'select-none' : '',
    smoothScroll: isMobile ? 'overflow-y-auto overflow-x-hidden' : '',
  };

  return {
    isMobile,
    isSmallMobile,
    isPortrait,
    screenSize,
    touchTargetSize,
    getFontSize,
    getSpacing,
    swipeGesture,
    handleTouchStart,
    handleTouchEnd,
    handleScroll,
    mobileClasses,
    // Mobile-specific recommendations
    recommendations: {
      useBottomNavigation: isMobile,
      useLargerTouchTargets: isMobile,
      minimizeText: isSmallMobile,
      useSingleColumn: isMobile,
      avoidHoverStates: isMobile,
    },
  };
};

/**
 * Hook for mobile-optimized list rendering
 */
export const useMobileList = <T>(items: T[], options: { itemHeight?: number; overscan?: number } = {}) => {
  const { itemHeight = 60, overscan = 3 } = options;
  const isMobile = useIsMobile();
  const [visibleStart, setVisibleStart] = useState(0);
  const [visibleEnd, setVisibleEnd] = useState(Math.min(20, items.length));
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;

    const scrollTop = containerRef.current.scrollTop;
    const containerHeight = containerRef.current.clientHeight;

    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const end = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    setVisibleStart(start);
    setVisibleEnd(end);
  }, [itemHeight, overscan, items.length]);

  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    isVirtualized: isMobile && items.length > 20,
  };
};

export default useMobileOptimized;