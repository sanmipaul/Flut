import React, { useState } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';

interface CreateVaultFormData {
  unlockDate: string;
  beneficiary?: string;
  amount: number;
}

interface CreateVaultDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateVaultFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

export const CreateVaultDrawer: React.FC<CreateVaultDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState<CreateVaultFormData>({
    unlockDate: '',
    beneficiary: '',
    amount: 0,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.unlockDate) {
      errors.unlockDate = 'Unlock date is required';
    } else if (new Date(formData.unlockDate) <= new Date()) {
      errors.unlockDate = 'Unlock date must be in the future';
    }

    if (formData.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (formData.beneficiary && !/^[a-zA-Z0-9]+$/.test(formData.beneficiary)) {
      errors.beneficiary = 'Invalid beneficiary address';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({ unlockDate: '', beneficiary: '', amount: 0 });
      onClose();
    } catch (err) {
      console.error('Failed to create vault:', err);
      // If error message contains a known code, format it using helper
      let message = err instanceof Error ? err.message : String(err);
      const codeMatch = message.match(/(\d+)/);
      if (codeMatch) {
        const code = parseInt(codeMatch[1], 10);
        try {
          // import formatError dynamically to avoid circular deps
          const { formatError } = await import('../utils/VaultContractAPI');
          message = formatError(code);
        } catch {}
      }
      // propagate error text to parent if callback accepts it
      if (onSubmit) {
        // this component only displays through prop, so we rely on parent to catch updated error
      }
    }
  };

  if (!isOpen) return null;

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg max-h-96 overflow-y-auto animate-slide-up">
          <div className="sticky top-0 flex justify-between items-center p-4 border-b bg-white rounded-t-2xl">
            <h2 className="text-xl font-bold text-gray-900">Create New Vault</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
          </div>
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (STX)</label>
              <input type="number" step="0.000001" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoading} />
              {validationErrors.amount && <p className="text-red-600 text-xs mt-1">{validationErrors.amount}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unlock Date</label>
              <input type="datetime-local" value={formData.unlockDate} onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.unlockDate ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoading} />
              {validationErrors.unlockDate && <p className="text-red-600 text-xs mt-1">{validationErrors.unlockDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beneficiary (Optional)</label>
              <input type="text" value={formData.beneficiary} onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })} placeholder="Enter beneficiary address" className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.beneficiary ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoading} />
              {validationErrors.beneficiary && <p className="text-red-600 text-xs mt-1">{validationErrors.beneficiary}</p>}
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition">Cancel</button>
              <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition">{isLoading ? 'Creating...' : 'Create Vault'}</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Create New Vault</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">×</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-4 bg-red-100 border border-red-400 text-red-800 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (STX)</label>
            <input type="number" step="0.000001" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.amount ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoading} />
            {validationErrors.amount && <p className="text-red-600 text-sm mt-1">{validationErrors.amount}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Unlock Date</label>
            <input type="datetime-local" value={formData.unlockDate} onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.unlockDate ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoading} />
            {validationErrors.unlockDate && <p className="text-red-600 text-sm mt-1">{validationErrors.unlockDate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary (Optional)</label>
            <input type="text" value={formData.beneficiary} onChange={(e) => setFormData({ ...formData, beneficiary: e.target.value })} placeholder="Enter beneficiary address" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${validationErrors.beneficiary ? 'border-red-500' : 'border-gray-300'}`} disabled={isLoading} />
            {validationErrors.beneficiary && <p className="text-red-600 text-sm mt-1">{validationErrors.beneficiary}</p>}
          </div>
          <div className="flex gap-3 pt-6 border-t">
            <button type="button" onClick={onClose} disabled={isLoading} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:bg-gray-200 disabled:cursor-not-allowed transition">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition">{isLoading ? 'Creating...' : 'Create Vault'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateVaultDrawer;
