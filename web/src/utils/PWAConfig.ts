/**
 * PWA Meta Tags Configuration
 * Applies necessary meta tags for PWA functionality and mobile optimization
 */

export interface PWAConfig {
  appName: string;
  appDescription: string;
  appVersion: string;
  themeColor: string;
  backgroundColor: string;
  startUrl: string;
}

const DEFAULT_PWA_CONFIG: PWAConfig = {
  appName: 'Flut',
  appDescription: 'Secure vault management on Stacks blockchain',
  appVersion: '1.0.0',
  themeColor: '#1e40af',
  backgroundColor: '#ffffff',
  startUrl: '/',
};

/**
 * Apply PWA meta tags to document head
 */
export const applyPWAMetaTags = (config: Partial<PWAConfig> = {}): void => {
  const fullConfig = { ...DEFAULT_PWA_CONFIG, ...config };

  const metaTags: Array<{ name?: string; property?: string; content: string }> = [
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' },
    { name: 'description', content: fullConfig.appDescription },
    { name: 'theme-color', content: fullConfig.themeColor },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: fullConfig.appName },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'msapplication-TileColor', content: fullConfig.themeColor },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: fullConfig.appName },
    { property: 'og:description', content: fullConfig.appDescription },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullConfig.appName },
  ];

  metaTags.forEach((tag) => {
    const meta = document.createElement('meta');
    if (tag.name) meta.name = tag.name;
    if (tag.property) meta.setAttribute('property', tag.property);
    meta.content = tag.content;
    document.head.appendChild(meta);
  });

  let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
  if (!manifestLink) {
    manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);
  }

  console.log('PWA meta tags applied successfully');
};

/**
 * Check if running as PWA/standalone app
 */
export const isRunningAsPWA = (): boolean => {
  if (window.navigator.standalone === true) {
    return true;
  }
  if ('mediaDevices' in navigator) {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    return mediaQuery.matches;
  }
  return false;
};

/**
 * Get PWA installation status
 */
export const getPWAStatus = (): {
  isPWA: boolean;
  isInstallable: boolean;
  hasNotificationSupport: boolean;
  hasServiceWorker: boolean;
} => {
  return {
    isPWA: isRunningAsPWA(),
    isInstallable: 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window,
    hasNotificationSupport: 'Notification' in window,
    hasServiceWorker: 'serviceWorker' in navigator,
  };
};

/**
 * Request app fullscreen on supported browsers
 */
export const requestFullscreen = async (): Promise<void> => {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    } else if ((document.documentElement as any).webkitRequestFullscreen) {
      (document.documentElement as any).webkitRequestFullscreen();
    }
  } catch (error) {
    console.error('Failed to request fullscreen:', error);
  }
};

export default {
  applyPWAMetaTags,
  isRunningAsPWA,
  getPWAStatus,
  requestFullscreen,
};
