import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ResponsiveBreakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  screenSize: 'mobile' | 'tablet' | 'desktop';
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
};

export const ResponsiveProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [breakpoint, setBreakpoint] = useState<ResponsiveBreakpoint>(() => ({
    isMobile: window.innerWidth < BREAKPOINTS.mobile,
    isTablet:
      window.innerWidth >= BREAKPOINTS.mobile &&
      window.innerWidth < BREAKPOINTS.tablet,
    isDesktop: window.innerWidth >= BREAKPOINTS.tablet,
    width: window.innerWidth,
    height: window.innerHeight,
    screenSize:
      window.innerWidth < BREAKPOINTS.mobile
        ? 'mobile'
        : window.innerWidth < BREAKPOINTS.tablet
          ? 'tablet'
          : 'desktop',
  }));

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setBreakpoint({
        isMobile: width < BREAKPOINTS.mobile,
        isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
        isDesktop: width >= BREAKPOINTS.tablet,
        width,
        height,
        screenSize:
          width < BREAKPOINTS.mobile
            ? 'mobile'
            : width < BREAKPOINTS.tablet
              ? 'tablet'
              : 'desktop',
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
 * Hook to check if screen is desktop
 */
export const useIsDesktop = (): boolean => {
  const { isDesktop } = useResponsive();
  return isDesktop;
};

/**
 * Hook to get current screen size
 */
export const useScreenSize = (): 'mobile' | 'tablet' | 'desktop' => {
  const { screenSize } = useResponsive();
  return screenSize;
};
