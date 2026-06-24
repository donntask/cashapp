'use client';

import { useEffect } from 'react';

interface StatusScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  onClose: () => void;
}

export default function StatusScreen({
  amount,
  transactionType,
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
        recipient: 'Pending',
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
  }, [amount, transactionType]);

  const message =
    transactionType === 'Pay'
      ? `Sent! $${amount} will be deposited once transaction completes.`
      : `Requested! $${amount} payment request sent.`;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-10 text-center">
        <div className="w-18 h-18 bg-[#00D632] text-white rounded-full flex items-center justify-center text-4xl font-bold mb-6">
          ✓
        </div>
        <div className="text-2xl font-bold text-[#111111] mb-8 leading-snug">{message}</div>
        <button
          onClick={onClose}
          className="w-full max-w-[260px] h-12 bg-[#00D632] text-white rounded-full border-0 font-semibold text-base cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
