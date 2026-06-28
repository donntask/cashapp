'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-config';
import { setTransactionFrozen, revertTransaction } from '@/lib/firestore-service';
import { useToast } from '@/contexts/toast-context';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  recipient: string;
  note?: string;
  status: string;
  timestamp: Timestamp;
  frozen?: boolean;
  reverted?: boolean;
}

interface AdminTransactionsModalProps {
  userId: string;
  userName: string;
  userCashtag: string;
  onClose: () => void;
}

export default function AdminTransactionsModal({ userId, userName, userCashtag, onClose }: AdminTransactionsModalProps) {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    const db = getDb();
    const q = query(
      collection(db, 'users', userId, 'transactions'),
      orderBy('timestamp', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) })));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, [userId]);

  const handleFreeze = async (tx: Transaction) => {
    setActingId(tx.id);
    try {
      await setTransactionFrozen(userId, tx.id, !tx.frozen);
      addToast(tx.frozen ? 'Transaction unfrozen' : 'Transaction frozen', 'success');
    } catch {
      addToast('Failed to update transaction', 'error');
    } finally {
      setActingId(null);
    }
  };

  const handleRevert = async (tx: Transaction) => {
    if (tx.reverted) return;
    setActingId(tx.id);
    try {
      await revertTransaction(userId, tx.id);
      addToast('Transaction reverted and balance adjusted', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to revert', 'error');
    } finally {
      setActingId(null);
    }
  };

  const formatAmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (ts: Timestamp) => ts?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) ?? '';

  const typeLabel = (type: string) => {
    if (type === 'payment-sent') return { label: 'Sent', color: 'text-[#111111]', sign: '-' };
    if (type === 'payment-received') return { label: 'Received', color: 'text-[#00D632]', sign: '+' };
    if (type === 'deposit') return { label: 'Deposit', color: 'text-[#00D632]', sign: '+' };
    return { label: type, color: 'text-[#8E8E93]', sign: '' };
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-[412px] h-[92vh] rounded-t-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F6] border-0 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#111111] text-sm">{userName}&apos;s Transactions</p>
            <p className="text-xs text-[#8E8E93]">${userCashtag} · {transactions.length} records</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-[#00D632]" />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#F4F4F6]">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <svg className="animate-spin text-[#00D632]" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            </div>
          )}
          {!loading && transactions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-sm text-[#8E8E93]">No transactions found</p>
            </div>
          )}
          {transactions.map((tx) => {
            const { label, color, sign } = typeLabel(tx.type);
            const isActing = actingId === tx.id;
            return (
              <div key={tx.id} className={`px-4 py-3 ${tx.frozen ? 'bg-blue-50' : tx.reverted ? 'bg-red-50' : 'bg-white'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${tx.frozen ? 'bg-blue-100' : tx.reverted ? 'bg-red-100' : 'bg-[#F4F4F6]'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tx.frozen ? '#2563EB' : tx.reverted ? '#DC2626' : '#8E8E93'} strokeWidth="2">
                      {tx.type === 'payment-sent'
                        ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                        : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                      }
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-[#111111] truncate">
                        {tx.type === 'payment-sent' ? `To $${tx.recipient}` : `From $${tx.recipient}`}
                      </p>
                      <p className={`font-bold text-sm flex-shrink-0 ${color}`}>
                        {sign}{formatAmt(tx.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-[#8E8E93]">{formatDate(tx.timestamp)}</p>
                      {tx.frozen && <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">Frozen</span>}
                      {tx.reverted && <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full">Reverted</span>}
                    </div>
                    {tx.note && <p className="text-xs text-[#8E8E93] mt-0.5 truncate">{tx.note}</p>}
                  </div>
                </div>
                {/* Action row */}
                {!tx.reverted && (
                  <div className="flex gap-2 mt-2 ml-12">
                    <button
                      onClick={() => handleFreeze(tx)}
                      disabled={isActing}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer disabled:opacity-40 ${
                        tx.frozen
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-blue-600 border-blue-200'
                      }`}
                    >
                      {isActing ? '...' : tx.frozen ? 'Unfreeze' : 'Freeze'}
                    </button>
                    <button
                      onClick={() => handleRevert(tx)}
                      disabled={isActing || !!tx.frozen}
                      className="flex-1 py-1.5 rounded-lg text-xs font-bold border border-red-200 text-red-600 bg-white cursor-pointer disabled:opacity-30"
                    >
                      Revert
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
