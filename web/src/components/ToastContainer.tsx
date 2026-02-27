/**
 * ToastContainer
 *
 * Renders the list of active toasts in a fixed overlay region.
 * Uses ReactDOM.createPortal to mount outside the normal DOM tree,
 * ensuring toasts are never clipped by overflow:hidden ancestors.
 *
 * Props:
 *   position – where on screen to stack toasts (default: "top-right")
 */
import React from 'react';
import ReactDOM from 'react-dom';
import type { Toast, ToastPosition } from '../types/Toast';
import ToastItem from './ToastItem';

export interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
  position?: ToastPosition;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  position = 'top-right',
}) => {
  if (toasts.length === 0) return null;

  const container = (
    <div
      className={`toast-container toast-container--${position}`}
      aria-label="Notifications"
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );

  // Mount into document.body via a portal
  return ReactDOM.createPortal(container, document.body);
};

export default ToastContainer;
