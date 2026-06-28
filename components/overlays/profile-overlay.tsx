'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import SupportChatOverlay from './support-chat-overlay';
import EditProfileOverlay from './edit-profile-overlay';
import InviteOverlay from './invite-overlay';
import CreatePinOverlay from './create-pin-overlay';
import SecurityPrivacyOverlay from './security-privacy-overlay';

interface ProfileOverlayProps {
  onClose: () => void;
  onSelectSetting?: (setting: string) => void;
  onOpenSettings?: () => void;
}

type SubScreen = 'support' | 'edit' | 'invite' | 'pin' | 'security' | null;

export default function ProfileOverlay({ onClose, onSelectSetting, onOpenSettings }: ProfileOverlayProps) {
  const { resetAuth, authData, isAdmin, verifiedEmail } = useAuth();
  const [subScreen, setSubScreen] = useState<SubScreen>(null);
  const [loadingSettingName, setLoadingSettingName] = useState<string | null>(null);

  const displayName = [authData.firstName, authData.lastName].filter(Boolean).join(' ').slice(0, 18) || 'User';
  const cashtag = authData.cashtag || 'user';
  const initials = (authData.firstName?.charAt(0) || 'U').toUpperCase();

  // Settings that show a generic loading spinner then dismiss
  const handleGenericSetting = (name: string) => {
    setLoadingSettingName(name);
    setTimeout(() => { onClose(); setLoadingSettingName(null); }, 3000);
  };

  if (subScreen === 'support') return <SupportChatOverlay onClose={() => setSubScreen(null)} />;
  if (subScreen === 'edit') return <EditProfileOverlay onClose={() => setSubScreen(null)} />;
  if (subScreen === 'invite') return <InviteOverlay onClose={() => setSubScreen(null)} />;
  if (subScreen === 'pin') return (
    <CreatePinOverlay isOpen={true} onClose={() => setSubScreen(null)} email={verifiedEmail} onPinCreated={() => setSubScreen(null)} />
  );
  if (subScreen === 'security') return (
    <SecurityPrivacyOverlay isOpen={true} onClose={() => setSubScreen(null)} />
  );

  if (loadingSettingName) {
    return (
      <div className="absolute inset-0 bg-[#F4F4F6] z-40 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-[#00D632] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#111111]">Loading {loadingSettingName}</p>
          <p className="text-xs text-[#C7C7CC] mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#F4F4F6] z-40 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 pt-12 pb-4">
        <span className="text-base font-bold text-[#111111]">Your Account</span>
        <button onClick={onClose} className="text-2xl cursor-pointer bg-transparent border-0 text-[#111111]">×</button>
      </div>

      {/* Profile Card */}
      <div className="bg-white mx-4 mb-4 rounded-3xl p-6 flex flex-col items-center relative">
        <button className="absolute top-5 left-5 text-[#111111] cursor-pointer bg-transparent border-0" aria-label="QR code">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <rect x="15" y="3" width="6" height="6" rx="1" />
            <rect x="3" y="15" width="6" height="6" rx="1" />
            <rect x="15" y="15" width="6" height="6" rx="1" />
          </svg>
        </button>
        <button className="absolute top-5 right-5 text-[#111111] cursor-pointer bg-transparent border-0" aria-label="Share">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-[#E5E7EB] flex items-center justify-center relative mb-4">
          <span className="text-3xl font-bold text-[#8E8E93]">{initials}</span>
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#00D632] rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h3l2-3h6l2 3h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>

        <div className="text-2xl font-bold text-[#111111] flex items-center gap-1.5 mb-1">{displayName}</div>
        <div className="text-sm text-[#8E8E93] mb-5">${cashtag}</div>

        <button
          onClick={() => setSubScreen('edit')}
          className="w-full h-11 bg-[#F4F4F6] border-0 rounded-full text-sm font-semibold text-[#111111] cursor-pointer active:opacity-70"
        >
          Edit Profile
        </button>
      </div>

      {/* Add Photo Card */}
      <button onClick={() => setSubScreen('edit')} className="bg-white mx-4 mb-3 rounded-3xl p-4 flex items-center justify-between cursor-pointer border-0 w-[calc(100%-2rem)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#00D632] text-[#00D632] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v12" /><path d="M6 12h12" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-base font-semibold text-[#111111]">Add a profile photo</div>
            <div className="text-xs text-[#8E8E93]">Help people find you</div>
          </div>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      {/* Invite Card */}
      <button onClick={() => setSubScreen('invite')} className="bg-white mx-4 mb-3 rounded-3xl p-4 flex items-center justify-between cursor-pointer border-0 w-[calc(100%-2rem)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#00D632] text-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div className="text-left">
            <div className="text-base font-semibold text-[#111111]">Invite customers</div>
            <div className="text-xs text-[#8E8E93]">Get $15</div>
          </div>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      {/* Account & Settings Section */}
      <div className="text-xs font-bold uppercase text-[#8E8E93] px-6 py-3 mt-1">Account &amp; Settings</div>

      {/* Settings button — admin only */}
      {isAdmin && (
        <button onClick={onOpenSettings} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
          <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m2.98 2.98l4.24 4.24M1 12h6m6 0h6m-16.78 7.78l4.24-4.24m2.98-2.98l4.24-4.24" />
            </svg>
            <span>Settings</span>
          </div>
          <span className="text-xs text-[#C7C7CC]">❯</span>
        </button>
      )}

      {[
        {
          name: 'Personal', icon: <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />,
          icon2: <circle cx="12" cy="7" r="4" />, action: () => setSubScreen('edit'),
        },
      ].map((item) => (
        <button key={item.name} onClick={item.action} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
          <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {item.icon}{item.icon2}
            </svg>
            <span>{item.name}</span>
          </div>
          <span className="text-xs text-[#C7C7CC]">❯</span>
        </button>
      ))}

      <button onClick={() => handleGenericSetting('Favorites')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Favorites</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => handleGenericSetting('Linked Banks')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
          </svg>
          <span>Linked Banks</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => setSubScreen('security')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Security &amp; Privacy</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => handleGenericSetting('Family')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Family</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => handleGenericSetting('Limits')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          <span>Limits</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => handleGenericSetting('Notifications')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span>Notifications</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => handleGenericSetting('Themes')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          <span>Themes</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => setSubScreen('support')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Support</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      <button onClick={() => setSubScreen('pin')} className="w-full bg-white px-6 py-4 flex justify-between items-center border-b border-black/5 cursor-pointer border-0">
        <div className="flex items-center gap-4 text-base font-bold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>Cash PIN</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </button>

      {/* Log Out */}
      <div className="px-4 mt-5 mb-8">
        <button
          onClick={() => { resetAuth(); window.location.href = '/'; }}
          className="h-12 w-full bg-[#FF3B30] text-white font-bold text-base rounded-full border-0 cursor-pointer active:opacity-80"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
