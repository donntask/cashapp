'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';

interface AdminActionsOverlayProps {
  onClose: () => void;
  isOpen: boolean;
}

interface User {
  uid: string;
  firstName: string;
  lastName: string;
  cashtag: string;
  email: string;
  isAdmin?: boolean;
}

export default function AdminActionsOverlay({ onClose, isOpen }: AdminActionsOverlayProps) {
  const { verifiedEmail } = useAuth();
  const { addToast } = useToast();
  
  const [searchCashtag, setSearchCashtag] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [action, setAction] = useState<'block_account' | 'block_transaction' | 'send_notification' | 'request_fee' | 'make_admin' | 'remove_admin' | null>(null);
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Check if current user is super admin
  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (!verifiedEmail) return;
      try {
        const response = await fetch('/api/admin/super-admin', {
          method: 'GET',
          headers: { 'x-user-email': verifiedEmail },
        });
        const data = await response.json();
        setIsSuperAdmin(data.isSuperAdmin || false);
      } catch (error) {
        console.error('[v0] Failed to check super admin status:', error);
        setIsSuperAdmin(false);
      }
    };
    
    checkSuperAdmin();
  }, [verifiedEmail]);

  const handleSearch = async () => {
    if (!searchCashtag.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashtag: searchCashtag }),
      });

      const data = await response.json();
      if (data.success && data.users) {
        setSearchResults(data.users);
      }
    } catch (error) {
      console.error('[v0] Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedUser || !action) return;

    setIsLoading(true);
    try {
      // Handle admin management actions
      if (action === 'make_admin' || action === 'remove_admin') {
        if (!isSuperAdmin) {
          addToast('Only the super admin can manage admin roles', 'error');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/admin/super-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            adminEmail: verifiedEmail,
            targetUserId: selectedUser.uid,
            action: action === 'make_admin' ? 'make_admin' : 'remove_admin',
          }),
        });

        const data = await response.json();
        if (data.success) {
          addToast(data.message, 'success');
          setSelectedUser(null);
          setAction(null);
          setReason('');
          setAmount('');
          setMessage('');
        } else {
          addToast(data.error || 'Action failed', 'error');
        }
      } else {
        // Handle other admin actions
        const response = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: action,
            userId: selectedUser.uid,
            adminId: 'current_admin',
            reason,
            amount: action === 'request_fee' ? parseFloat(amount) : undefined,
            details: message,
          }),
        });

        const data = await response.json();
        if (data.success) {
          addToast(`Action completed: ${action}`, 'success');
          setSelectedUser(null);
          setAction(null);
          setReason('');
          setAmount('');
          setMessage('');
        } else {
          addToast(data.error || 'Failed to execute action', 'error');
        }
      }
    } catch (error) {
      console.error('[v0] Action error:', error);
      addToast('Failed to execute action', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-end">
      <div className="bg-white w-full max-h-96 rounded-t-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#E5E7EB] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[#111111]">Admin Actions</h2>
          <button onClick={onClose} className="text-2xl cursor-pointer bg-none border-0 text-[#8E8E93]">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {!selectedUser ? (
            <>
              {/* Search Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-[#111111]">Search User by Cashtag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter cashtag"
                    value={searchCashtag}
                    onChange={(e) => setSearchCashtag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] placeholder-[#B3B3B7]"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="px-4 py-2 bg-[#00D632] text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#111111]">Results</label>
                  {searchResults.map((user) => (
                    <button
                      key={user.uid}
                      onClick={() => setSelectedUser(user)}
                      className="w-full text-left p-3 border border-[#E5E7EB] rounded-lg hover:bg-[#F4F4F6] cursor-pointer"
                    >
                      <div className="font-semibold text-[#111111]">{user.firstName} {user.lastName}</div>
                      <div className="text-xs text-[#8E8E93]">${user.cashtag}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Selected User Info */}
              <div className="p-3 bg-[#F4F4F6] rounded-lg">
                <div className="font-semibold text-[#111111]">{selectedUser.firstName} {selectedUser.lastName}</div>
                <div className="text-xs text-[#8E8E93]">${selectedUser.cashtag}</div>
              </div>

              {/* Action Selection */}
              {!action ? (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-[#111111]">Select Action</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAction('block_account')}
                      className="p-3 border border-[#E5E7EB] rounded-lg hover:bg-red-50 text-sm font-semibold text-[#111111] cursor-pointer"
                    >
                      Block Account
                    </button>
                    <button
                      onClick={() => setAction('block_transaction')}
                      className="p-3 border border-[#E5E7EB] rounded-lg hover:bg-orange-50 text-sm font-semibold text-[#111111] cursor-pointer"
                    >
                      Block Transactions
                    </button>
                    <button
                      onClick={() => setAction('send_notification')}
                      className="p-3 border border-[#E5E7EB] rounded-lg hover:bg-blue-50 text-sm font-semibold text-[#111111] cursor-pointer"
                    >
                      Send Notification
                    </button>
                    <button
                      onClick={() => setAction('request_fee')}
                      className="p-3 border border-[#E5E7EB] rounded-lg hover:bg-green-50 text-sm font-semibold text-[#111111] cursor-pointer"
                    >
                      Request Fee
                    </button>
                    
                    {/* Admin management buttons - only for super admin */}
                    {isSuperAdmin && (
                      <>
                        <button
                          onClick={() => setAction('make_admin')}
                          className="p-3 border border-[#E5E7EB] rounded-lg hover:bg-purple-50 text-sm font-semibold text-[#111111] cursor-pointer"
                        >
                          Make Admin
                        </button>
                        <button
                          onClick={() => setAction('remove_admin')}
                          className="p-3 border border-[#E5E7EB] rounded-lg hover:bg-purple-50 text-sm font-semibold text-[#111111] cursor-pointer"
                        >
                          Remove Admin
                        </button>
                      </>
                    )}
                  </div>
                  
                  {isSuperAdmin && (
                    <div className="text-xs text-[#00D632] font-semibold">Super Admin Mode - You can manage admin roles</div>
                  )}
                </div>
              ) : (
                <>
                  {/* Action Form */}
                  <div className="space-y-3">
                    {(action === 'block_account' || action === 'block_transaction') && (
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-1">Reason</label>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Explain the reason for this action"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] placeholder-[#B3B3B7] text-sm"
                          rows={3}
                        />
                      </div>
                    )}

                    {action === 'send_notification' && (
                      <div>
                        <label className="block text-sm font-semibold text-[#111111] mb-1">Message</label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Enter notification message"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] placeholder-[#B3B3B7] text-sm"
                          rows={3}
                        />
                      </div>
                    )}

                    {action === 'request_fee' && (
                      <>
                        <div>
                          <label className="block text-sm font-semibold text-[#111111] mb-1">Amount ($)</label>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] placeholder-[#B3B3B7]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-[#111111] mb-1">Reason</label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason for fee request"
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-[#111111] placeholder-[#B3B3B7] text-sm"
                            rows={2}
                          />
                        </div>
                      </>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setAction(null)}
                        className="flex-1 px-4 py-2 border border-[#E5E7EB] text-[#111111] font-semibold rounded-lg cursor-pointer hover:bg-[#F4F4F6]"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleExecuteAction}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-[#00D632] text-white font-semibold rounded-lg cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? 'Processing...' : 'Execute'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Back Button */}
              {!action && (
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full px-4 py-2 border border-[#E5E7EB] text-[#111111] font-semibold rounded-lg cursor-pointer hover:bg-[#F4F4F6]"
                >
                  Back to Search
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
