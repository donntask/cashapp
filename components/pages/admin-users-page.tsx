'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { searchUserByCashtag, fundUserAccount, getUserTransactions } from '@/lib/firestore-service';

interface AdminUsersPageProps {
  onOpenProfile: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigateToMoney?: () => void;
  onNavigateToActivity?: () => void;
}

interface UserResult {
  uid: string;
  email: string;
  cashtag: string;
  firstName: string;
  lastName: string;
  cashBalance: number;
}

export default function AdminUsersPage({
  onOpenProfile,
  searchQuery,
  onSearchChange,
  onNavigateToMoney,
  onNavigateToActivity,
}: AdminUsersPageProps) {
  const { userId } = useAuth();
  const [foundUser, setFoundUser] = useState<UserResult | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMessage('Please enter a cashtag');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      const user = await searchUserByCashtag(searchQuery.trim());
      if (user) {
        setFoundUser(user as UserResult);
        setMessage('');
      } else {
        setFoundUser(null);
        setMessage('User not found');
      }
    } catch (error) {
      console.error('[v0] Search error:', error);
      setMessage('Error searching for user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFundUser = async () => {
    if (!foundUser || !fundAmount) {
      setMessage('Please enter an amount');
      return;
    }

    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Invalid amount');
      return;
    }

    setIsLoading(true);
    try {
      await fundUserAccount(foundUser.uid, amount);
      setMessage(`Successfully funded $${amount.toFixed(2)} to ${foundUser.cashtag}`);
      setFundAmount('');
      
      // Refresh user data
      const updatedUser = await searchUserByCashtag(foundUser.cashtag);
      if (updatedUser) {
        setFoundUser(updatedUser as UserResult);
      }
    } catch (error) {
      console.error('[v0] Fund error:', error);
      setMessage('Error funding account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#00D632] text-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3 flex-shrink-0">
        <h2 className="text-2xl font-bold">Admin Users</h2>
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

      {/* Search Section */}
      <div className="px-5 py-4 flex-shrink-0">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter user cashtag..."
            className="flex-1 px-4 py-2 rounded-full bg-white/20 text-white placeholder-white/50 border border-white/30 text-sm outline-none"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 rounded-full bg-black/25 text-white text-sm font-semibold border-0 cursor-pointer hover:bg-black/35 disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {message && (
          <div className={`p-3 rounded-lg mb-3 text-sm font-medium ${message.includes('Successfully') ? 'bg-green-500/30' : message.includes('not found') ? 'bg-yellow-500/30' : 'bg-red-500/30'}`}>
            {message}
          </div>
        )}

        {foundUser && (
          <div className="bg-white/15 rounded-lg p-4 mb-4 backdrop-blur-sm">
            <div className="mb-3">
              <p className="text-xs text-white/70 mb-1">User Details</p>
              <div className="text-lg font-bold">{foundUser.firstName} {foundUser.lastName}</div>
              <div className="text-sm text-white/80">@{foundUser.cashtag}</div>
              <div className="text-sm text-white/80">{foundUser.email}</div>
            </div>

            <div className="border-t border-white/20 pt-3 mb-3">
              <p className="text-xs text-white/70 mb-1">Current Balance</p>
              <div className="text-2xl font-bold">${foundUser.cashBalance.toFixed(2)}</div>
            </div>

            {/* Fund Amount Input */}
            <div className="border-t border-white/20 pt-3">
              <label className="text-xs text-white/70 block mb-2">Fund Amount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/20 text-white placeholder-white/50 border border-white/30 text-sm outline-none"
                />
                <button
                  onClick={handleFundUser}
                  disabled={isLoading || !fundAmount}
                  className="px-4 py-2 rounded-lg bg-black/25 text-white text-sm font-semibold border-0 cursor-pointer hover:bg-black/35 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Fund
                </button>
              </div>
            </div>
          </div>
        )}

        {!foundUser && !message && (
          <div className="text-center text-white/60 py-8">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-3 opacity-50">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-sm">Search for a user by cashtag to fund their account</p>
          </div>
        )}
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
