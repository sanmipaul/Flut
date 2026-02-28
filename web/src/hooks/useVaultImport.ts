/**
 * useVaultImport
 *
 * Hook that reads a File object chosen by the user, validates it as a
 * VaultExportData document, and applies the vault settings to localStorage.
 *
 * Usage:
 *   const { importFile, importState, importedData, importError } = useVaultImport();
 *   <input type="file" onChange={e => importFile(e.target.files?.[0])} />
 */
import { useState, useCallback } from 'react';
import { VaultExportData } from '../types/VaultExport';
import { parseVaultImport, applyImportedSettings } from '../utils/vaultExport';

export type ImportState = 'idle' | 'reading' | 'validating' | 'success' | 'error';

export interface UseVaultImportReturn {
  /** Pass a File object to begin the import pipeline */
  importFile: (file: File | undefined) => void;
  /** Current state of the import pipeline */
  importState: ImportState;
  /** The successfully parsed and validated export data */
  importedData: VaultExportData | null;
  /** Human-readable error message if importState === 'error' */
  importError: string;
  /** Number of vault settings restored in the last successful import */
  restoredCount: number;
  /** Reset state back to idle */
  reset: () => void;
}

export function useVaultImport(): UseVaultImportReturn {
  const [importState, setImportState] = useState<ImportState>('idle');
  const [importedData, setImportedData] = useState<VaultExportData | null>(null);
  const [importError, setImportError] = useState('');
  const [restoredCount, setRestoredCount] = useState(0);

  const importFile = useCallback((file: File | undefined) => {
    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setImportState('error');
      setImportError('Please select a .json backup file.');
      return;
    }

    setImportState('reading');
    setImportError('');
    setImportedData(null);

    const reader = new FileReader();

    reader.onload = () => {
      setImportState('validating');
      const raw = reader.result as string;
      const result = parseVaultImport(raw);

      if (!result.ok) {
        setImportState('error');
        setImportError(result.error);
        return;
      }

      const count = applyImportedSettings(result.data);
      setImportedData(result.data);
      setRestoredCount(count);
      setImportState('success');
    };

    reader.onerror = () => {
      setImportState('error');
      setImportError('Failed to read the selected file.');
    };

    reader.readAsText(file);
  }, []);

  const reset = useCallback(() => {
    setImportState('idle');
    setImportedData(null);
    setImportError('');
    setRestoredCount(0);
  }, []);

  return { importFile, importState, importedData, importError, restoredCount, reset };
}
