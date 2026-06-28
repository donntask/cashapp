'use client';

import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-config';
import { useAuth, SUPER_ADMIN_EMAIL } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';

interface FoundUser {
  uid: string;
  firstName: string;
  lastName: string;
  cashtag: string;
  email: string;
  isAdmin?: boolean;
  isBlocked?: boolean;
}

interface AdminDiscoveryPageProps {
  onOpenProfile: () => void;
}

export default function AdminDiscoveryPage({ onOpenProfile }: AdminDiscoveryPageProps) {
  const { authData } = useAuth();
  const { addToast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<FoundUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isActing, setIsActing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [feeAmount, setFeeAmount] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [fundAmount, setFundAmount] = useState('');

  const isSuperAdmin = authData.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setResults([]);
    setSelectedUser(null);

    try {
      const db = getDb();
      console.log('[v0] Admin search: db instance =', typeof db, db);
      const usersRef = collection(db, 'users');

      // Build case variants to handle any capitalisation stored at registration
      const rawTerm = searchTerm.replace(/^\$/, '').trim();
      console.log('[v0] Admin search: rawTerm =', rawTerm);
      const variants = Array.from(new Set([
        rawTerm,
        rawTerm.toLowerCase(),
        rawTerm.toUpperCase(),
        rawTerm.charAt(0).toUpperCase() + rawTerm.slice(1).toLowerCase(),
        rawTerm.charAt(0).toLowerCase() + rawTerm.slice(1),
      ]));
      console.log('[v0] Admin search: trying exact variants =', variants);

      const seenIds = new Set<string>();
      const found: FoundUser[] = [];

      for (const v of variants) {
        console.log('[v0] Admin search: querying cashtag ==', v);
        const snap = await getDocs(query(usersRef, where('cashtag', '==', v)));
        console.log('[v0] Admin search: variant', v, '-> docs found =', snap.size);
        snap.forEach((docSnap) => {
          if (seenIds.has(docSnap.id)) return;
          seenIds.add(docSnap.id);
          const d = docSnap.data();
          console.log('[v0] Admin search: matched doc =', { id: docSnap.id, data: d });
          found.push({ uid: docSnap.id, firstName: d.firstName || '', lastName: d.lastName || '', cashtag: d.cashtag || '', email: d.email || '', isAdmin: d.isAdmin || false, isBlocked: d.isBlocked || false });
        });
        if (found.length > 0) break;
      }

      // Fallback: range query (handles partial prefix)
      if (found.length === 0) {
        const lower = rawTerm.toLowerCase();
        console.log('[v0] Admin search: exact match failed, trying range query lower=', lower);
        const snap = await getDocs(query(usersRef, where('cashtag', '>=', lower), where('cashtag', '<=', lower + '\uf8ff')));
        console.log('[v0] Admin search: lowercase range -> docs =', snap.size);
        snap.forEach((docSnap) => {
          if (seenIds.has(docSnap.id)) return;
          seenIds.add(docSnap.id);
          const d = docSnap.data();
          console.log('[v0] Admin search: range matched doc =', { id: docSnap.id, cashtag: d.cashtag });
          found.push({ uid: docSnap.id, firstName: d.firstName || '', lastName: d.lastName || '', cashtag: d.cashtag || '', email: d.email || '', isAdmin: d.isAdmin || false, isBlocked: d.isBlocked || false });
        });
        // Also try Title-case prefix
        if (found.length === 0) {
          const titleTerm = rawTerm.charAt(0).toUpperCase() + rawTerm.slice(1).toLowerCase();
          console.log('[v0] Admin search: trying Title-case range query titleTerm=', titleTerm);
          const snap2 = await getDocs(query(usersRef, where('cashtag', '>=', titleTerm), where('cashtag', '<=', titleTerm + '\uf8ff')));
          console.log('[v0] Admin search: Title-case range -> docs =', snap2.size);
          snap2.forEach((docSnap) => {
            if (seenIds.has(docSnap.id)) return;
            seenIds.add(docSnap.id);
            const d = docSnap.data();
            console.log('[v0] Admin search: title-range matched doc =', { id: docSnap.id, cashtag: d.cashtag });
            found.push({ uid: docSnap.id, firstName: d.firstName || '', lastName: d.lastName || '', cashtag: d.cashtag || '', email: d.email || '', isAdmin: d.isAdmin || false, isBlocked: d.isBlocked || false });
          });
        }
      }

      console.log('[v0] Admin search: final results count =', found.length, found);
      if (found.length === 0) {
        addToast('No users found for that cashtag', 'error');
      }
      setResults(found);
    } catch (err) {
      console.error('[v0] Admin search error:', err);
      addToast('Search failed. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const executeAction = async () => {
    if (!selectedUser || !activeAction) return;
    setIsActing(true);

    try {
      if (activeAction === 'make_admin' || activeAction === 'remove_admin') {
        const res = await fetch('/api/admin/super-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: authData.email,
            targetUserId: selectedUser.uid,
            action: activeAction,
          }),
        });
        const data = await res.json();
        if (data.success) {
          addToast(data.message, 'success');
          resetAction();
        } else {
          addToast(data.error || 'Action failed', 'error');
        }
        return;
      }

      if (activeAction === 'fund_user') {
        const parsed = parseFloat(fundAmount);
        if (!parsed || parsed <= 0) {
          addToast('Enter a valid amount', 'error');
          setIsActing(false);
          return;
        }
        const { fundUserAccount } = await import('@/lib/firestore-service');
        await fundUserAccount(selectedUser.uid, parsed);
        addToast(`Funded $${parsed.toFixed(2)} to $${selectedUser.cashtag}`, 'success');
        resetAction();
        return;
      }

      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeAction,
          userId: selectedUser.uid,
          adminId: authData.email,
          reason,
          amount: activeAction === 'request_fee' ? parseFloat(feeAmount) : undefined,
          details: notifMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Action completed successfully', 'success');
        resetAction();
      } else {
        addToast(data.error || 'Action failed', 'error');
      }
    } catch (err) {
      console.error('[v0] Admin action error:', err);
      addToast('Failed to execute action', 'error');
    } finally {
      setIsActing(false);
    }
  };

  const resetAction = () => {
    setActiveAction(null);
    setReason('');
    setFeeAmount('');
    setNotifMessage('');
    setFundAmount('');
  };

  const actions = [
    { id: 'fund_user', label: 'Fund Account', color: 'hover:bg-[#E6FFF0]', textColor: 'text-[#00D632]' },
    { id: 'block_account', label: 'Block Account', color: 'hover:bg-red-50', textColor: 'text-red-600' },
    { id: 'block_transaction', label: 'Block Transactions', color: 'hover:bg-orange-50', textColor: 'text-orange-600' },
    { id: 'send_notification', label: 'Send Notification', color: 'hover:bg-blue-50', textColor: 'text-blue-600' },
    { id: 'request_fee', label: 'Request Fee', color: 'hover:bg-[#F4F4F6]', textColor: 'text-[#111111]' },
    ...(isSuperAdmin ? [
      { id: 'make_admin', label: 'Make Sub-Admin', color: 'hover:bg-[#F4F4F6]', textColor: 'text-[#111111]' },
      { id: 'remove_admin', label: 'Remove Admin', color: 'hover:bg-red-50', textColor: 'text-red-600' },
    ] : []),
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#F4F4F6]">
      {/* Header — matches MoneyPage / ActivityPage style */}
      <div className="flex justify-between items-center px-4 py-4 flex-shrink-0">
        <h1 className="text-3xl font-bold text-[#111111]">Users</h1>
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-[#E5E7EB] cursor-pointer border border-black/5 flex items-center justify-center text-[#111111]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Search bar */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white border border-[#E5E7EB] rounded-xl px-3 gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by $cashtag"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              autoCapitalize="none"
              autoCorrect="off"
              className="flex-1 py-3 bg-transparent text-[#111111] placeholder-[#8E8E93] text-base outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-3 bg-[#00D632] text-white font-bold rounded-xl cursor-pointer disabled:opacity-50 text-sm"
          >
            {isSearching ? '...' : 'Find'}
          </button>
        </div>

        {/* Results list */}
        {results.length > 0 && !selectedUser && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Results</p>
            {results.map((user) => (
              <button
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-[#E5E7EB] cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#00D632] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {user.firstName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111111] truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-[#8E8E93]">${user.cashtag}</p>
                </div>
                {user.isAdmin && (
                  <span className="text-xs font-bold text-[#00D632] bg-[#E6FFF0] px-2 py-0.5 rounded-full">Admin</span>
                )}
                {user.isBlocked && (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Blocked</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Selected user — action panel */}
        {selectedUser && (
          <div className="space-y-4">
            {/* User card */}
            <div className="bg-white rounded-2xl px-4 py-4 border border-[#E5E7EB] flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#00D632] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {selectedUser.firstName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#111111]">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-sm text-[#8E8E93]">${selectedUser.cashtag}</p>
                <p className="text-xs text-[#B3B3B7]">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => { setSelectedUser(null); resetAction(); }}
                className="text-[#8E8E93] cursor-pointer border-0 bg-transparent p-1"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Action grid */}
            {!activeAction && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {actions.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setActiveAction(a.id)}
                      className={`bg-white border border-[#E5E7EB] rounded-2xl p-3 text-left cursor-pointer ${a.color} transition-colors`}
                    >
                      <p className={`font-semibold text-sm ${a.textColor}`}>{a.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action form */}
            {activeAction && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
                <p className="font-bold text-[#111111]">{actions.find(a => a.id === activeAction)?.label}</p>

                {activeAction === 'fund_user' && (
                  <input
                    type="number"
                    placeholder="Amount ($)"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] outline-none"
                  />
                )}

                {(activeAction === 'block_account' || activeAction === 'block_transaction') && (
                  <textarea
                    placeholder="Reason for blocking..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none resize-none"
                  />
                )}

                {activeAction === 'send_notification' && (
                  <textarea
                    placeholder="Notification message..."
                    value={notifMessage}
                    onChange={(e) => setNotifMessage(e.target.value)}
                    rows={3}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none resize-none"
                  />
                )}

                {activeAction === 'request_fee' && (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Fee amount ($)"
                      value={feeAmount}
                      onChange={(e) => setFeeAmount(e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] outline-none"
                    />
                    <textarea
                      placeholder="Reason..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none resize-none"
                    />
                  </div>
                )}

                {(activeAction === 'make_admin' || activeAction === 'remove_admin') && (
                  <p className="text-sm text-[#8E8E93]">
                    {activeAction === 'make_admin'
                      ? `Grant admin privileges to ${selectedUser.firstName}?`
                      : `Remove admin privileges from ${selectedUser.firstName}?`}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={resetAction}
                    className="flex-1 h-11 border border-[#E5E7EB] rounded-full font-semibold text-[#111111] cursor-pointer bg-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAction}
                    disabled={isActing}
                    className="flex-1 h-11 bg-[#00D632] text-white rounded-full font-bold cursor-pointer disabled:opacity-50"
                  >
                    {isActing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !selectedUser && !isSearching && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-16 h-16 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="text-[#8E8E93] font-medium text-sm">Search for a user by cashtag</p>
          </div>
        )}
      </div>
    </div>
  );
}
