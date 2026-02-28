/**
 * VaultImportModal
 *
 * Allows the user to select or drag-and-drop a vault backup JSON file.
 * Validates the file, displays a summary of what will be restored, and
 * applies settings to localStorage on confirmation.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useVaultImport } from '../hooks/useVaultImport';

export interface VaultImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after a successful import so the parent can refresh vault state */
  onImportComplete?: () => void;
}

const VaultImportModal: React.FC<VaultImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { importFile, importState, importedData, importError, restoredCount, reset } =
    useVaultImport();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      importFile(e.target.files?.[0]);
    },
    [importFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      importFile(e.dataTransfer.files?.[0]);
    },
    [importFile]
  );

  const handleConfirm = useCallback(() => {
    onImportComplete?.();
    handleClose();
  }, [onImportComplete, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="import-modal-title">
      <div className="modal-content import-modal">
        <div className="modal-header">
          <h2 id="import-modal-title">Import Vault Backup</h2>
          <button className="modal-close-btn" onClick={handleClose} aria-label="Close import modal">
            ✕
          </button>
        </div>

        <div className="import-modal__body">
          {importState === 'idle' || importState === 'error' ? (
            <>
              <div
                className={`drop-zone ${isDragOver ? 'drop-zone--active' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Drop zone: drag and drop a backup file or click to select"
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
              >
                <span className="drop-zone__icon" aria-hidden="true">📂</span>
                <p className="drop-zone__label">
                  {isDragOver ? 'Release to import' : 'Drop your backup file here, or click to browse'}
                </p>
                <p className="drop-zone__hint">Accepts .json files from Flut</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  className="drop-zone__input"
                  aria-hidden="true"
                  tabIndex={-1}
                  onChange={handleFileChange}
                />
              </div>

              {importState === 'error' && (
                <div className="import-modal__error" role="alert">
                  <strong>Import failed:</strong> {importError}
                </div>
              )}
            </>
          ) : importState === 'reading' || importState === 'validating' ? (
            <div className="import-modal__loading" aria-live="polite">
              <span className="import-modal__spinner" aria-hidden="true">⏳</span>
              <p>{importState === 'reading' ? 'Reading file…' : 'Validating backup…'}</p>
            </div>
          ) : importState === 'success' && importedData ? (
            <div className="import-modal__success">
              <p className="import-modal__success-msg" role="status">
                ✓ Backup validated successfully
              </p>
              <div className="export-summary">
                <h3 className="export-summary__title">What will be restored</h3>
                <table className="export-summary__table" aria-label="Import summary">
                  <tbody>
                    <tr>
                      <td className="export-summary__label">Vaults in backup</td>
                      <td className="export-summary__value">{importedData.vaults.length}</td>
                    </tr>
                    <tr>
                      <td className="export-summary__label">Settings to restore</td>
                      <td className="export-summary__value">{restoredCount}</td>
                    </tr>
                    <tr>
                      <td className="export-summary__label">Backup date</td>
                      <td className="export-summary__value">
                        {new Date(importedData.exportedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="import-modal__note">
                Vault settings (nicknames, notes, colour tags) have been restored.
                On-chain data is not affected.
              </p>
            </div>
          ) : null}
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={handleClose}>
            {importState === 'success' ? 'Done' : 'Cancel'}
          </button>
          {importState === 'success' && (
            <button className="btn-primary" onClick={handleConfirm}>
              Apply &amp; Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultImportModal;
