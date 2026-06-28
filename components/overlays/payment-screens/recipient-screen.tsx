'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/contexts/toast-context';
import { collection, query, where, getDocs, orderBy, limit, startAt, endAt } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-config';

interface RecipientScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  onAdvanceToPin: (recipient: string, note: string) => void;
  onClose: () => void;
}

interface FoundUser {
  uid: string;
  firstName: string;
  lastName: string;
  cashtag: string;
  email: string;
}

async function searchCashtagInFirestore(input: string): Promise<FoundUser[]> {
  // Strip $ and lowercase — cashtags are stored lowercase
  const term = input.replace(/^\$/, '').trim().toLowerCase();
  if (!term) return [];

  const db = getDb();
  const usersRef = collection(db, 'users');
  const found = new Map<string, FoundUser>();

  // Exact match first
  try {
    const exact = await getDocs(query(usersRef, where('cashtag', '==', term), limit(10)));
    exact.docs.forEach((d) => {
      const data = d.data();
      found.set(d.id, {
        uid: d.id,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        cashtag: data.cashtag || '',
        email: data.email || '',
      });
    });
  } catch (err) {
    console.error('[v0] exact match query failed:', err);
  }

  // Prefix range query (e.g. "tom" matches "tomharry", "tommy", etc.)
  // Requires a Firestore index on cashtag asc — if missing, falls through to scan
  if (found.size === 0) {
    try {
      const prefix = term;
      const prefixEnd = term + '\uf8ff';
      const rangeQ = query(
        usersRef,
        orderBy('cashtag'),
        startAt(prefix),
        endAt(prefixEnd),
        limit(10)
      );
      const snap = await getDocs(rangeQ);
      snap.docs.forEach((d) => {
        const data = d.data();
        found.set(d.id, {
          uid: d.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          cashtag: data.cashtag || '',
          email: data.email || '',
        });
      });
    } catch (err) {
      console.error('[v0] prefix range query failed, falling back to scan:', err);
    }
  }

  // Full-collection scan fallback (catches any index failures)
  if (found.size === 0) {
    try {
      const allSnap = await getDocs(query(usersRef, limit(300)));
      allSnap.docs.forEach((d) => {
        const data = d.data();
        const stored = (data.cashtag || '').toLowerCase();
        if (stored.includes(term)) {
          found.set(d.id, {
            uid: d.id,
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            cashtag: data.cashtag || '',
            email: data.email || '',
          });
        }
      });
    } catch (err) {
      console.error('[v0] full scan fallback failed:', err);
    }
  }

  return Array.from(found.values()).slice(0, 8);
}

export default function RecipientScreen({
  amount,
  transactionType,
  onAdvanceToPin,
  onClose,
}: RecipientScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [note, setNote] = useState('');
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);
  const [searchResults, setSearchResults] = useState<FoundUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNoResults, setShowNoResults] = useState(false);
  const [recentUsers, setRecentUsers] = useState<FoundUser[]>([]);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useToast();

  // Load recent users from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cashapp_recent_users');
      if (stored) {
        setRecentUsers(JSON.parse(stored).slice(0, 5));
      }
    } catch {}
  }, []);

  // Debounced live search on every keystroke
  useEffect(() => {
    // If user edited the field after selecting someone, clear the selection
    if (selectedUser && inputValue !== `$${selectedUser.cashtag}`) {
      setSelectedUser(null);
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);

    const trimmed = inputValue.replace(/^\$/, '').trim();
    if (!trimmed) {
      setSearchResults([]);
      setShowNoResults(false);
      return;
    }

    setIsSearching(true);
    setShowNoResults(false);

    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchCashtagInFirestore(trimmed);
        setSearchResults(results);
        setShowNoResults(results.length === 0);
      } catch (err) {
        console.error('[v0] search error:', err);
        setSearchResults([]);
        setShowNoResults(true);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const handleSelect = (user: FoundUser) => {
    setSelectedUser(user);
    setInputValue(`$${user.cashtag}`);
    setSearchResults([]);
    setShowNoResults(false);
  };

  const handleClearRecipient = () => {
    setSelectedUser(null);
    setInputValue('');
    setSearchResults([]);
    setShowNoResults(false);
  };

  const handleAdvance = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      addToast('Enter an amount first.', 'warning');
      return;
    }

    if (!selectedUser) {
      const raw = inputValue.replace(/^\$/, '').trim();
      if (!raw) {
        addToast('Enter a $Cashtag to find someone.', 'warning');
      } else {
        addToast(`No user found for "$${raw}". Check the cashtag and try again.`, 'error');
      }
      return;
    }

    // Save to recent users
    try {
      const stored = localStorage.getItem('cashapp_recent_users');
      const recent: FoundUser[] = stored ? JSON.parse(stored) : [];
      const deduped = recent.filter((u) => u.uid !== selectedUser.uid);
      localStorage.setItem(
        'cashapp_recent_users',
        JSON.stringify([selectedUser, ...deduped].slice(0, 10))
      );
    } catch {}

    onAdvanceToPin(`$${selectedUser.cashtag}`, note);
  };

  const isTyping = inputValue.replace(/^\$/, '').trim().length > 0;

  const UserRow = ({ user, showCheck }: { user: FoundUser; showCheck?: boolean }) => (
    <button
      key={user.uid}
      onClick={() => handleSelect(user)}
      className="flex items-center justify-between px-6 py-3 w-full text-left cursor-pointer hover:bg-[#F4F4F6] bg-transparent border-0 active:bg-[#EBEBEB]"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base bg-[#00D632] flex-shrink-0">
          {(user.firstName || '?').charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-[15px] text-[#111111] truncate">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-[13px] text-[#8E8E93]">${user.cashtag}</div>
        </div>
      </div>
      {showCheck && (
        <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
            selectedUser?.uid === user.uid
              ? 'bg-[#00D632] border-[#00D632]'
              : 'border-[#DDDDDD]'
          }`}
        >
          {selectedUser?.uid === user.uid && (
            <span className="text-white text-[10px] font-bold leading-none">&#10003;</span>
          )}
        </div>
      )}
    </button>
  );

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-[#E5E7EB] bg-white flex-shrink-0">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-[22px] cursor-pointer bg-transparent border-0 text-[#111111] leading-none"
          aria-label="Close"
        >
          &#x2715;
        </button>
        <div className="flex-1 text-center">
          <div className="text-[17px] font-bold text-[#111111]">${amount}</div>
          <div className="text-[12px] text-[#8E8E93]">Cash Balance &#9660;</div>
        </div>
        <button
          onClick={handleAdvance}
          className={`px-5 py-2 rounded-full font-semibold text-[15px] cursor-pointer border-0 transition-opacity ${
            selectedUser
              ? 'bg-[#00D632] text-white'
              : 'bg-[#00D632] text-white opacity-40'
          }`}
        >
          {transactionType}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto bg-white">
        {/* To row */}
        <div className="flex items-center px-5 py-[14px] border-b border-[#E5E7EB] gap-3">
          <span className="font-bold text-[15px] text-[#111111] w-9 flex-shrink-0">To</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-[15px] text-[#111111] placeholder-[#B3B3B7] bg-white min-w-0"
            placeholder="$Cashtag"
            value={inputValue}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {inputValue.length > 0 && (
            <button
              onClick={handleClearRecipient}
              className="w-6 h-6 rounded-full bg-[#C7C7CC] flex items-center justify-center flex-shrink-0 border-0 cursor-pointer"
              aria-label="Clear"
            >
              <span className="text-white text-[13px] leading-none font-bold">&#x2715;</span>
            </button>
          )}
        </div>

        {/* For row */}
        <div className="flex items-center px-5 py-[14px] border-b border-[#E5E7EB] gap-3">
          <span className="font-bold text-[15px] text-[#111111] w-9 flex-shrink-0">For</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-[15px] text-[#111111] placeholder-[#B3B3B7] bg-white min-w-0"
            placeholder="Add a note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Section label */}
        <div className="px-5 pt-4 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">
            {isTyping ? 'Search Results' : recentUsers.length > 0 ? 'Frequent' : ''}
          </span>
        </div>

        {/* Searching spinner */}
        {isSearching && (
          <div className="px-5 py-8 flex items-center justify-center gap-2 text-[#8E8E93]">
            <div className="w-4 h-4 border-2 border-[#00D632] border-t-transparent rounded-full animate-spin" />
            <span className="text-[14px]">Searching...</span>
          </div>
        )}

        {/* Search results */}
        {!isSearching && isTyping && searchResults.map((user) => (
          <UserRow key={user.uid} user={user} showCheck />
        ))}

        {/* No results */}
        {!isSearching && isTyping && showNoResults && (
          <div className="px-5 py-8 text-center text-[#8E8E93] text-[14px]">
            No users found for &quot;${inputValue.replace(/^\$/, '')}&quot;
          </div>
        )}

        {/* Recents when idle */}
        {!isTyping && recentUsers.map((user) => (
          <UserRow key={user.uid} user={user} />
        ))}

        {/* Empty idle state */}
        {!isTyping && recentUsers.length === 0 && (
          <div className="px-5 py-8 text-center text-[#8E8E93] text-[14px]">
            Search by $Cashtag to find someone
          </div>
        )}
      </div>
    </div>
  );
}
