import React, { useState } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { formatPenaltyRate } from '../utils/EmergencyWithdrawalUtils';

interface EmergencyWithdrawalWarningProps {
  penaltyRate: number;
  penaltyDestination: string;
  onDismiss?: () => void;
  className?: string;
}

export const EmergencyWithdrawalWarning: React.FC<EmergencyWithdrawalWarningProps> = ({
  penaltyRate,
  penaltyDestination,
  onDismiss,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Emergency Withdrawal Available
          </h3>
          <div className="mt-1 text-sm text-red-700">
            <p>
              You can withdraw funds before the lock period expires, but a{' '}
              <strong>{formatPenaltyRate(penaltyRate)}</strong> penalty will apply.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-red-800 hover:text-red-900 font-medium underline"
            >
              {isExpanded ? 'Hide details' : 'Learn more'}
            </button>
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Dismiss
              </button>
            )}
          </div>

          {isExpanded && (
            <div className="mt-3 bg-red-100 rounded-lg p-3 text-sm text-red-800">
              <h4 className="font-semibold mb-2">Important Information:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>The penalty helps maintain savings discipline</li>
                <li>Penalty funds go to: <code className="bg-red-200 px-1 rounded text-xs">{penaltyDestination}</code></li>
                <li>This action permanently closes your vault</li>
                <li>You cannot reverse emergency withdrawals</li>
                <li>Consider all options before proceeding</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmergencyWithdrawalWarning;