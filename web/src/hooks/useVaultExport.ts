/**
 * useVaultExport
 *
 * Hook that serialises the current vault list into a downloadable JSON file
 * and triggers a browser download. Uses URL.createObjectURL for a clean,
 * no-dependency file download that works in all modern browsers.
 *
 * Usage:
 *   const { exportVaults, isExporting } = useVaultExport(vaults);
 *   <button onClick={exportVaults}>Download Backup</button>
 */
import { useState, useCallback } from 'react';
import { VaultSnapshot, serializeVaultExport, serializeToJson } from '../utils/vaultExport';
import { VAULT_EXPORT_MIME_TYPE, VAULT_EXPORT_FILENAME } from '../types/VaultExport';

export interface UseVaultExportReturn {
  /** Trigger a JSON file download of the current vault state */
  exportVaults: () => void;
  /** True while the export is being prepared */
  isExporting: boolean;
  /** The last error message, if any */
  exportError: string;
}

export function useVaultExport(vaults: VaultSnapshot[]): UseVaultExportReturn {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const exportVaults = useCallback(() => {
    setIsExporting(true);
    setExportError('');

    try {
      const data = serializeVaultExport(vaults);
      const json = serializeToJson(data);
      const blob = new Blob([json], { type: VAULT_EXPORT_MIME_TYPE });
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = VAULT_EXPORT_FILENAME;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to export vaults.');
    } finally {
      setIsExporting(false);
    }
  }, [vaults]);

  return { exportVaults, isExporting, exportError };
}
