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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    try {
      const appData = localStorage.getItem('cashapp_app_data');
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
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getTransactionDirection = (type: string) => {
    const isPayment = type.toLowerCase().includes('pay');
    return isPayment ? { label: '-', icon: '↑', color: 'text-gray-400' } : { label: '+', icon: '↓', color: 'text-gray-400' };
  };

  const completedTxs = transactions.filter(tx => tx.status === 'completed');
  const pendingTxs = transactions.filter(tx => tx.status === 'pending');

  // Transaction Detail - Full Page Receipt
  if (selectedTransaction) {
    const direction = getTransactionDirection(selectedTransaction.type);
    const isPayment = selectedTransaction.type.toLowerCase().includes('pay');
    
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col w-full h-full overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setSelectedTransaction(null)}
          className="absolute top-6 left-6 text-[#8E8E93] bg-none border-0 cursor-pointer text-2xl z-10"
        >
          ✕
        </button>

        {/* Receipt Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 gap-8">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            {selectedTransaction.recipient.charAt(0).toUpperCase()}
          </div>

          {/* Transaction Info */}
          <div className="text-center gap-1 flex flex-col">
            <div className="text-base text-[#8E8E93] font-medium">
              {isPayment ? 'Payment to' : 'Payment from'} <span className="font-bold text-[#111111]">${selectedTransaction.recipient}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-center">
            <div className="text-6xl font-black text-[#111111] mb-3">${selectedTransaction.amount.toFixed(2)}</div>
            {selectedTransaction.note && (
              <div className="text-sm text-[#8E8E93]">For {selectedTransaction.note}</div>
            )}
            <div className="text-sm text-[#8E8E93] mt-2">{formatDate(selectedTransaction.timestamp)}</div>
          </div>

          {/* Status Badge or Action Button */}
          <div className="w-full max-w-xs mt-6">
            {selectedTransaction.status === 'completed' ? (
              <div className="w-full bg-[#00D632] text-white rounded-full py-4 text-center font-bold flex items-center justify-center gap-2 mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Completed
              </div>
            ) : (
              <button className="w-full bg-[#00D632] text-white rounded-full py-4 text-center font-bold flex items-center justify-center gap-2 mb-4 border-0 cursor-pointer hover:bg-[#00C42A]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Reply
              </button>
            )}

            {/* Web Receipt Button */}
            <button className="w-full bg-white border border-[#E5E7EB] text-[#111111] rounded-full py-4 font-bold cursor-pointer hover:bg-[#F9F9F9]">
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
            {pendingTxs.map((tx) => {
              const direction = getTransactionDirection(tx.type);
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full bg-white px-4 py-3 flex items-center justify-between border-b border-black/2 cursor-pointer border-0 hover:bg-[#F9F9F9]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                      {tx.recipient.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-[#111111]">{tx.recipient}</div>
                      <div className="text-xs text-[#8E8E93] flex items-center gap-1">
                        <span className={`${direction.color} font-bold`}>{direction.icon}</span>
                        {tx.type}
                      </div>
                    </div>
                  </div>
                  <div className="text-base font-bold text-black">{direction.label}${tx.amount.toFixed(2)}</div>
                </button>
              );
            })}
          </>
        )}

        {/* Completed Section */}
        {completedTxs.length > 0 && (
          <>
            <div className="text-xs font-bold uppercase text-[#8E8E93] px-4 py-3 border-b border-black/2">
              Completed
            </div>
            {completedTxs.map((tx) => {
              const direction = getTransactionDirection(tx.type);
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedTransaction(tx)}
                  className="w-full bg-white px-4 py-3 flex items-center justify-between border-b border-black/2 cursor-pointer border-0 hover:bg-[#F9F9F9]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                      {tx.recipient.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-[#111111]">{tx.recipient}</div>
                      <div className="text-xs text-[#8E8E93] flex items-center gap-1">
                        <span className={`${direction.color} font-bold`}>{direction.icon}</span>
                        {formatDate(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-base font-bold text-black">{direction.label}${tx.amount.toFixed(2)}</div>
                </button>
              );
            })}
          </>
        )}

        {transactions.length === 0 && (
          <div className="text-center text-[#8E8E93] py-8">No transactions yet</div>
        )}
      </div>
    </div>
  );
}
