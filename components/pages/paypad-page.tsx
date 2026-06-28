'use client';

import { useState } from 'react';
import { searchUserByCashtag, fundUserAccount } from '@/lib/firestore-service';
import { useToast } from '@/contexts/toast-context';

interface PayPadPageProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onOpenProfile: () => void;
  onInitiatePayment: (type: 'Pay' | 'Request') => void;
  onNavigateToMoney?: () => void;
  onNavigateToActivity?: () => void;
  isAdmin?: boolean;
  onAddSearchedUser?: (user: any) => void;
}

export default function PayPadPage({
  amount,
  onAmountChange,
  onOpenProfile,
  onInitiatePayment,
  onNavigateToMoney,
  onNavigateToActivity,
  isAdmin = false,
  onAddSearchedUser,
}: PayPadPageProps) {
  const { addToast } = useToast();
  const [showFundPanel, setShowFundPanel] = useState(false);
  const [searchCashtag, setSearchCashtag] = useState('');
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFunding, setIsFunding] = useState(false);

  const handleKeyPress = (key: string) => {
    let newAmount = amount;
    if (key === 'back') {
      newAmount = newAmount.length > 1 ? newAmount.slice(0, -1) : '0';
    } else if (key === '.') {
      if (!newAmount.includes('.')) newAmount += '.';
    } else {
      if (newAmount === '0') {
        newAmount = key;
      } else {
        if (newAmount.includes('.')) {
          const decimals = newAmount.split('.')[1];
          if (decimals.length >= 2) return;
        }
        newAmount += key;
      }
    }
    onAmountChange(newAmount);
  };

  const handleSearchUser = async () => {
    const term = searchCashtag.replace(/^\$/, '').trim();
    if (!term) return;
    setIsSearching(true);
    try {
      const user = await searchUserByCashtag(term);
      if (user) {
        setSearchedUser(user);
        onAddSearchedUser?.(user);
      } else {
        addToast('User not found', 'error');
      }
    } catch {
      addToast('Error searching user', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFundUser = async () => {
    if (!searchedUser || !amount || parseFloat(amount) <= 0) {
      addToast('Select a user and enter an amount', 'error');
      return;
    }
    setIsFunding(true);
    try {
      await fundUserAccount(searchedUser.uid, parseFloat(amount));
      addToast(`Funded $${parseFloat(amount).toFixed(2)} to $${searchedUser.cashtag}`, 'success');
      onAmountChange('0');
      setSearchedUser(null);
      setSearchCashtag('');
      setShowFundPanel(false);
    } catch {
      addToast('Failed to fund user', 'error');
    } finally {
      setIsFunding(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#00D632] text-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 flex-shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>

        <div className="bg-black/10 px-3 py-1 rounded-4xl text-xs font-semibold flex items-center gap-1 cursor-pointer">
          <span>USD</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>

        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-white/20 cursor-pointer border border-white/30 flex items-center justify-center text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col justify-center items-center">
        <div className="text-7xl font-medium text-white leading-tight tracking-tighter">
          ${amount}
        </div>
      </div>

      {/* Admin: Fund User panel — slides up above keypad */}
      {isAdmin && showFundPanel && (
        <div className="mx-4 mb-3 bg-white/15 rounded-2xl p-4 flex flex-col gap-3 flex-shrink-0">
          <p className="text-white font-bold text-sm">Fund a User</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="$cashtag"
              value={searchCashtag}
              onChange={(e) => setSearchCashtag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-3 py-2 text-sm outline-none"
            />
            <button
              onClick={handleSearchUser}
              disabled={isSearching}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-white font-semibold text-sm cursor-pointer disabled:opacity-50"
            >
              {isSearching ? '...' : 'Find'}
            </button>
          </div>
          {searchedUser && (
            <div className="bg-white/20 rounded-xl px-3 py-2 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm">{searchedUser.firstName} {searchedUser.lastName}</p>
                <p className="text-xs text-white/70">${searchedUser.cashtag}</p>
              </div>
              <button
                onClick={() => { setSearchedUser(null); setSearchCashtag(''); }}
                className="text-white/60 cursor-pointer border-0 bg-transparent"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
          <button
            onClick={handleFundUser}
            disabled={isFunding || !searchedUser}
            className="w-full h-10 bg-white text-[#00D632] font-bold rounded-full cursor-pointer disabled:opacity-50 text-sm"
          >
            {isFunding ? 'Funding...' : `Fund $${amount}`}
          </button>
        </div>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 text-center px-5 pb-3 gap-1 flex-shrink-0">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(String(num))}
            className="h-14 text-xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('.')}
          className="h-14 text-xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
        >
          .
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="h-14 text-xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('back')}
          className="h-14 text-xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
        >
          &lt;
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 px-5 pb-4 flex-shrink-0">
        {isAdmin ? (
          <button
            onClick={() => setShowFundPanel((v) => !v)}
            className="flex-1 h-12 bg-black/15 text-white text-sm font-bold border-0 rounded-full cursor-pointer"
          >
            {showFundPanel ? 'Hide Fund' : 'Fund User'}
          </button>
        ) : (
          <button
            onClick={() => onInitiatePayment('Request')}
            className="flex-1 h-12 bg-black/15 text-white text-sm font-bold border-0 rounded-full cursor-pointer"
          >
            Request
          </button>
        )}
        <button
          onClick={() => onInitiatePayment('Pay')}
          className="flex-1 h-12 bg-black/15 text-white text-sm font-bold border-0 rounded-full cursor-pointer"
        >
          Pay
        </button>
      </div>

      {/* Bottom Nav Icons */}
      <div className="flex justify-center gap-8 px-5 pb-4 flex-shrink-0">
        <button
          onClick={onNavigateToMoney}
          className="flex items-center justify-center text-white bg-black/15 hover:bg-black/20 cursor-pointer border-0 rounded-full w-12 h-12"
          aria-label="Home"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </button>
        <button
          onClick={onNavigateToActivity}
          className="flex items-center justify-center text-white bg-black/15 hover:bg-black/20 cursor-pointer border-0 rounded-full w-12 h-12"
          aria-label="Activity"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
