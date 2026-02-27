/**
 * Push Notification Utility
 * Handles scheduling notifications for vault unlock events
 */

export interface NotificationSchedule {
  vaultId: string;
  vaultName: string;
  unlockDate: string;
  timeoutId?: NodeJS.Timeout;
}

const scheduledNotifications = new Map<string, NotificationSchedule>();

/**
 * Request notification permission from user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  return false;
};

/**
 * Schedule a notification for vault unlock
 */
export const scheduleVaultUnlockNotification = (
  vaultId: string,
  vaultName: string,
  unlockDate: string
): void => {
  try {
    const unlockTime = new Date(unlockDate).getTime();
    const currentTime = Date.now();
    const delay = unlockTime - currentTime;

    // Clear any existing scheduled notification for this vault
    if (scheduledNotifications.has(vaultId)) {
      clearVaultNotification(vaultId);
    }

    if (delay > 0) {
      console.log(
        `Scheduling notification for vault ${vaultId} at ${unlockDate}`
      );

      const timeoutId = setTimeout(() => {
        showVaultUnlockNotification(vaultId, vaultName);
      }, delay);

      const notification: NotificationSchedule = {
        vaultId,
        vaultName,
        unlockDate,
        timeoutId,
      };

      scheduledNotifications.set(vaultId, notification);

      // Also notify service worker
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          vaultId,
          unlockDate,
          vaultName,
        });
      }
    } else {
      console.log(`Unlock date ${unlockDate} is in the past, skipping notification`);
    }
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
};

/**
 * Show immediate notification for vault unlock
 */
export const showVaultUnlockNotification = (
  vaultId: string,
  vaultName: string
): void => {
  try {
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    // Show desktop notification
    const notification = new Notification('Flut - Vault Unlocked!', {
      body: `Your vault "${vaultName}" is now ready to withdraw.`,
      icon: '/pwa-192x192.png',
      badge: '/badge-icon.png',
      tag: `vault-unlock-${vaultId}`,
      requireInteraction: true,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      // You can dispatch an event or navigate to the vault
      window.dispatchEvent(
        new CustomEvent('vault-unlock', {
          detail: { vaultId, vaultName },
        })
      );
    };

    console.log(`Shown notification for vault ${vaultId}`);
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
};

/**
 * Clear scheduled notification for a vault
 */
export const clearVaultNotification = (vaultId: string): void => {
  try {
    const scheduled = scheduledNotifications.get(vaultId);
    if (scheduled && scheduled.timeoutId) {
      clearTimeout(scheduled.timeoutId);
      scheduledNotifications.delete(vaultId);
      console.log(`Cleared notification for vault ${vaultId}`);
    }
  } catch (error) {
    console.error('Failed to clear notification:', error);
  }
};

/**
 * Clear all scheduled notifications
 */
export const clearAllNotifications = (): void => {
  try {
    scheduledNotifications.forEach((_, vaultId) => {
      clearVaultNotification(vaultId);
    });
    console.log('Cleared all scheduled notifications');
  } catch (error) {
    console.error('Failed to clear all notifications:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = (): NotificationSchedule[] => {
  return Array.from(scheduledNotifications.values());
};

/**
 * Update notification for vault
 */
export const updateVaultNotification = (
  vaultId: string,
  vaultName: string,
  unlockDate: string
): void => {
  clearVaultNotification(vaultId);
  scheduleVaultUnlockNotification(vaultId, vaultName, unlockDate);
};

/**
 * Check if notification is scheduled for vault
 */
export const isNotificationScheduled = (vaultId: string): boolean => {
  return scheduledNotifications.has(vaultId);
};

/**
 * Get time until notification fires
 */
export const getTimeUntilNotification = (vaultId: string): number | null => {
  try {
    const scheduled = scheduledNotifications.get(vaultId);
    if (!scheduled) return null;

    const unlockTime = new Date(scheduled.unlockDate).getTime();
    const currentTime = Date.now();
    const delay = unlockTime - currentTime;

    return delay > 0 ? delay : null;
  } catch (error) {
    console.error('Failed to get time until notification:', error);
    return null;
  }
};

/**
 * Initialize push notifications on app load
 */
export const initializePushNotifications = async (): Promise<void> => {
  try {
    // Request permission if not already granted
    const hasPermission = await requestNotificationPermission();
    console.log('Push notification permission:', hasPermission ? 'granted' : 'denied');

    // Register service worker for background notifications
    if ('serviceWorker' in navigator) {
      try {
        await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered for notifications');
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    }
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
};

/**
 * Show a test notification (for development/testing)
 */
export const showTestNotification = (): void => {
  if (Notification.permission !== 'granted') {
    console.error('Notification permission not granted');
    return;
  }

  const notification = new Notification('Flut - Test Notification', {
    body: 'This is a test notification from the Flut app.',
    icon: '/pwa-192x192.png',
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  console.log('Test notification shown');
};
