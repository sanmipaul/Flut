import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ResponsiveBreakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isSmallMobile: boolean;
  width: number;
  height: number;
  screenSize: 'mobile' | 'smallMobile' | 'tablet' | 'desktop' | 'largeDesktop';
  isPortrait: boolean;
  isLandscape: boolean;
}

interface ResponsiveContextType {
  breakpoint: ResponsiveBreakpoint;
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(
  undefined
);

const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
  largeDesktop: 1280,
};

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [breakpoint, setBreakpoint] = useState<ResponsiveBreakpoint>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isPortrait = width < height;
    return {
      isMobile: width < BREAKPOINTS.mobile,
      isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
      isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeDesktop,
      isLargeDesktop: width >= BREAKPOINTS.largeDesktop,
      isSmallMobile: width < 375,
      width,
      height,
      screenSize: width < 375
        ? 'smallMobile'
        : width < BREAKPOINTS.mobile
          ? 'mobile'
          : width < BREAKPOINTS.tablet
            ? 'tablet'
            : width < BREAKPOINTS.largeDesktop
              ? 'desktop'
              : 'largeDesktop',
      isPortrait,
      isLandscape: !isPortrait,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isPortrait = width < height;

      setBreakpoint({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.largeDesktop,
        isLargeDesktop: width >= BREAKPOINTS.largeDesktop,
        isSmallMobile: width < 375,
        width,
        height,
        screenSize: width < 375
          ? 'smallMobile'
          : width < BREAKPOINTS.mobile
            ? 'mobile'
            : width < BREAKPOINTS.tablet
              ? 'tablet'
              : width < BREAKPOINTS.largeDesktop
                ? 'desktop'
                : 'largeDesktop',
        isPortrait,
        isLandscape: !isPortrait,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ResponsiveContext.Provider value={{ breakpoint }}>
      {children}
    </ResponsiveContext.Provider>
  );
};

/**
 * Hook to access responsive breakpoint information
 */
export const useResponsive = (): ResponsiveBreakpoint => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context.breakpoint;
};

/**
 * Hook to check if screen is mobile
 */
export const useIsMobile = (): boolean => {
  const { isMobile } = useResponsive();
  return isMobile;
};

/**
 * Hook to check if screen is tablet
 */
export const useIsTablet = (): boolean => {
  const { isTablet } = useResponsive();
  return isTablet;
};

/**
 * Hook to check if screen is desktop (not large desktop)
 */
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

/**
 * Hook to check if screen is large desktop
 */
export const useIsLargeDesktop = (): boolean => {
  const { isLargeDesktop } = useResponsive();
  return isLargeDesktop;
};

/**
 * Hook to check if screen is small mobile (< 375px)
 */
export const useIsSmallMobile = (): boolean => {
  const { isSmallMobile } = useResponsive();
  return isSmallMobile;
};

/**
 * Hook to check if device is in portrait mode
 */
export const useIsPortrait = (): boolean => {
  const { isPortrait } = useResponsive();
  return isPortrait;
};

/**
 * Hook to check if device is in landscape mode
 */
export const useIsLandscape = (): boolean => {
  const { isLandscape } = useResponsive();
  return isLandscape;
};

/**
 * Hook to get current screen size
 */
export const useScreenSize = (): 'mobile' | 'smallMobile' | 'tablet' | 'desktop' | 'largeDesktop' => {
  const { screenSize } = useResponsive();
  return screenSize;
};
