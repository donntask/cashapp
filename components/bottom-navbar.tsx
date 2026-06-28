'use client';

interface BottomNavbarProps {
  activeTab: 'money' | 'card' | 'paypad' | 'search' | 'activity';
  onTabChange: (tab: 'money' | 'card' | 'paypad' | 'search' | 'activity') => void;
  isPayPadActive: boolean;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export default function BottomNavbar({
  activeTab,
  onTabChange,
  isPayPadActive,
  canGoBack = false,
  onGoBack,
}: BottomNavbarProps) {
  const navBg = isPayPadActive ? 'bg-[#00D632] border-t-[#00b029]' : 'bg-white border-t-[#E5E7EB]';

  const color = (tab: string) => {
    const isActive = activeTab === tab;
    if (isPayPadActive) return isActive ? 'text-white' : 'text-white/55';
    return isActive ? 'text-[#111111]' : 'text-[#B3B3B7]';
  };

  const dot = (tab: string) =>
    activeTab === tab ? (
      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isPayPadActive ? 'bg-white' : 'bg-[#111111]'}`} />
    ) : null;

  if (canGoBack) {
    return (
      <div className="h-[70px] bg-white border-t border-[#E5E7EB] flex items-center px-6 z-50">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-[#111111] font-semibold cursor-pointer bg-transparent border-0 text-base"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className={`h-[70px] ${navBg} border-t flex justify-around items-center z-50 pb-1`}>

      {/* Money */}
      <button
        onClick={() => onTabChange('money')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative ${color('money')}`}
      >
        <span className="text-base font-bold leading-none">$</span>
        {dot('money')}
      </button>

      {/* Card */}
      <button
        onClick={() => onTabChange('card')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative ${color('card')}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        {dot('card')}
      </button>

      {/* PayPad — centre featured button */}
      <button
        onClick={() => onTabChange('paypad')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative ${color('paypad')}`}
      >
        <div className="w-14 h-14 rounded-full bg-[#00D632] border-2 border-[#00D632] flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        {dot('paypad')}
      </button>

      {/* Search / Discovery */}
      <button
        onClick={() => onTabChange('search')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative ${color('search')}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        {dot('search')}
      </button>

      {/* Activity */}
      <button
        onClick={() => onTabChange('activity')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer relative ${color('activity')}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {dot('activity')}
      </button>

    </div>
  );
}
