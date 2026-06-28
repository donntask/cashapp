'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { sendSupportMessage } from '@/lib/firestore-service';
import { useToast } from '@/contexts/toast-context';

interface Message {
  id: string;
  role: 'user' | 'support';
  text: string;
  time: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'support',
  text: "Hi! Welcome to Cash App Support. How can we help you today? Our team typically responds within a few minutes.",
  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

interface SupportChatOverlayProps {
  onClose: () => void;
}

export default function SupportChatOverlay({ onClose }: SupportChatOverlayProps) {
  const { authData, userId } = useAuth();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const userName = [authData.firstName, authData.lastName].filter(Boolean).join(' ') || 'User';

  const autoResponses = [
    "Thanks for reaching out! A support agent will be with you shortly.",
    "We've received your message and are looking into this for you.",
    "Our team is reviewing your case. We'll follow up via email as well.",
    "Could you please provide more details so we can assist you better?",
    "Your issue has been escalated to our specialist team.",
  ];

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(scrollToBottom, [messages, agentTyping]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text, time: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsSending(true);
    setAgentTyping(true);

    try {
      if (userId) await sendSupportMessage(userId, text, userName);
    } catch {
      // non-blocking
    }

    // Simulate agent reply
    const delay = 1500 + Math.random() * 1500;
    setTimeout(() => {
      const reply = autoResponses[Math.floor(Math.random() * autoResponses.length)];
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAgentTyping(false);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'support', text: reply, time: replyTime }]);
      setIsSending(false);
    }, delay);
  };

  return (
    <div className="absolute inset-0 bg-[#F4F4F6] z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center gap-3 border-b border-[#E5E7EB]">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F4F4F6] cursor-pointer border-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-[#00D632] flex items-center justify-center text-white font-bold text-sm">
              CS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#111111]">Cash App Support</p>
            <p className="text-xs text-green-500 font-medium">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            {msg.role === 'support' && (
              <div className="w-6 h-6 rounded-full bg-[#00D632] flex items-center justify-center text-white text-[10px] font-bold mb-1">
                CS
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
              msg.role === 'user'
                ? 'bg-[#00D632] text-white rounded-br-sm'
                : 'bg-white text-[#111111] rounded-bl-sm shadow-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
            <span className="text-[10px] text-[#C7C7CC] mt-1 px-1">{msg.time}</span>
          </div>
        ))}

        {agentTyping && (
          <div className="flex flex-col items-start gap-1">
            <div className="w-6 h-6 rounded-full bg-[#00D632] flex items-center justify-center text-white text-[10px] font-bold">
              CS
            </div>
            <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1.5 items-center">
              {[0,1,2].map((i) => (
                <div key={i} className="w-2 h-2 bg-[#C7C7CC] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#E5E7EB] px-4 py-3 flex gap-2 items-end pb-8">
        <div className="flex-1 bg-[#F4F4F6] rounded-2xl px-4 py-2.5 min-h-[44px] flex items-center">
          <textarea
            className="w-full bg-transparent text-sm text-[#111111] placeholder-[#C7C7CC] resize-none border-0 outline-none leading-relaxed"
            placeholder="Message support..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            style={{ maxHeight: '96px' }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="w-10 h-10 rounded-full bg-[#00D632] flex items-center justify-center cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
