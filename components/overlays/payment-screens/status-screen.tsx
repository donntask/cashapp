'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { addTransaction, getUserAccount, updateCashBalance, searchUserByCashtag } from '@/lib/firestore-service';
import { Timestamp } from 'firebase/firestore';

interface StatusScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  recipient: string;
  note?: string;
  onClose: () => void;
}

export default function StatusScreen({
  amount,
  transactionType,
  recipient,
  note = '',
  onClose,
}: StatusScreenProps) {
  const { userId, isAdmin } = useAuth();
  const { addToast } = useToast();
  // Guard against React StrictMode double-invocation
  const hasSaved = useRef(false);

  // Save transaction to Firestore (and deduct balance for payments)
  useEffect(() => {
    if (hasSaved.current) return;
    hasSaved.current = true;
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
            note,
            timestamp: Timestamp.now(),
            status: 'completed',
          });

          // Deduct sender balance and credit receiver for Pay transactions
          if (transactionType === 'Pay') {
            // Debit sender (skip for admin — unlimited balance)
            if (!isAdmin) {
              const senderAccount = await getUserAccount(userId);
              if (senderAccount) {
                const newBalance = Math.max(0, (senderAccount.cashBalance || 0) - parsedAmount);
                await updateCashBalance(userId, newBalance);
              }
            }

            // Credit receiver in real-time by looking up their cashtag
            try {
              const recipientUser = await searchUserByCashtag(cleanRecipient);
              if (recipientUser && recipientUser.uid && recipientUser.uid !== userId) {
                const recipientAccount = await getUserAccount(recipientUser.uid);
                const currentBalance = recipientAccount?.cashBalance || 0;
                await updateCashBalance(recipientUser.uid, currentBalance + parsedAmount);

                // Add incoming transaction record on recipient side
                await addTransaction(recipientUser.uid, {
                  uid: recipientUser.uid,
                  type: 'payment-received',
                  amount: parsedAmount,
                  recipient: cleanRecipient,
                  note,
                  timestamp: Timestamp.now(),
                  status: 'completed',
                });
              }
            } catch (err) {
              // Non-fatal — sender debit succeeded; log but don't block UI
              console.error('[v0] Failed to credit recipient:', err);
            }
          }

          // Success toast
          if (transactionType === 'Pay') {
            addToast(`$${parsedAmount.toFixed(2)} sent to $${cleanRecipient}`, 'success');
          } else {
            addToast(`$${parsedAmount.toFixed(2)} requested from $${cleanRecipient}`, 'info');
          }
        } catch (error) {
          console.error('[v0] Failed to save transaction to Firestore:', error);
          addToast('Transaction failed. Please try again.', 'error');
        }
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
