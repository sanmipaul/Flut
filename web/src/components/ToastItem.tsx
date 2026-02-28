/**
 * ToastItem
 *
 * Renders a single toast notification card. Handles:
 *   - variant styling (success / error / warning / info)
 *   - entry and exit animations via CSS classes
 *   - a progress bar that drains over the toast's duration
 *   - accessible role and aria-live attributes
 *   - manual dismiss via close button
 */
import React, { useEffect, useRef } from 'react';
import type { Toast } from '../types/Toast';
import { TOAST_ICON, TOAST_ROLE } from '../types/Toast';

export interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const progressRef = useRef<HTMLDivElement>(null);

  // Animate the progress bar draining over `duration` ms
  useEffect(() => {
    if (!progressRef.current || toast.duration === 0) return;

    const bar = progressRef.current;
    // Force reflow to start animation from 100%
    bar.style.transition = 'none';
    bar.style.width = '100%';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    bar.offsetWidth; // trigger reflow
    bar.style.transition = `width ${toast.duration}ms linear`;
    bar.style.width = '0%';
  }, [toast.id, toast.duration]);

  const role = TOAST_ROLE[toast.variant];
  const icon = TOAST_ICON[toast.variant];

  return (
    <div
      className={`toast toast--${toast.variant} ${toast.dismissing ? 'toast--exit' : 'toast--enter'}`}
      role={role}
      aria-live={role === 'alert' ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="toast__content">
        <span className="toast__icon" aria-hidden="true">{icon}</span>

        <div className="toast__body">
          <p className="toast__message">{toast.message}</p>
          {toast.description && (
            <p className="toast__description">{toast.description}</p>
          )}
        </div>

        <button
          type="button"
          className="toast__close"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
        >
          ×
        </button>
      </div>

      {toast.duration > 0 && (
        <div className="toast__progress-track" aria-hidden="true">
          <div ref={progressRef} className="toast__progress-bar" />
        </div>
      )}
    </div>
  );
};

export default ToastItem;
