'use client';

import { useEffect, useState } from 'react';

interface ActivityPageProps {
  onOpenProfile: () => void;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  recipient: string;
  note: string;
  timestamp: number;
  status: string;
}

export default function ActivityPage({ onOpenProfile }: ActivityPageProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    try {
      const appData = localStorage.getItem('bushfi_app_data');
      if (appData) {
        const data = JSON.parse(appData);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('[v0] Failed to load transactions:', error);
    }
  }, []);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const completedTxs = transactions.filter(tx => tx.status === 'completed');
  const pendingTxs = transactions.filter(tx => tx.status === 'pending');
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

      {/* Horizontal Avatar Row */}
      <div className="flex gap-4 px-4 py-4 overflow-x-auto">
        <div className="flex flex-col items-center gap-1.5 font-semibold text-xs min-w-[55px]">
          <div className="w-10 h-10 rounded-full bg-[#00D632] flex items-center justify-center text-white text-lg">
            +
          </div>
          <div className="text-[#111111] font-semibold text-center">Get $20</div>
        </div>
        <div className="flex flex-col items-center gap-1.5 font-semibold text-xs min-w-[55px]">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
            B
          </div>
          <div>Business</div>
        </div>
        <div className="flex flex-col items-center gap-1.5 font-semibold text-xs min-w-[55px]">
          <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
            C
          </div>
          <div>Christina</div>
        </div>
        <div className="flex flex-col items-center gap-1.5 font-semibold text-xs min-w-[55px]">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
            D
          </div>
          <div>Destiny</div>
        </div>
      </div>

      {/* Transaction Sections */}
      <div className="flex-1 overflow-y-auto">
        {/* Pending Section */}
        {pendingTxs.length > 0 && (
          <>
            <div className="text-xs font-bold uppercase text-[#8E8E93] px-4 py-3 border-b border-black/2">
              PENDING
            </div>
            {pendingTxs.map((tx) => (
              <div key={tx.id} className="bg-white px-4 py-3 flex items-center justify-between border-b border-black/2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                    {tx.recipient.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-[#111111]">{tx.recipient}</div>
                    <div className="text-xs text-[#8E8E93]">⬞ {tx.type}</div>
                  </div>
                </div>
                <div className="text-base font-medium text-[#8E8E93]">${tx.amount.toFixed(2)}</div>
              </div>
            ))}
          </>
        )}

        {/* Completed Section */}
        {completedTxs.length > 0 && (
          <>
            <div className="text-xs font-bold uppercase text-[#8E8E93] px-4 py-3 border-b border-black/2">
              Completed
            </div>
            {completedTxs.map((tx) => (
              <div key={tx.id} className="bg-white px-4 py-3 flex items-center justify-between border-b border-black/2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                    {tx.recipient.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-[#111111]">{tx.recipient}</div>
                    <div className="text-xs text-[#8E8E93]">At {formatDate(tx.timestamp)}</div>
                  </div>
                </div>
                <div className="text-base font-bold text-[#111111]">${tx.amount.toFixed(2)}</div>
              </div>
            ))}
          </>
        )}

        {transactions.length === 0 && (
          <div className="text-center text-[#8E8E93] py-8">No transactions yet</div>
        )}
      </div>
    </div>
  );
}
