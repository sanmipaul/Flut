import React, { useState } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { EmergencyWithdrawalConfig } from '../types/EmergencyWithdrawal';
import { formatPenaltyRate, formatPenaltyDestination } from '../utils/EmergencyWithdrawalUtils';

interface EmergencyWithdrawalSettingsProps {
  config: EmergencyWithdrawalConfig;
  onConfigUpdate: (config: Partial<EmergencyWithdrawalConfig>) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
}

export const EmergencyWithdrawalSettings: React.FC<EmergencyWithdrawalSettingsProps> = ({
  config,
  onConfigUpdate,
  isAdmin = false,
  isLoading = false,
}) => {
  const isMobile = useIsMobile();
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  const handleConfigChange = (field: keyof EmergencyWithdrawalConfig, value: any) => {
    setLocalConfig((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onConfigUpdate(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Emergency Withdrawal Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure penalty rates and system parameters for emergency withdrawals.
        </p>
      </div>

      <div className="space-y-6">
        {/* Global Enable/Disable */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Emergency Withdrawals Enabled</h3>
            <p className="text-sm text-gray-600">
              Allow users to perform emergency withdrawals with penalties
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localConfig.enabled}
              onChange={(e) => handleConfigChange('enabled', e.target.checked)}
              disabled={!isAdmin || isLoading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Penalty Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Penalty Rate ({formatPenaltyRate(localConfig.penaltyRate)})
          </label>
          <input
            type="range"
            min="0.01"
            max="0.50"
            step="0.01"
            value={localConfig.penaltyRate}
            onChange={(e) => handleConfigChange('penaltyRate', parseFloat(e.target.value))}
            disabled={!isAdmin || isLoading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red disabled:cursor-not-allowed"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Penalty Limits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Penalty (STX)
            </label>
            <input
              type="number"
              value={localConfig.minPenaltyAmount}
              onChange={(e) => handleConfigChange('minPenaltyAmount', parseFloat(e.target.value) || 0)}
              disabled={!isAdmin || isLoading}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Penalty (STX)
            </label>
            <input
              type="number"
              value={localConfig.maxPenaltyAmount}
              onChange={(e) => handleConfigChange('maxPenaltyAmount', parseFloat(e.target.value) || 0)}
              disabled={!isAdmin || isLoading}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>
        </div>

        {/* Penalty Destination (Admin Only) */}
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Penalty Destination Address
            </label>
            <input
              type="text"
              value={localConfig.penaltyDestination}
              onChange={(e) => handleConfigChange('penaltyDestination', e.target.value)}
              disabled={isLoading}
              placeholder="STX address for penalty funds"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current: {formatPenaltyDestination(localConfig.penaltyDestination)}
            </p>
          </div>
        )}

        {/* Settings Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Current Settings Summary</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Status:</strong> {localConfig.enabled ? 'Enabled' : 'Disabled'}</p>
            <p><strong>Penalty Rate:</strong> {formatPenaltyRate(localConfig.penaltyRate)}</p>
            <p><strong>Penalty Range:</strong> {localConfig.minPenaltyAmount} - {localConfig.maxPenaltyAmount} STX</p>
            {isAdmin && (
              <p><strong>Destination:</strong> {formatPenaltyDestination(localConfig.penaltyDestination)}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isAdmin && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              disabled={!hasChanges || isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyWithdrawalSettings;