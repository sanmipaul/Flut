import React, { useState } from 'react';
import { useIsMobile } from '../context/ResponsiveContext';
import { formatPenaltyRate } from '../utils/EmergencyWithdrawalUtils';

interface EmergencyWithdrawalHelpProps {
  penaltyRate: number;
  penaltyDestination: string;
  className?: string;
}

export const EmergencyWithdrawalHelp: React.FC<EmergencyWithdrawalHelpProps> = ({
  penaltyRate,
  penaltyDestination,
  className = '',
}) => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const faqs = [
    {
      id: 'what-is',
      question: 'What is an Emergency Withdrawal?',
      answer: 'An emergency withdrawal allows you to access your locked STX funds before the scheduled unlock date. A penalty fee is applied to maintain the savings discipline of the vault system.',
    },
    {
      id: 'when-use',
      question: 'When should I use Emergency Withdrawal?',
      answer: 'Use emergency withdrawal only for genuine financial emergencies. The penalty helps ensure you think carefully before breaking your savings commitment.',
    },
    {
      id: 'penalty',
      question: `What's the penalty? (${formatPenaltyRate(penaltyRate)})`,
      answer: `You pay a ${formatPenaltyRate(penaltyRate)} penalty on the withdrawal amount. For example, withdrawing 100 STX would cost you 10 STX in penalties, leaving you with 90 STX.`,
    },
    {
      id: 'penalty-goes',
      question: 'Where does the penalty go?',
      answer: `Penalty funds are sent to ${penaltyDestination}. This helps support the ecosystem and maintains the economic incentives of the vault system.`,
    },
    {
      id: 'permanent',
      question: 'Is emergency withdrawal permanent?',
      answer: 'Yes, emergency withdrawal permanently closes your vault. You cannot reverse this action or access any remaining funds after withdrawal.',
    },
    {
      id: 'alternatives',
      question: 'Are there alternatives to emergency withdrawal?',
      answer: 'Consider borrowing from friends/family, using credit cards, or other short-term financing options before using emergency withdrawal. The penalty is designed to make this a last resort.',
    },
    {
      id: 'tax-implications',
      question: 'Are there tax implications?',
      answer: 'Emergency withdrawals may have tax consequences depending on your jurisdiction. The penalty amount is typically not tax-deductible. Consult a tax professional for advice.',
    },
    {
      id: 'better-options',
      question: 'What are better options than emergency withdrawal?',
      answer: 'Consider creating multiple smaller vaults with different unlock dates, building an emergency fund outside the vault system, or negotiating extended terms with beneficiaries.',
    },
  ];

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Emergency Withdrawal Help</h2>
        <p className="text-sm text-gray-600 mt-1">
          Learn about emergency withdrawals and when to use them
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {faqs.map((faq) => (
          <div key={faq.id} className="p-6">
            <button
              onClick={() => toggleSection(faq.id)}
              className="w-full flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            >
              <span className="text-sm font-medium text-gray-900 pr-4">{faq.question}</span>
              <svg
                className={`flex-shrink-0 h-5 w-5 text-gray-500 transition-transform ${
                  activeSection === faq.id ? 'rotate-180' : ''
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {activeSection === faq.id && (
              <div className="mt-3 text-sm text-gray-700 leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Important Notice */}
      <div className="p-6 bg-yellow-50 border-t border-yellow-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Important</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Emergency withdrawals should be your absolute last resort. The penalty system is designed to protect your long-term financial goals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyWithdrawalHelp;