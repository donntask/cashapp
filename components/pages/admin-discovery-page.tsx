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
  const [fundAmount, setFundAmount] = useState('');

  // AI email compose state
  const [emailPrompt, setEmailPrompt] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStep, setEmailStep] = useState<'prompt' | 'preview'>('prompt');

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

      if (found.length === 0) {
        const lower = rawTerm.toLowerCase();
        console.log('[v0] Admin search: exact match failed, trying range lower=', lower);
        const snap = await getDocs(query(usersRef, where('cashtag', '>=', lower), where('cashtag', '<=', lower + '\uf8ff')));
        console.log('[v0] Admin search: lowercase range -> docs =', snap.size);
        snap.forEach((docSnap) => {
          if (seenIds.has(docSnap.id)) return;
          seenIds.add(docSnap.id);
          const d = docSnap.data();
          found.push({ uid: docSnap.id, firstName: d.firstName || '', lastName: d.lastName || '', cashtag: d.cashtag || '', email: d.email || '', isAdmin: d.isAdmin || false, isBlocked: d.isBlocked || false });
        });
        if (found.length === 0) {
          const titleTerm = rawTerm.charAt(0).toUpperCase() + rawTerm.slice(1).toLowerCase();
          console.log('[v0] Admin search: trying Title-case range titleTerm=', titleTerm);
          const snap2 = await getDocs(query(usersRef, where('cashtag', '>=', titleTerm), where('cashtag', '<=', titleTerm + '\uf8ff')));
          console.log('[v0] Admin search: Title-case range -> docs =', snap2.size);
          snap2.forEach((docSnap) => {
            if (seenIds.has(docSnap.id)) return;
            seenIds.add(docSnap.id);
            const d = docSnap.data();
            found.push({ uid: docSnap.id, firstName: d.firstName || '', lastName: d.lastName || '', cashtag: d.cashtag || '', email: d.email || '', isAdmin: d.isAdmin || false, isBlocked: d.isBlocked || false });
          });
        }
      }

      console.log('[v0] Admin search: final results =', found.length, found);
      if (found.length === 0) addToast('No users found for that cashtag', 'error');
      setResults(found);
    } catch (err) {
      console.error('[v0] Admin search error:', err);
      addToast('Search failed. Please try again.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // --- AI email handlers ---
  const handleGenerateEmail = async () => {
    if (!emailPrompt.trim() || !selectedUser) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/admin/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: emailPrompt,
          recipientName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
          recipientEmail: selectedUser.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.error || 'Failed to generate email', 'error');
        return;
      }
      setEmailBody(data.emailBody);
      if (!emailSubject) setEmailSubject('Important Notice from Cash App');
      setEmailStep('preview');
    } catch (err) {
      console.error('[v0] generate-email error:', err);
      addToast('Failed to generate email', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailBody.trim()) return;
    setIsSendingEmail(true);
    try {
      const res = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: selectedUser.email,
          recipientName: `${selectedUser.firstName} ${selectedUser.lastName}`.trim(),
          subject: emailSubject || 'Important Notice from Cash App',
          emailBody,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.error || 'Failed to send email', 'error');
        return;
      }
      addToast(`Email sent to ${selectedUser.email}`, 'success');
      resetAction();
    } catch (err) {
      console.error('[v0] send-email error:', err);
      addToast('Failed to send email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // --- Other actions ---
  const executeAction = async () => {
    if (!selectedUser || !activeAction) return;
    setIsActing(true);
    try {
      if (activeAction === 'make_admin' || activeAction === 'remove_admin') {
        const res = await fetch('/api/admin/super-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminEmail: authData.email, targetUserId: selectedUser.uid, action: activeAction }),
        });
        const data = await res.json();
        data.success ? addToast(data.message, 'success') : addToast(data.error || 'Action failed', 'error');
        if (data.success) resetAction();
        return;
      }
      if (activeAction === 'fund_user') {
        const parsed = parseFloat(fundAmount);
        if (!parsed || parsed <= 0) { addToast('Enter a valid amount', 'error'); return; }
        const { fundUserAccount } = await import('@/lib/firestore-service');
        await fundUserAccount(selectedUser.uid, parsed);
        addToast(`Funded $${parsed.toFixed(2)} to $${selectedUser.cashtag}`, 'success');
        resetAction();
        return;
      }
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeAction, userId: selectedUser.uid, adminId: authData.email, reason, amount: activeAction === 'request_fee' ? parseFloat(feeAmount) : undefined }),
      });
      const data = await res.json();
      data.success ? addToast('Action completed', 'success') : addToast(data.error || 'Action failed', 'error');
      if (data.success) resetAction();
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
    setFundAmount('');
    setEmailPrompt('');
    setEmailSubject('');
    setEmailBody('');
    setEmailStep('prompt');
  };

  const actions = [
    { id: 'fund_user',          label: 'Fund Account',        color: 'hover:bg-[#E6FFF0]', textColor: 'text-[#00D632]' },
    { id: 'block_account',      label: 'Block Account',       color: 'hover:bg-red-50',    textColor: 'text-red-600' },
    { id: 'block_transaction',  label: 'Block Transactions',  color: 'hover:bg-orange-50', textColor: 'text-orange-600' },
    { id: 'send_email',         label: 'Send Email',          color: 'hover:bg-blue-50',   textColor: 'text-blue-600' },
    { id: 'request_fee',        label: 'Request Fee',         color: 'hover:bg-[#F4F4F6]', textColor: 'text-[#111111]' },
    ...(isSuperAdmin ? [
      { id: 'make_admin',   label: 'Make Sub-Admin',  color: 'hover:bg-[#F4F4F6]', textColor: 'text-[#111111]' },
      { id: 'remove_admin', label: 'Remove Admin',    color: 'hover:bg-red-50',    textColor: 'text-red-600' },
    ] : []),
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#F4F4F6]">
      {/* Header */}
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

      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center bg-white border border-[#E5E7EB] rounded-xl px-3 gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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

        {/* Results */}
        {results.length > 0 && !selectedUser && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Results</p>
            {results.map((user) => (
              <button
                key={user.uid}
                onClick={() => setSelectedUser(user)}
                className="w-full bg-white rounded-2xl px-4 py-3 flex items-center gap-3 border border-[#E5E7EB] cursor-pointer text-left"
              >
                <div className="w-10 h-10 rounded-full bg-[#00D632] flex items-center justify-center text-white font-bold flex-shrink-0">
                  {user.firstName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#111111] truncate">{user.firstName} {user.lastName}</p>
                  <p className="text-sm text-[#8E8E93]">${user.cashtag}</p>
                </div>
                {user.isAdmin && <span className="text-xs font-bold text-[#00D632] bg-[#E6FFF0] px-2 py-0.5 rounded-full">Admin</span>}
                {user.isBlocked && <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Blocked</span>}
              </button>
            ))}
          </div>
        )}

        {/* Selected user panel */}
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
                <p className="text-xs text-[#B3B3B7] truncate">{selectedUser.email}</p>
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

            {/* --- Send Email action — AI compose flow --- */}
            {activeAction === 'send_email' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-[#111111]">Send Email</p>
                  <span className="text-xs text-[#8E8E93]">{selectedUser.email}</span>
                </div>

                {emailStep === 'prompt' && (
                  <>
                    {/* Subject */}
                    <div>
                      <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Subject</label>
                      <input
                        type="text"
                        placeholder="Important Notice from Cash App"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none"
                      />
                    </div>

                    {/* Prompt */}
                    <div>
                      <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Admin Prompt</label>
                      <textarea
                        placeholder={'e.g. "This account has been flagged for suspicious activity. Advise user to verify identity within 48 hours or account will be suspended."'}
                        value={emailPrompt}
                        onChange={(e) => setEmailPrompt(e.target.value)}
                        rows={4}
                        className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none resize-none"
                      />
                      <p className="text-xs text-[#B3B3B7] mt-1">
                        Describe what the email should say. AI will write a professional Cash App email addressed to {selectedUser.firstName}.
                      </p>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={resetAction}
                        className="flex-1 h-11 border border-[#E5E7EB] rounded-full font-semibold text-[#111111] cursor-pointer bg-transparent text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleGenerateEmail}
                        disabled={isGenerating || !emailPrompt.trim()}
                        className="flex-1 h-11 bg-[#111111] text-white rounded-full font-bold cursor-pointer disabled:opacity-40 text-sm flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Generating...
                          </>
                        ) : 'Generate with AI'}
                      </button>
                    </div>
                  </>
                )}

                {emailStep === 'preview' && (
                  <>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEmailStep('prompt')}
                        className="text-[#8E8E93] cursor-pointer border-0 bg-transparent p-0 flex items-center gap-1 text-xs"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Back
                      </button>
                      <span className="text-xs text-[#8E8E93]">Review and edit before sending</span>
                    </div>

                    {/* Editable subject */}
                    <div>
                      <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Subject</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] text-sm outline-none font-medium"
                      />
                    </div>

                    {/* Editable body */}
                    <div>
                      <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Email Body</label>
                      <textarea
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        rows={10}
                        className="mt-1 w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] text-sm outline-none resize-none leading-relaxed"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={resetAction}
                        className="flex-1 h-11 border border-[#E5E7EB] rounded-full font-semibold text-[#111111] cursor-pointer bg-transparent text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendEmail}
                        disabled={isSendingEmail || !emailBody.trim()}
                        className="flex-1 h-11 bg-[#00D632] text-white rounded-full font-bold cursor-pointer disabled:opacity-40 text-sm flex items-center justify-center gap-2"
                      >
                        {isSendingEmail ? (
                          <>
                            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Sending...
                          </>
                        ) : 'Send Email'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Other action forms */}
            {activeAction && activeAction !== 'send_email' && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 space-y-3">
                <p className="font-bold text-[#111111]">{actions.find(a => a.id === activeAction)?.label}</p>

                {activeAction === 'fund_user' && (
                  <input type="number" placeholder="Amount ($)" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] outline-none" />
                )}

                {(activeAction === 'block_account' || activeAction === 'block_transaction') && (
                  <textarea placeholder="Reason for blocking..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                    className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none resize-none" />
                )}

                {activeAction === 'request_fee' && (
                  <div className="space-y-2">
                    <input type="number" placeholder="Fee amount ($)" value={feeAmount} onChange={(e) => setFeeAmount(e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] outline-none" />
                    <textarea placeholder="Reason..." value={reason} onChange={(e) => setReason(e.target.value)} rows={2}
                      className="w-full border border-[#E5E7EB] rounded-xl px-3 py-2 text-[#111111] placeholder-[#8E8E93] text-sm outline-none resize-none" />
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
                  <button onClick={resetAction}
                    className="flex-1 h-11 border border-[#E5E7EB] rounded-full font-semibold text-[#111111] cursor-pointer bg-transparent text-sm">
                    Cancel
                  </button>
                  <button onClick={executeAction} disabled={isActing}
                    className="flex-1 h-11 bg-[#00D632] text-white rounded-full font-bold cursor-pointer disabled:opacity-50 text-sm">
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
