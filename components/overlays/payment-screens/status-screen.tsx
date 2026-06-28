'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import { addTransaction, getUserAccount, updateCashBalance, searchUserByCashtag } from '@/lib/firestore-service';
import { Timestamp } from 'firebase/firestore';

// Module-level set survives StrictMode unmount/remount — prevents double Firestore writes
const _savedKeys = new Set<string>();

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
  const { userId, isAdmin, authData } = useAuth();
  const { addToast } = useToast();
  const txKey = useRef(`${userId}|${transactionType}|${recipient}|${amount}|${Date.now()}`);

  // Save transaction to Firestore (and deduct balance for payments)
  useEffect(() => {
    // Deduplicate across StrictMode double-invocation using a stable key
    if (_savedKeys.has(txKey.current)) return;
    _savedKeys.add(txKey.current);
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

                // Add incoming transaction record on recipient side.
                // `recipient` stores the SENDER's cashtag so the receiver's
                // activity page can show "Payment from $sender" correctly.
                const senderCashtag = authData.cashtag || cleanRecipient;
                await addTransaction(recipientUser.uid, {
                  uid: recipientUser.uid,
                  type: 'payment-received',
                  amount: parsedAmount,
                  recipient: senderCashtag,  // who sent the money (displayed as "from")
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

  // Format the amount with commas, scaled to fit
  const parsedAmt = parseFloat(amount) || 0;
  const formattedAmt = `$${parsedAmt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const message =
    transactionType === 'Pay'
      ? `Sent! $${parsedAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} will be deposited once ${recipient} accepts this payment.`
      : `Requested! $${parsedAmt.toLocaleString('en-US', { minimumFractionDigits: 2 })} payment request sent to ${recipient}.`;

  return (
    <div className="flex flex-col w-full h-full bg-white">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center pb-20">
        {/* Green Checkmark Circle */}
        <div className="w-20 h-20 bg-[#00D632] text-white rounded-full flex items-center justify-center text-5xl font-bold mb-6 flex-shrink-0">
          ✓
        </div>
        {/* Amount — scales down to fit using fluid text size */}
        <div
          className="font-black text-[#111111] mb-2 w-full text-center leading-none tabular-nums"
          style={{
            fontSize: `clamp(1.5rem, ${Math.max(1.5, 9 - formattedAmt.length * 0.45)}vw + 1rem, 4rem)`,
            wordBreak: 'break-all',
          }}
        >
          {formattedAmt}
        </div>
        {/* Label */}
        <p className="text-base text-[#8E8E93] mb-2">
          {transactionType === 'Pay' ? `Payment to` : `Requested from`} <span className="font-bold text-[#111111]">${recipient.replace(/^\$/, '')}</span>
        </p>
        {/* Message */}
        <div className="text-sm text-[#8E8E93] mb-12 leading-relaxed max-w-xs">
          {message}
        </div>
        {/* Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-3">
          <button
            onClick={onClose}
            className="w-full h-14 bg-[#00D632] text-white rounded-full border-0 font-bold text-lg cursor-pointer hover:bg-[#00C428] active:bg-[#00B820]"
          >
            Done
          </button>
          <button
            onClick={onClose}
            className="w-full h-12 bg-transparent text-[#111111] rounded-full border border-[#E5E7EB] font-bold text-base cursor-pointer"
          >
            Web Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
