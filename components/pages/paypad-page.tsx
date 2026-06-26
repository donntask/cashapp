'use client';

import { useState } from 'react';
import { searchUserByCashtag, fundUserAccount } from '@/lib/firestore-service';

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
  const [searchCashtag, setSearchCashtag] = useState('');
  const [searchedUser, setSearchedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const handleSearchUser = async () => {
    if (!searchCashtag.trim()) return;
    
    setIsSearching(true);
    setMessage('');
    try {
      const user = await searchUserByCashtag(searchCashtag);
      if (user) {
        setSearchedUser(user);
        setMessage(`Found: ${user.firstName} ${user.lastName}`);
        setMessageType('success');
        onAddSearchedUser?.(user);
      } else {
        setSearchedUser(null);
        setMessage('User not found');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error searching user');
      setMessageType('error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFundUser = async () => {
    if (!searchedUser || !amount || parseFloat(amount) <= 0) {
      setMessage('Please select a user and amount');
      setMessageType('error');
      return;
    }

    setIsFunding(true);
    setMessage('');
    try {
      await fundUserAccount(searchedUser.uid, parseFloat(amount));
      setMessage(`Successfully funded ${searchedUser.firstName} with $${amount}`);
      setMessageType('success');
      setAmount('0');
      setSearchedUser(null);
      setSearchCashtag('');
    } catch (error) {
      setMessage('Failed to fund user');
      setMessageType('error');
    } finally {
      setIsFunding(false);
    }
  };

  const handleKeyPress = (key: string) => {
    let newAmount = amount;

    if (key === 'back') {
      if (newAmount.length > 1) {
        newAmount = newAmount.slice(0, -1);
      } else {
        newAmount = '0';
      }
    } else if (key === '.') {
      if (!newAmount.includes('.')) {
        newAmount += '.';
      }
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

  // Admin view for funding users by cashtag
  if (isAdmin) {
    return (
      <div className="flex flex-col w-full h-full bg-[#00D632] text-white">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-3 flex-shrink-0">
          <h1 className="text-lg font-bold">Fund Users</h1>
          <button
            onClick={onOpenProfile}
            className="w-8 h-8 rounded-full bg-white/20 cursor-pointer overflow-hidden border border-white/30 flex items-center justify-center text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </button>
        </div>

        {/* Search and Fund Section */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Search Cashtag */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search by cashtag"
              value={searchCashtag}
              onChange={(e) => setSearchCashtag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
              className="flex-1 px-3 py-2 rounded-lg bg-black/20 text-white placeholder-white/50 border border-white/30"
            />
            <button
              onClick={handleSearchUser}
              disabled={isSearching}
              className="px-4 py-2 bg-black/30 hover:bg-black/40 disabled:opacity-50 rounded-lg font-semibold cursor-pointer"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-3 rounded-lg ${messageType === 'success' ? 'bg-green-600/30' : 'bg-red-600/30'}`}>
              {message}
            </div>
          )}

          {/* User Found Display */}
          {searchedUser && (
            <div className="bg-black/20 p-4 rounded-lg">
              <p className="font-semibold">{searchedUser.firstName} {searchedUser.lastName}</p>
              <p className="text-sm text-white/70">@{searchedUser.cashtag}</p>
              <p className="text-sm mt-2">Current Balance: ${searchedUser.cashBalance || 0}</p>
            </div>
          )}

          {/* Amount Display */}
          <div className="text-center">
            <p className="text-sm text-white/70">Amount to Fund</p>
            <div className="text-5xl font-medium text-white my-3">${amount}</div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleKeyPress(String(num))}
                className="h-12 text-lg font-medium text-white bg-black/20 hover:bg-black/30 rounded-lg cursor-pointer"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('.')}
              className="h-12 text-lg font-medium text-white bg-black/20 hover:bg-black/30 rounded-lg cursor-pointer"
            >
              .
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-12 text-lg font-medium text-white bg-black/20 hover:bg-black/30 rounded-lg cursor-pointer"
            >
              0
            </button>
            <button
              onClick={() => handleKeyPress('back')}
              className="h-12 text-lg font-medium text-white bg-black/20 hover:bg-black/30 rounded-lg cursor-pointer"
            >
              ←
            </button>
          </div>

          {/* Fund Button */}
          <button
            onClick={handleFundUser}
            disabled={isFunding || !searchedUser}
            className="w-full h-12 bg-black/30 hover:bg-black/40 disabled:opacity-50 text-white font-bold rounded-lg cursor-pointer"
          >
            {isFunding ? 'Funding...' : 'Fund User'}
          </button>
        </div>
      </div>
    );
  }

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
          className="w-8 h-8 rounded-full bg-white/20 cursor-pointer overflow-hidden border border-white/30 flex items-center justify-center text-white"
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
        <button
          onClick={() => onInitiatePayment('Request')}
          className="flex-1 h-12 bg-black/15 text-white text-sm font-bold border-0 rounded-full cursor-pointer"
        >
          Request
        </button>
        <button
          onClick={() => onInitiatePayment('Pay')}
          className="flex-1 h-12 bg-black/15 text-white text-sm font-bold border-0 rounded-full cursor-pointer"
        >
          Pay
        </button>
      </div>

      {/* Bottom Nav Icons - Only on PayPad page */}
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
