'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/contexts/toast-context';

interface RecipientScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  onAdvanceToPin: (recipient: string, note: string) => void;
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
  const [note, setNote] = useState('');
  const [selectedUser, setSelectedUser] = useState<Contact | null>(null);
  const [searchResults, setSearchResults] = useState<Contact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [recentUsers, setRecentUsers] = useState<Contact[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  // Load recent users on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cashapp_recent_users');
      if (stored) {
        setRecentUsers(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  }, []);

  // Debounced search whenever inputValue changes
  useEffect(() => {
    // If user manually edited the field after selecting, clear selection
    if (selectedUser && inputValue !== `$${selectedUser.cashtag}`) {
      setSelectedUser(null);
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);

    const trimmed = inputValue.replace(/^\$/, '').trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchError(false);
      return;
    }

    searchTimer.current = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(false);
      try {
        const res = await fetch('/api/users/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cashtag: trimmed }),
        });
        const data = await res.json();
        if (data.success) {
          setSearchResults(data.users || []);
          if ((data.users || []).length === 0) {
            setSearchError(true);
          }
        } else {
          setSearchResults([]);
          setSearchError(true);
        }
      } catch {
        setSearchResults([]);
        setSearchError(true);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleContactSelect = (contact: Contact) => {
    setSelectedUser(contact);
    setInputValue(`$${contact.cashtag}`);
    setSearchResults([]);
    setSearchError(false);
  };

  const handlePay = () => {
    // Guard: amount must be non-zero
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      addToast('Enter an amount before sending.', 'warning');
      return;
    }

    // Guard: must have a valid selected user
    if (!selectedUser) {
      const raw = inputValue.replace(/^\$/, '').trim();
      if (!raw) {
        addToast('Please enter a recipient $Cashtag.', 'warning');
      } else {
        addToast(`No user found for "$${raw}". Check the cashtag and try again.`, 'error');
      }
      return;
    }

    // Save to recent users
    try {
      const stored = localStorage.getItem('cashapp_recent_users');
      const recent: Contact[] = stored ? JSON.parse(stored) : [];
      const filtered = recent.filter((u) => u.uid !== selectedUser.uid);
      localStorage.setItem(
        'cashapp_recent_users',
        JSON.stringify([selectedUser, ...filtered].slice(0, 10))
      );
    } catch {}

    onAdvanceToPin(`$${selectedUser.cashtag}`, note);
  };

  const isTyping = inputValue.replace(/^\$/, '').trim().length > 0;

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#E5E7EB] bg-white">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-xl cursor-pointer bg-transparent border-0 text-[#111111]"
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-[#111111]">${amount}</div>
          <div className="text-xs text-[#8E8E93]">Cash Balance ▾</div>
        </div>
        <button
          onClick={handlePay}
          className={`px-5 py-2 rounded-full font-semibold text-sm cursor-pointer border-0 transition-opacity ${
            selectedUser
              ? 'bg-[#00D632] text-white opacity-100'
              : 'bg-[#00D632] text-white opacity-50'
          }`}
        >
          {transactionType}
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* To row */}
        <div className="flex items-center px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <span className="font-semibold w-10 text-base text-[#111111] flex-shrink-0">To</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-base text-[#111111] placeholder-[#B3B3B7] bg-white"
            placeholder="$Cashtag"
            value={inputValue}
            autoFocus
            onChange={(e) => setInputValue(e.target.value)}
          />
          {selectedUser && (
            <button
              onClick={() => { setSelectedUser(null); setInputValue(''); }}
              className="text-[#8E8E93] text-xl bg-transparent border-0 cursor-pointer flex-shrink-0"
              aria-label="Clear recipient"
            >
              ×
            </button>
          )}
        </div>

        {/* For row */}
        <div className="flex items-center px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <span className="font-semibold w-10 text-base text-[#111111] flex-shrink-0">For</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-base text-[#111111] placeholder-[#B3B3B7] bg-white"
            placeholder="Add a note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Section label */}
        <div className="text-xs font-bold uppercase text-[#8E8E93] px-6 py-3 tracking-wide">
          {isTyping ? 'Search Results' : 'Frequent'}
        </div>

        {/* Searching indicator */}
        {isSearching && (
          <div className="px-6 py-6 text-center text-[#8E8E93] text-sm">
            Searching...
          </div>
        )}

        {/* Search results */}
        {!isSearching && isTyping && searchResults.length > 0 &&
          searchResults.map((user) => (
            <button
              key={user.uid}
              onClick={() => handleContactSelect(user)}
              className="flex items-center justify-between px-6 py-3 w-full text-left cursor-pointer hover:bg-[#F4F4F6] bg-transparent border-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-[#00D632] flex-shrink-0">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-base text-[#111111] truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-[#8E8E93]">${user.cashtag}</div>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                  selectedUser?.uid === user.uid
                    ? 'bg-[#00D632] border-[#00D632]'
                    : 'border-[#E5E7EB]'
                }`}
              >
                {selectedUser?.uid === user.uid && (
                  <span className="text-white text-[10px] font-bold leading-none">✓</span>
                )}
              </div>
            </button>
          ))
        }

        {/* No results state */}
        {!isSearching && isTyping && searchError && searchResults.length === 0 && (
          <div className="px-6 py-6 text-center text-[#8E8E93] text-sm">
            No users found for &quot;${inputValue.replace(/^\$/, '')}&quot;
          </div>
        )}

        {/* Recent / frequent users */}
        {!isTyping && recentUsers.length > 0 &&
          recentUsers.map((user) => (
            <button
              key={user.uid}
              onClick={() => handleContactSelect(user)}
              className="flex items-center justify-between px-6 py-3 w-full text-left cursor-pointer hover:bg-[#F4F4F6] bg-transparent border-0"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-[#00D632] flex-shrink-0">
                  {user.firstName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-base text-[#111111] truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-[#8E8E93]">${user.cashtag}</div>
                </div>
              </div>
            </button>
          ))
        }

        {/* Empty frequent state */}
        {!isTyping && recentUsers.length === 0 && (
          <div className="px-6 py-6 text-center text-[#8E8E93] text-sm">
            Search by $Cashtag to find someone
          </div>
        )}
      </div>
    </div>
  );
}
