'use client';

interface BottomNavbarProps {
  activeTab: 'money' | 'paypad' | 'activity' | 'users';
  onTabChange: (tab: 'money' | 'paypad' | 'activity' | 'users') => void;
  isPayPadActive: boolean;
  canGoBack?: boolean;
  onGoBack?: () => void;
  isAdmin?: boolean;
}

export default function BottomNavbar({ activeTab, onTabChange, isPayPadActive, canGoBack = false, onGoBack, isAdmin = false }: BottomNavbarProps) {
  const navStyle = isPayPadActive
    ? 'bg-[#00D632] border-t-[#00b029]'
    : 'bg-white border-t-[#E5E7EB]';

  const getNavItemColor = (isActive: boolean) => {
    if (isPayPadActive) {
      return isActive ? 'text-white' : 'text-white/60';
    }
    return isActive ? 'text-[#111111]' : 'text-[#A1A1AA]';
  };

  // Show back button instead of navbar when canGoBack is true
  if (canGoBack) {
    return (
      <div className="h-[70px] bg-white border-t border-[#E5E7EB] flex items-center px-6 z-50">
        <button
          onClick={onGoBack}
          className="flex items-center gap-2 text-[#111111] font-semibold cursor-pointer bg-none border-0 text-base"
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
    <div className={`h-[70px] ${navStyle} border-t flex justify-around items-center z-50 pb-1`}>
      {/* Money Tab */}
      <button
        onClick={() => onTabChange('money')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${getNavItemColor(activeTab === 'money')} relative`}
      >
        <span className="text-lg font-bold">$0</span>
        {activeTab === 'money' && (
          <div
            className={`absolute bottom-1 w-1 h-1 rounded-full ${isPayPadActive ? 'bg-white' : 'bg-[#111111]'}`}
          />
        )}
      </button>

      {/* Card Tab */}
      <button
        onClick={() => onTabChange('money')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${getNavItemColor(false)}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      </button>

      {/* Users Tab (Admin Only) */}
      {isAdmin && (
        <button
          onClick={() => onTabChange('users')}
          className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${getNavItemColor(activeTab === 'users')} relative`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          {activeTab === 'users' && (
            <div
              className={`absolute bottom-1 w-1 h-1 rounded-full ${isPayPadActive ? 'bg-white' : 'bg-[#111111]'}`}
            />
          )}
        </button>
      )}

      {/* Pay Pad Tab - Featured */}
      <button
        onClick={() => onTabChange('paypad')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${getNavItemColor(activeTab === 'paypad')} relative`}
      >
        <div className="w-16 h-16 rounded-full border-2 border-[#00D632] bg-[#00D632] flex items-center justify-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </div>
        {activeTab === 'paypad' && (
          <div
            className={`absolute bottom-1 w-1 h-1 rounded-full ${isPayPadActive ? 'bg-white' : 'bg-[#111111]'}`}
          />
        )}
      </button>

      {/* Search Tab */}
      <button
        onClick={() => onTabChange('activity')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${getNavItemColor(activeTab === 'activity')}`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {/* Activity Tab */}
      <button
        onClick={() => onTabChange('activity')}
        className={`flex flex-col items-center justify-center flex-1 h-full cursor-pointer ${getNavItemColor(activeTab === 'activity')} relative`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        {activeTab === 'activity' && (
          <div
            className={`absolute bottom-1 w-1 h-1 rounded-full ${isPayPadActive ? 'bg-white' : 'bg-[#111111]'}`}
          />
        )}
      </button>
    </div>
  );
}
