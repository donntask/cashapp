'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { addTransaction, getUserAccount, updateCashBalance } from '@/lib/firestore-service';
import { Timestamp } from 'firebase/firestore';

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
  const { userId, isAdmin } = useAuth();

  // Save transaction to Firestore (and deduct balance for payments)
  useEffect(() => {
    const saveTransaction = async () => {
      const cleanRecipient = (recipient || 'Unknown').replace(/^\$/, '').trim();
      const parsedAmount = parseFloat(amount);

      // Persist to Firestore if user is authenticated
      if (userId) {
        try {
          await addTransaction(userId, {
            uid: userId,
            type: transactionType === 'Pay' ? 'payment-sent' : 'payment-received',
            amount: parsedAmount,
            recipient: cleanRecipient,
            note: '',
            timestamp: Timestamp.now(),
            status: 'completed',
          });

          // Deduct balance for payments (not requests) and non-admins
          if (transactionType === 'Pay' && !isAdmin) {
            const account = await getUserAccount(userId);
            if (account) {
              const newBalance = Math.max(0, (account.cashBalance || 0) - parsedAmount);
              await updateCashBalance(userId, newBalance);
            }
          }
        } catch (error) {
          console.error('[v0] Failed to save transaction to Firestore:', error);
        }
      }

      // Also keep localStorage in sync for offline fallback
      try {
        const appData = localStorage.getItem('cashapp_app_data');
        const data = appData ? JSON.parse(appData) : { transactions: [], cashBalance: 0, savingsBalance: 0, user: null, bankAccount: null, lastUpdated: Date.now() };
        if (!data.transactions) data.transactions = [];
        data.transactions.push({
          id: `tx_${Date.now()}`,
          type: transactionType === 'Pay' ? 'payment-sent' : 'payment-received',
          amount: parsedAmount,
          recipient: cleanRecipient,
          note: '',
          timestamp: Date.now(),
          status: 'completed',
        });
        if (transactionType === 'Pay' && !isAdmin) {
          data.cashBalance = Math.max(0, (data.cashBalance || 0) - parsedAmount);
        }
        data.lastUpdated = Date.now();
        localStorage.setItem('cashapp_app_data', JSON.stringify(data));
      } catch (error) {
        console.error('[v0] Failed to save transaction to localStorage:', error);
      }
    };

    saveTransaction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
