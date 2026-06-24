'use client';

import { useEffect } from 'react';

interface StatusScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  recipient: string;
  onClose: () => void;
}

export default function StatusScreen({
  amount,
  transactionType,
  recipient,
  onClose,
}: StatusScreenProps) {
  // Save transaction to localStorage on mount
  useEffect(() => {
    try {
      const appData = localStorage.getItem('bushfi_app_data');
      let data = appData ? JSON.parse(appData) : { transactions: [], cashBalance: 0, savingsBalance: 0, user: null, bankAccount: null, lastUpdated: Date.now() };
      
      const transaction = {
        id: `tx_${Date.now()}`,
        type: transactionType.toLowerCase(),
        amount: parseFloat(amount),
        recipient: recipient || 'Unknown',
        note: '',
        timestamp: Date.now(),
        status: 'completed',
      };

      if (!data.transactions) {
        data.transactions = [];
      }
      data.transactions.push(transaction);
      data.lastUpdated = Date.now();
      
      localStorage.setItem('bushfi_app_data', JSON.stringify(data));
    } catch (error) {
      console.error('[v0] Failed to save transaction:', error);
    }
  }, [amount, transactionType, recipient]);

  const message =
    transactionType === 'Pay'
      ? `Sent! $${amount} will be deposited once ${recipient} accepts this payment.`
      : `Requested! $${amount} payment request sent to ${recipient}.`;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-20">
        {/* Green Checkmark Circle */}
        <div className="w-20 h-20 bg-[#00D632] text-white rounded-full flex items-center justify-center text-5xl font-bold mb-8 flex-shrink-0">
          ✓
        </div>
        {/* Message */}
        <div className="text-lg text-[#111111] mb-16 leading-relaxed font-medium">
          {message}
        </div>
        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full max-w-xs h-14 bg-[#00D632] text-white rounded-full border-0 font-bold text-lg cursor-pointer flex-shrink-0 hover:bg-[#00C428] active:bg-[#00B820]"
        >
          Done
        </button>
      </div>
    </div>
  );
}
