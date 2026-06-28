'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { getInviteCount } from '@/lib/firestore-service';
import { useToast } from '@/contexts/toast-context';

interface InviteOverlayProps {
  onClose: () => void;
}

export default function InviteOverlay({ onClose }: InviteOverlayProps) {
  const { authData, userId } = useAuth();
  const { addToast } = useToast();
  const [inviteCount, setInviteCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://cash.app/app/${authData.cashtag || 'user'}`;
  const reward = inviteCount * 15;

  useEffect(() => {
    if (!userId) return;
    getInviteCount(userId).then(setInviteCount);
  }, [userId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      addToast('Invite link copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Could not copy link', 'error');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Join me on Cash App', text: `Use my link to join Cash App and we both get $15!`, url: inviteLink });
      } else {
        handleCopy();
      }
    } catch {}
  };

  return (
    <div className="absolute inset-0 bg-[#F4F4F6] z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-5 pt-12 pb-4 border-b border-[#E5E7EB] flex-shrink-0">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F4F4F6] cursor-pointer border-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-base font-bold text-[#111111]">Invite Friends</span>
        <div className="w-9" />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-8">

      {/* Hero */}
      <div className="bg-[#00D632] mx-4 mt-5 rounded-3xl p-6 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <p className="text-2xl font-black text-white">Give $15, Get $15</p>
        <p className="text-sm text-white/80 text-center mt-1 leading-relaxed">
          Invite friends to Cash App. When they send their first $5, you both get $15.
        </p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 px-4 mt-4">
        <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col items-center">
          <span className="text-2xl font-black text-[#111111]">{inviteCount}</span>
          <span className="text-xs text-[#8E8E93] mt-0.5">Friends Invited</span>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col items-center">
          <span className="text-2xl font-black text-[#00D632]">${reward}</span>
          <span className="text-xs text-[#8E8E93] mt-0.5">Total Earned</span>
        </div>
      </div>

      {/* Invite link */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide mb-2">Your invite link</p>
          <div className="flex items-center gap-2 bg-[#F4F4F6] rounded-xl px-3 py-2.5">
            <span className="text-sm text-[#111111] flex-1 truncate">{inviteLink}</span>
            <button
              onClick={handleCopy}
              className="text-xs font-bold text-[#00D632] cursor-pointer border-0 bg-transparent flex-shrink-0"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-3">
        <button
          onClick={handleShare}
          className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer"
        >
          Share Invite Link
        </button>
      </div>

      {/* Steps */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide">How it works</p>
          {[
            'Share your invite link with a friend',
            'They sign up and send their first $5',
            'You both receive $15 automatically',
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#00D632] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{i + 1}</div>
              <p className="text-sm text-[#111111]">{step}</p>
            </div>
          ))}
        </div>
      </div>

      </div>{/* end scrollable */}
    </div>
  );
}
