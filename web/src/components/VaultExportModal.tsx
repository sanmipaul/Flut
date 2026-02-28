/**
 * VaultExportModal
 *
 * Shows the user a summary of what will be included in the export
 * (vault count, settings included) and provides a "Download Backup"
 * button to trigger the JSON download.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useVaultExport } from '../hooks/useVaultExport';
import { VaultSnapshot, serializeVaultExport, serializeToJson } from '../utils/vaultExport';

export interface VaultExportModalProps {
  isOpen: boolean;
  vaults: VaultSnapshot[];
  onClose: () => void;
}

const VaultExportModal: React.FC<VaultExportModalProps> = ({ isOpen, vaults, onClose }) => {
  const { exportVaults, isExporting, exportError } = useVaultExport(vaults);
  const [showPreview, setShowPreview] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleDownload = useCallback(() => {
    exportVaults();
  }, [exportVaults]);

  if (!isOpen) return null;

  const activeVaults = vaults.filter((v) => !v.isWithdrawn);
  const withdrawnVaults = vaults.filter((v) => v.isWithdrawn);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-modal-title">
      <div className="modal-content export-modal">
        <div className="modal-header">
          <h2 id="export-modal-title">Export Vault Backup</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close export modal"
          >
            ✕
          </button>
        </div>

        <div className="export-modal__body">
          <p className="export-modal__description">
            Your vault data and personal settings will be saved to a{' '}
            <code>flut-vault-backup.json</code> file. You can use this file to
            restore your settings on another device or after clearing browser storage.
          </p>

          <div className="export-summary">
            <h3 className="export-summary__title">Backup Contents</h3>
            <table className="export-summary__table" aria-label="Backup summary">
              <tbody>
                <tr>
                  <td className="export-summary__label">Total Vaults</td>
                  <td className="export-summary__value">{vaults.length}</td>
                </tr>
                <tr>
                  <td className="export-summary__label">Active Vaults</td>
                  <td className="export-summary__value">{activeVaults.length}</td>
                </tr>
                <tr>
                  <td className="export-summary__label">Withdrawn Vaults</td>
                  <td className="export-summary__value">{withdrawnVaults.length}</td>
                </tr>
                <tr>
                  <td className="export-summary__label">Settings Included</td>
                  <td className="export-summary__value export-summary__value--yes">✓ Yes</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="export-modal__note">
            <strong>Note:</strong> This backup does not include your private keys or
            wallet credentials. On-chain funds remain in your Stacks wallet.
          </div>

          <div className="export-modal__preview-toggle">
            <button
              type="button"
              className="btn-ghost btn-small"
              onClick={() => setShowPreview((p) => !p)}
              aria-expanded={showPreview}
            >
              {showPreview ? 'Hide' : 'Preview'} JSON
            </button>
          </div>

          {showPreview && (
            <pre className="export-modal__json-preview" aria-label="JSON preview">
              {serializeToJson(serializeVaultExport(vaults)).slice(0, 400)}
              {vaults.length > 0 ? '\n…' : ''}
            </pre>
          )}

          {exportError && (
            <div className="export-modal__error" role="alert">
              {exportError}
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleDownload}
            disabled={isExporting || vaults.length === 0}
          >
            {isExporting ? 'Preparing…' : '↓ Download Backup'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultExportModal;
