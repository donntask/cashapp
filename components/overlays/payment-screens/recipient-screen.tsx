'use client';

import { useState, useEffect } from 'react';

interface RecipientScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  onAdvanceToPin: (recipient: string) => void;
  onClose: () => void;
}

interface Contact {
  uid: string;
  firstName: string;
  lastName: string;
  cashtag: string;
}

export default function RecipientScreen({
  amount,
  transactionType,
  onAdvanceToPin,
  onClose,
}: RecipientScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentUsers, setRecentUsers] = useState<Contact[]>([]);

  // Load recent/frequent users on mount
  useEffect(() => {
    const loadRecentUsers = async () => {
      try {
        const stored = localStorage.getItem('cashapp_recent_users');
        if (stored) {
          setRecentUsers(JSON.parse(stored).slice(0, 5));
        }
      } catch (error) {
        console.error('[v0] Error loading recent users:', error);
      }
    };
    loadRecentUsers();
  }, []);

  // Search users as they type
  useEffect(() => {
    const searchUsers = async () => {
      if (!inputValue.trim()) {
        setSearchResults([]);
        setSelectedUser(null);
        return;
      }

      setIsSearching(true);
      try {
        // Strip $ from cashtag before searching
        const searchTerm = inputValue.replace(/^\$/, '').trim();
        const response = await fetch('/api/users/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cashtag: searchTerm }),
        });

        const data = await response.json();
        if (data.success && data.users) {
          setSearchResults(data.users);
        }
      } catch (error) {
        console.error('[v0] Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(searchUsers, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedUser(contact);
    setInputValue(`$${contact.cashtag}`);
    setSearchResults([]);
  };

  const handlePay = () => {
    if (!inputValue.trim()) return;
    
    // Save to recent users if not already there
    if (selectedUser) {
      const recent = localStorage.getItem('cashapp_recent_users') ? 
        JSON.parse(localStorage.getItem('cashapp_recent_users')!) : [];
      const filtered = recent.filter((u: Contact) => u.uid !== selectedUser.uid);
      const updated = [selectedUser, ...filtered].slice(0, 10);
      localStorage.setItem('cashapp_recent_users', JSON.stringify(updated));
    }
    
    onAdvanceToPin(inputValue);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#E5E7EB] bg-white">
        <button onClick={onClose} className="text-xl cursor-pointer bg-none border-0 text-[#111111]">
          ×
        </button>
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-[#111111]">${amount}</div>
          <div className="text-xs text-[#8E8E93]">Cash Balance ▾</div>
        </div>
        <button
          onClick={handlePay}
          className="bg-[#00D632] text-white border-0 px-4.5 py-1.5 rounded-4xl font-semibold text-sm cursor-pointer"
        >
          {transactionType}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* To Input */}
        <div className="flex items-center px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <span className="font-semibold w-10 text-base text-[#111111]">To</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-base text-[#111111] placeholder-[#B3B3B7] bg-white"
            placeholder="Name, $Cashtag, Phone, Email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        {/* For Input */}
        <div className="flex items-center px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <span className="font-semibold w-10 text-base text-[#111111]">For</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-base text-[#111111] placeholder-[#B3B3B7] bg-white"
            placeholder="Add a note"
          />
        </div>

        {/* Search Results or Recent Users */}
        <div className="text-xs font-bold uppercase text-[#8E8E93] px-6 py-3 tracking-wide">
          {inputValue.trim() ? 'Search Results' : 'Frequent'}
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="px-6 py-4 text-center text-[#8E8E93] text-sm">
            Searching...
          </div>
        )}

        {/* Search Results */}
        {!isSearching && inputValue.trim() && searchResults.length > 0 && (
          searchResults.map((user) => (
            <div
              key={user.uid}
              onClick={() => handleContactSelect(user)}
              className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-[#F4F4F6]"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-[#00D632]">
                  {user.firstName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-base">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-[#8E8E93]">${user.cashtag}</div>
                </div>
              </div>
              <div
                className={`w-5.5 h-5.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedUser?.uid === user.uid
                    ? 'bg-[#00D632] border-[#00D632]'
                    : 'border-[#E5E7EB]'
                }`}
              >
                {selectedUser?.uid === user.uid && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </div>
          ))
        )}

        {/* No Results */}
        {!isSearching && inputValue.trim() && searchResults.length === 0 && (
          <div className="px-6 py-4 text-center text-[#8E8E93] text-sm">
            No users found
          </div>
        )}

        {/* Recent/Frequent Users */}
        {!inputValue.trim() && recentUsers.length > 0 && (
          recentUsers.map((user) => (
            <div
              key={user.uid}
              onClick={() => handleContactSelect(user)}
              className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-[#F4F4F6]"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-[#00D632]">
                  {user.firstName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-base">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-[#8E8E93]">${user.cashtag}</div>
                </div>
              </div>
              <div
                className={`w-5.5 h-5.5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedUser?.uid === user.uid
                    ? 'bg-[#00D632] border-[#00D632]'
                    : 'border-[#E5E7EB]'
                }`}
              >
                {selectedUser?.uid === user.uid && <span className="text-white text-xs font-bold">✓</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
