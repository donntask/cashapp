'use client';

import { useState, useRef } from 'react';

const QUICK_LINKS = [
  { label: 'Google', url: 'https://www.google.com', icon: 'G' },
  { label: 'YouTube', url: 'https://m.youtube.com', icon: 'Y' },
  { label: 'Instagram', url: 'https://www.instagram.com', icon: 'I' },
  { label: 'X', url: 'https://x.com', icon: 'X' },
];

export default function BrowserPage({ onOpenProfile }: { onOpenProfile: () => void }) {
  const [inputUrl, setInputUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigate = (raw: string) => {
    let url = raw.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      // Treat as a search query if no TLD, else add https
      url = url.includes('.') ? `https://${url}` : `https://www.google.com/search?q=${encodeURIComponent(url)}`;
    }
    setLoadedUrl(url);
    setInputUrl(url);
    setIsLoading(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') navigate(inputUrl);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#F4F4F6]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-3 bg-white border-b border-[#E5E7EB] flex-shrink-0">
        {loadedUrl && (
          <button
            onClick={() => { setLoadedUrl(''); setInputUrl(''); }}
            className="text-[#111111] cursor-pointer border-0 bg-transparent p-1 flex-shrink-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex-1 flex items-center bg-[#F4F4F6] rounded-xl px-3 py-2 gap-2">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#8E8E93" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search or enter website"
            className="flex-1 bg-transparent text-[#111111] placeholder-[#8E8E93] text-sm outline-none"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
          {inputUrl && (
            <button onClick={() => setInputUrl('')} className="text-[#8E8E93] cursor-pointer border-0 bg-transparent">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={() => navigate(inputUrl)}
          className="text-[#00D632] font-semibold text-sm cursor-pointer border-0 bg-transparent flex-shrink-0"
        >
          Go
        </button>
      </div>

      {/* Content */}
      {!loadedUrl ? (
        <div className="flex-1 overflow-y-auto px-4 py-5">
          <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-wide mb-3">Quick Links</p>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.url)}
                className="flex flex-col items-center gap-1.5 cursor-pointer bg-transparent border-0"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-center text-lg font-bold text-[#111111] shadow-sm">
                  {link.icon}
                </div>
                <span className="text-xs text-[#8E8E93]">{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="w-8 h-8 border-2 border-[#00D632] border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={loadedUrl}
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="In-app browser"
          />
        </div>
      )}
    </div>
  );
}
