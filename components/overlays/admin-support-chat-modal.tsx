'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, Timestamp, doc } from 'firebase/firestore';
import { getDb } from '@/lib/firebase-config';
import { useAuth } from '@/contexts/auth-context';
import { sendAdminSupportReply, setTypingIndicator } from '@/lib/firestore-service';
import { useToast } from '@/contexts/toast-context';

interface Message {
  id: string;
  role: 'user' | 'admin';
  userName: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
}

interface AdminSupportChatModalProps {
  userId: string;
  userName: string;
  userCashtag: string;
  onClose: () => void;
}

export default function AdminSupportChatModal({ userId, userName, userCashtag, onClose }: AdminSupportChatModalProps) {
  const { authData } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [label, setLabel] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adminName = [authData.firstName, authData.lastName].filter(Boolean).join(' ') || 'Admin';

  // Real-time messages listener
  useEffect(() => {
    const db = getDb();
    const q = query(
      collection(db, 'supportMessages'),
      where('uid', '==', userId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const msgs: Message[] = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<Message, 'id'>) }))
        .sort((a, b) => (a.timestamp?.toMillis?.() ?? 0) - (b.timestamp?.toMillis?.() ?? 0));
      setMessages(msgs);
    });
    return () => unsub();
  }, [userId]);

  // Real-time typing indicator from user
  useEffect(() => {
    const db = getDb();
    const unsub = onSnapshot(doc(db, 'users', userId), (snap) => {
      if (snap.exists()) setUserTyping(!!snap.data().typing_user);
    });
    return () => unsub();
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, userTyping]);

  const handleInputChange = (val: string) => {
    setInput(val);
    setTypingIndicator(userId, 'admin', val.length > 0);
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => setTypingIndicator(userId, 'admin', false), 2000);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setInput('');
    setTypingIndicator(userId, 'admin', false);
    try {
      await sendAdminSupportReply(userId, text, adminName);
    } catch {
      addToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (ts: Timestamp) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/50">
      <div className="bg-white w-full max-w-[412px] h-[92vh] rounded-t-3xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#E5E7EB] flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F6] border-0 cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="w-9 h-9 rounded-full bg-[#00D632] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[#111111] text-sm leading-tight truncate">{userName}</p>
            <p className="text-xs text-[#8E8E93]">${userCashtag}</p>
            {label && <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">{label}</span>}
          </div>
          <button
            onClick={() => setShowSettings(s => !s)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F4F6] border-0 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2">
              <circle cx="12" cy="5" r="1" fill="#111" /><circle cx="12" cy="12" r="1" fill="#111" /><circle cx="12" cy="19" r="1" fill="#111" />
            </svg>
          </button>
        </div>

        {/* Chat settings panel */}
        {showSettings && (
          <div className="bg-[#F4F4F6] px-4 py-3 border-b border-[#E5E7EB] flex-shrink-0 space-y-2">
            <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide">Chat Settings</p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Add label (e.g. Urgent, Resolved)"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="flex-1 bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-sm text-[#111111] placeholder-[#C7C7CC] outline-none"
              />
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-2 bg-[#111111] text-white text-xs font-bold rounded-xl border-0 cursor-pointer"
              >
                Save
              </button>
            </div>
            <div className="flex gap-2">
              {['Urgent', 'Resolved', 'Pending', 'VIP'].map(l => (
                <button
                  key={l}
                  onClick={() => { setLabel(l); setShowSettings(false); }}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border cursor-pointer ${label === l ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-[#E5E7EB]'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-[#C7C7CC]">No messages yet from this user.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === 'admin' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'admin'
                  ? 'bg-[#111111] text-white rounded-br-sm'
                  : 'bg-[#F4F4F6] text-[#111111] rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
              <span className="text-[10px] text-[#C7C7CC] mt-0.5 px-1">
                {msg.role === 'admin' ? 'You' : userName} · {formatTime(msg.timestamp)}
              </span>
            </div>
          ))}

          {/* User is typing indicator */}
          {userTyping && (
            <div className="flex items-end gap-2">
              <div className="bg-[#F4F4F6] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-[#C7C7CC] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-[10px] text-[#C7C7CC]">{userName} is typing...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white border-t border-[#E5E7EB] px-4 py-3 pb-6 flex gap-2 items-end flex-shrink-0">
          <div className="flex-1 bg-[#F4F4F6] rounded-2xl px-4 py-2.5 min-h-[44px] flex items-center">
            <textarea
              className="w-full bg-transparent text-sm text-[#111111] placeholder-[#C7C7CC] resize-none border-0 outline-none leading-relaxed"
              placeholder={`Reply to ${userName}...`}
              rows={1}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              style={{ maxHeight: '80px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="w-10 h-10 rounded-full bg-[#00D632] flex items-center justify-center cursor-pointer border-0 disabled:opacity-40 flex-shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}


