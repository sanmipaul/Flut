import React, { useState, useEffect } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { formatCurrency, formatPenaltyRate } from '../utils/AnalyticsUtils';
import { formatPenaltyDestination } from '../utils/EmergencyWithdrawalUtils';

interface EmergencyWithdrawalFormProps {
  vaultAmount: number;
  penaltyRate: number;
  penaltyDestination: string;
  onAmountChange: (amount: number) => void;
  onSubmit: (amount: number) => void;
  isLoading?: boolean;
  validationErrors?: string[];
  validationWarnings?: string[];
}

export const EmergencyWithdrawalForm: React.FC<EmergencyWithdrawalFormProps> = ({
  vaultAmount,
  penaltyRate,
  penaltyDestination,
  onAmountChange,
  onSubmit,
  isLoading = false,
  validationErrors = [],
  validationWarnings = [],
}) => {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  const numericAmount = parseFloat(amount) || 0;
  const penaltyAmount = numericAmount * penaltyRate;
  const netAmount = numericAmount - penaltyAmount;

  useEffect(() => {
    onAmountChange(numericAmount);
  }, [numericAmount, onAmountChange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount > 0 && numericAmount <= vaultAmount) {
      onSubmit(numericAmount);
    }
  };

  const maxAmount = vaultAmount;
  const amountPercentage = maxAmount > 0 ? (numericAmount / maxAmount) * 100 : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      {/* Warning Header */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Emergency Withdrawal</h3>
            <p className="text-sm text-red-700 mt-1">
              This action cannot be undone. A {formatPenaltyRate(penaltyRate)} penalty will be applied.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Withdrawal Amount (STX)
          </label>
          <div className="relative">
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              max={maxAmount}
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 text-sm">STX</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Available: {formatCurrency(vaultAmount)} STX
          </p>
        </div>

        {/* Amount Slider */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>0 STX</span>
            <span>{formatCurrency(maxAmount)} STX</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxAmount}
            step="0.01"
            value={numericAmount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-red"
            disabled={isLoading}
          />
          <div className="text-center text-sm text-gray-600 mt-1">
            {amountPercentage.toFixed(1)}% of vault
          </div>
        </div>

        {/* Calculation Display */}
        {numericAmount > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Requested Amount:</span>
              <span className="font-semibold">{formatCurrency(numericAmount)} STX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Penalty ({formatPenaltyRate(penaltyRate)}):</span>
              <span className="font-semibold text-red-600">-{formatCurrency(penaltyAmount)} STX</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-semibold">
              <span className="text-gray-900">You Receive:</span>
              <span className="text-green-600">{formatCurrency(netAmount)} STX</span>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <ul className="text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {validationWarnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <ul className="text-sm text-yellow-700 space-y-1">
              {validationWarnings.map((warning, index) => (
                <li key={index}>⚠ {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Details Toggle */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {showDetails ? 'Hide' : 'Show'} penalty details
        </button>

        {showDetails && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="mb-2">
              <strong>Penalty Rate:</strong> {formatPenaltyRate(penaltyRate)}
            </p>
            <p className="mb-2">
              <strong>Penalty Destination:</strong> {formatPenaltyDestination(penaltyDestination)}
            </p>
            <p>
              The penalty helps maintain the savings discipline of the vault system by discouraging early withdrawals.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || numericAmount <= 0 || numericAmount > vaultAmount || validationErrors.length > 0}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          {isLoading ? 'Processing...' : 'Execute Emergency Withdrawal'}
        </button>
      </form>
    </div>
  );
};

export default EmergencyWithdrawalForm;