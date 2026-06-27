'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getUserAccount } from '@/lib/firestore-service';

interface MoneyPageProps {
  onOpenProfile: () => void;
  isAdmin?: boolean;
  onOpenAdminActions?: () => void;
}

export default function MoneyPage({ onOpenProfile, isAdmin = false, onOpenAdminActions }: MoneyPageProps) {
  const { userId } = useAuth();
  const [cashBalance, setCashBalance] = useState(0);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBalances = async () => {
      try {
        if (isAdmin) {
          // Admin has unlimited balance
          setCashBalance(999999999);
          setSavingsBalance(999999999);
          setIsLoading(false);
        } else if (userId) {
          const account = await getUserAccount(userId);
          if (account) {
            setCashBalance(account.cashBalance || 0);
            setSavingsBalance(account.savingsBalance || 0);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('[v0] Failed to load account data:', error);
        setIsLoading(false);
      }
    };

    loadBalances();
  }, [userId, isAdmin]);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 flex-shrink-0">
        <h1 className="text-4xl font-black text-[#111111]">Money</h1>
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-[#E5E7EB] cursor-pointer overflow-hidden border-[2.3px] border-black flex items-center justify-center text-[#111111]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* Money Card */}
      <div className="bg-white mx-3 mb-3 p-4 rounded-[14px] flex-shrink-0">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-semibold text-[#111111]">Cash balance</span>
          <a href="#" className="text-xs text-[#8E8E93] no-underline flex items-center gap-1">
            Account & routing <span className="text-[10px]">❯</span>
          </a>
        </div>
        <div className="text-5xl font-black text-[#111111] mb-4 leading-tight">
          {isAdmin ? 'Unlimited' : formatCurrency(cashBalance)}
        </div>
        <div className="flex gap-2">
          {isAdmin ? (
            <button
              onClick={onOpenAdminActions}
              className="flex-1 h-10 bg-[#00D632] text-white text-xs font-bold border-0 rounded-full cursor-pointer"
            >
              Admin Actions
            </button>
          ) : (
            <>
              <button className="flex-1 h-10 bg-[#F4F4F6] text-[#111111] text-xs font-bold border-0 rounded-full cursor-pointer">
                Add Cash
              </button>
              <button className="flex-1 h-10 bg-[#F4F4F6] text-[#111111] text-xs font-bold border-0 rounded-full cursor-pointer">
                Cash Out
              </button>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-1.5 px-3 pb-3 flex-1 overflow-hidden">
        {/* Savings */}
        <div className="bg-white rounded-[12px] p-2.5 flex flex-col cursor-pointer min-h-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-bold text-[#111111]">Savings</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#C8E6C9] flex items-center justify-center text-[#2E7D32] mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-sm font-bold text-[#111111]">{formatCurrency(savingsBalance)}</div>
          <div className="text-xs text-[#8E8E93]">Save for a goal</div>
        </div>

        {/* Buy bitcoin */}
        <div className="bg-white rounded-[12px] p-2.5 flex flex-col cursor-pointer min-h-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-bold text-[#111111]">Buy bitcoin</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E3F2FD] flex items-center justify-center mb-1">
            <div className="text-lg font-bold text-[#1976D2]">₿</div>
          </div>
        </div>

        {/* Invest in stocks */}
        <div className="bg-white rounded-[12px] p-2.5 flex flex-col cursor-pointer min-h-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-bold text-[#111111]">Invest in stocks</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F3E5F5] flex items-center justify-center mb-1">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>

        {/* Free tax filing */}
        <div className="bg-white rounded-[12px] p-2.5 flex flex-col cursor-pointer min-h-0">
          <div className="flex justify-between items-start mb-1">
            <span className="text-sm font-bold text-[#111111]">Free tax filing</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FFF9C4] flex items-center justify-center mb-1">
            <div className="text-lg">📋</div>
          </div>
        </div>
      </div>
    </div>
  );
}
