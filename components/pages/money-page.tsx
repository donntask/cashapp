'use client';

import { useEffect, useState, useRef } from 'react';
import { onSnapshot, doc } from 'firebase/firestore';
import { useAuth } from '@/contexts/auth-context';
import { getDb } from '@/lib/firebase-config';
import { useToast } from '@/contexts/toast-context';
import { usePushNotifications } from '@/hooks/use-push-notifications';

interface MoneyPageProps {
  onOpenProfile: () => void;
  isAdmin?: boolean;
  onOpenAdminActions?: () => void;
}

export default function MoneyPage({ onOpenProfile, isAdmin = false, onOpenAdminActions }: MoneyPageProps) {
  const { userId } = useAuth();
  const { addToast } = useToast();
  const { notify, requestPermission } = usePushNotifications();
  const prevBalanceRef = useRef<number | null>(null);
  const [cashBalance, setCashBalance] = useState(0);
  const [savingsBalance, setSavingsBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showUnavailable, setShowUnavailable] = useState<string | null>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullY, setPullY] = useState(0);
  const pullStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleUnavailable = (feature: string) => setShowUnavailable(feature);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
    }
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartY.current === 0) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0 && delta < 80) setPullY(delta);
  };
  const handleTouchEnd = async () => {
    if (pullY > 50) {
      setIsPulling(true);
      setPullY(0);
      pullStartY.current = 0;
      // Snapshot already live — just reset the prev balance ref to force re-read
      prevBalanceRef.current = null;
      await new Promise(r => setTimeout(r, 800));
      setIsPulling(false);
    } else {
      setPullY(0);
      pullStartY.current = 0;
    }
  };

  // Request notification permission once on mount
  useEffect(() => {
    if (!isAdmin) requestPermission();
  }, []);

  // Real-time Firestore snapshot for balance
  useEffect(() => {
    if (isAdmin) {
      setIsLoading(false);
      return;
    }
    if (!userId) { setIsLoading(false); return; }

    const db = getDb();
    const unsubscribe = onSnapshot(
      doc(db, 'accounts', userId),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          const newBalance: number = data.cashBalance ?? 0;
          const prev = prevBalanceRef.current;
          // Fire device notification when balance increases (credit)
          if (prev !== null && newBalance > prev) {
            const credited = newBalance - prev;
            notify(
              'Cash App',
              `$${credited.toLocaleString('en-US', { minimumFractionDigits: 2 })} has been added to your Cash balance.`
            );
            addToast(`+$${credited.toLocaleString('en-US', { minimumFractionDigits: 2 })} credited to your account`, 'success');
          }
          prevBalanceRef.current = newBalance;
          setCashBalance(newBalance);
          setSavingsBalance(data.savingsBalance ?? 0);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('[v0] Balance snapshot error:', err);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, [userId, isAdmin]);

  // Balance card: full dollar amount with commas (e.g. $1,000.00, $12,345.67)
  // Only abbreviates at 1B+ where the full number is truly impractical
  const formatBalance = (amount: number): string => {
    if (amount >= 1_000_000_000)
      return `$${(amount / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}b`;
    if (amount >= 1_000_000)
      return `$${(amount / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}m`;
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div
      className="flex flex-col w-full h-full overflow-y-auto"
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {(pullY > 0 || isPulling) && (
        <div
          className="flex items-center justify-center transition-all duration-200"
          style={{ height: isPulling ? 40 : pullY * 0.5 }}
        >
          <svg className={`text-[#00D632] ${isPulling ? 'animate-spin' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      )}
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
        <div className="text-5xl font-black text-[#111111] mb-4 leading-tight tabular-nums">
          {isAdmin ? 'Unlimited' : isLoading ? '—' : formatBalance(cashBalance)}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleUnavailable('Add Cash')}
            className="flex-1 h-10 bg-[#F4F4F6] text-[#111111] text-xs font-bold border-0 rounded-full cursor-pointer active:opacity-70"
          >
            Add Cash
          </button>
          <button
            onClick={() => handleUnavailable('Cash Out')}
            className="flex-1 h-10 bg-[#F4F4F6] text-[#111111] text-xs font-bold border-0 rounded-full cursor-pointer active:opacity-70"
          >
            Cash Out
          </button>
        </div>

        {/* Unavailable feature modal — z-[200] sits above navbar (z-50) */}
        {showUnavailable && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40" onClick={() => setShowUnavailable(null)}>
            <div
              className="bg-white w-full max-w-[412px] rounded-t-3xl p-6 pb-16 flex flex-col items-center gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-[#E5E7EB] rounded-full mb-2" />
              <div className="w-16 h-16 rounded-full bg-[#F4F4F6] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-lg font-bold text-[#111111] text-center">{showUnavailable} Unavailable</p>
              <p className="text-sm text-[#8E8E93] text-center leading-relaxed">
                {showUnavailable} is currently unavailable. Please try again later.
              </p>
              <button
                onClick={() => setShowUnavailable(null)}
                className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer mt-2"
              >
                OK
              </button>
            </div>
          </div>
        )}
        {isAdmin && (
          <button
            onClick={onOpenAdminActions}
            className="w-full h-10 bg-[#00D632] text-white text-xs font-bold border-0 rounded-full cursor-pointer mt-2"
          >
            Admin Actions
          </button>
        )}
      </div>

      {/* Features Grid — all 4 cards equal height */}
      <div className="grid grid-cols-2 gap-1.5 px-3 pb-24" style={{ gridTemplateRows: '1fr 1fr' }}>
        {/* Savings */}
        <div className="bg-white rounded-[12px] p-3 flex flex-col cursor-pointer h-[130px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-[#111111]">Savings</span>
            <span className="text-[10px] text-[#C7C7CC]">&#8250;</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#C8E6C9] flex items-center justify-center text-[#2E7D32] mb-2 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-sm font-bold text-[#111111]">{isAdmin ? '$∞' : formatBalance(savingsBalance)}</div>
          <div className="text-xs text-[#8E8E93]">Save for a goal</div>
        </div>

        {/* Buy bitcoin */}
        <div className="bg-white rounded-[12px] p-3 flex flex-col cursor-pointer h-[130px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-[#111111]">Buy bitcoin</span>
            <span className="text-[10px] text-[#C7C7CC]">&#8250;</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#E3F2FD] flex items-center justify-center mb-2 flex-shrink-0">
            <span className="text-lg font-bold text-[#1976D2]">&#x20BF;</span>
          </div>
          <div className="text-xs text-[#8E8E93]">Buy &amp; sell instantly</div>
        </div>

        {/* Invest in stocks */}
        <div className="bg-white rounded-[12px] p-3 flex flex-col cursor-pointer h-[130px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-[#111111]">Invest in stocks</span>
            <span className="text-[10px] text-[#C7C7CC]">&#8250;</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#F3E5F5] flex items-center justify-center mb-2 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
          <div className="text-xs text-[#8E8E93]">Fractional shares</div>
        </div>

        {/* Free tax filing */}
        <div className="bg-white rounded-[12px] p-3 flex flex-col cursor-pointer h-[130px]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-bold text-[#111111]">Free tax filing</span>
            <span className="text-[10px] text-[#C7C7CC]">&#8250;</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-[#FFF9C4] flex items-center justify-center mb-2 flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F9A825" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div className="text-xs text-[#8E8E93]">File for free</div>
        </div>
      </div>
    </div>
  );
}
