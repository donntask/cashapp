'use client';

import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { getDb } from '@/lib/firebase-config';
import { Timestamp } from 'firebase/firestore';

interface ActivityPageProps {
  onOpenProfile: () => void;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  recipient: string;
  note: string;
  timestamp: Timestamp | number;
  status: string;
  senderCashtag?: string;
}

export default function ActivityPage({ onOpenProfile }: ActivityPageProps) {
  const { userId } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Real-time snapshot — no polling, no duplicates
  useEffect(() => {
    if (!userId) { setIsLoading(false); return; }

    const db = getDb();
    const txRef = collection(db, 'users', userId, 'transactions');
    const unsubscribe = onSnapshot(
      txRef,
      (snap) => {
        const txs: Transaction[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Transaction, 'id'>),
        }));
        // Sort newest first in-memory (avoids needing a composite Firestore index)
        txs.sort((a, b) => {
          const ta = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : (a.timestamp as number);
          const tb = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : (b.timestamp as number);
          return tb - ta;
        });
        setTransactions(txs);
        setIsLoading(false);
      },
      (err) => {
        console.error('[v0] Transactions snapshot error:', err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId]);

  const formatDate = (timestamp: Timestamp | number) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp as number);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    return (
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' +
      date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    );
  };

  // True direction based on transaction type field
  const isReceived = (type: string) => type === 'payment-received' || type === 'deposit';

  const completedTxs = transactions.filter((tx) => tx.status === 'completed');
  const pendingTxs = transactions.filter((tx) => tx.status === 'pending');

  // Transaction Detail
  if (selectedTransaction) {
    const received = isReceived(selectedTransaction.type);
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col w-full h-full overflow-y-auto">
        <button
          onClick={() => setSelectedTransaction(null)}
          className="absolute top-6 left-6 text-[#8E8E93] bg-none border-0 cursor-pointer text-2xl z-10"
        >
          ✕
        </button>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {(selectedTransaction.recipient || '?').charAt(0).toUpperCase()}
          </div>
          <div className="text-center gap-1 flex flex-col">
            <div className="text-base text-[#8E8E93] font-medium">
              {received ? 'Payment from' : 'Payment to'}{' '}
              <span className="font-bold text-[#111111]">${selectedTransaction.recipient}</span>
            </div>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-black mb-3 ${received ? 'text-[#00D632]' : 'text-[#111111]'}`}>
              {received ? '+' : '-'}${selectedTransaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {selectedTransaction.note && (
              <div className="text-sm text-[#8E8E93]">For {selectedTransaction.note}</div>
            )}
            <div className="text-sm text-[#8E8E93] mt-2">{formatDate(selectedTransaction.timestamp)}</div>
          </div>
          <div className="w-full max-w-xs mt-6">
            {selectedTransaction.status === 'completed' ? (
              <div className="w-full bg-[#00D632] text-white rounded-full py-4 text-center font-bold flex items-center justify-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Completed
              </div>
            ) : (
              <button className="w-full bg-[#00D632] text-white rounded-full py-4 text-center font-bold flex items-center justify-center gap-2 mb-4 border-0 cursor-pointer">
                Reply
              </button>
            )}
            <button className="w-full bg-white border border-[#E5E7EB] text-[#111111] rounded-full py-4 font-bold cursor-pointer">
              Web Receipt
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4">
        <h1 className="text-3xl font-bold text-[#111111]">Activity</h1>
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-[#E5E7EB] cursor-pointer overflow-hidden border border-black/5 flex items-center justify-center text-[#111111]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-2 py-2">
        <div className="bg-[#E5E7EB] rounded-2xl px-3.5 py-2.5 flex items-center gap-2 text-[#8E8E93] text-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search transactions</span>
        </div>
      </div>

      {/* Transaction Sections */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="text-center text-[#8E8E93] py-8 text-sm">Loading...</div>
        )}

        {/* Pending */}
        {pendingTxs.length > 0 && (
          <>
            <div className="text-xs font-bold uppercase text-[#8E8E93] px-4 py-3">PENDING</div>
            {pendingTxs.map((tx) => {
              const received = isReceived(tx.type);
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full bg-white px-4 py-3 flex items-center justify-between border-b border-black/5 cursor-pointer border-0 hover:bg-[#F9F9F9]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                      {(tx.recipient || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-[#111111]">${tx.recipient}</div>
                      <div className="text-xs text-[#8E8E93]">{received ? 'Payment from' : 'Payment to'}</div>
                    </div>
                  </div>
                  <div className={`text-base font-bold ${received ? 'text-[#00D632]' : 'text-[#111111]'}`}>
                    {received ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </button>
              );
            })}
          </>
        )}

        {/* Completed */}
        {completedTxs.length > 0 && (
          <>
            <div className="text-xs font-bold uppercase text-[#8E8E93] px-4 py-3">Completed</div>
            {completedTxs.map((tx) => {
              const received = isReceived(tx.type);
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full bg-white px-4 py-3 flex items-center justify-between border-b border-black/5 cursor-pointer border-0 hover:bg-[#F9F9F9]"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${received ? 'bg-[#00D632]' : 'bg-purple-500'}`}>
                      {(tx.recipient || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-base font-semibold text-[#111111]">${tx.recipient}</div>
                      <div className="text-xs text-[#8E8E93] flex items-center gap-1">
                        {received ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                        )}
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className={`text-base font-bold ${received ? 'text-[#00D632]' : 'text-[#111111]'}`}>
                    {received ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </button>
              );
            })}
          </>
        )}

        {!isLoading && transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-[#8E8E93] font-medium">No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
