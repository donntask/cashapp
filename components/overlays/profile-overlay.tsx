'use client';

interface ProfileOverlayProps {
  onClose: () => void;
}

export default function ProfileOverlay({ onClose }: ProfileOverlayProps) {
  return (
    <div className="absolute inset-0 bg-[#F4F4F6] z-40 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-0">
        <span className="text-base font-bold">Your Account</span>
        <button onClick={onClose} className="text-2xl cursor-pointer bg-none border-0 text-[#111111]">
          ×
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white mx-4 mb-4 rounded-5xl p-6 flex flex-col items-center relative">
        <button className="absolute top-5 left-5 text-[#111111] cursor-pointer bg-none border-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="6" height="6" rx="1" />
            <rect x="15" y="3" width="6" height="6" rx="1" />
            <rect x="3" y="15" width="6" height="6" rx="1" />
            <rect x="15" y="15" width="6" height="6" rx="1" />
          </svg>
        </button>
        <button className="absolute top-5 right-5 text-[#111111] cursor-pointer bg-none border-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        </button>

        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-[#E5E7EB] flex items-center justify-center relative mb-4 text-[#111111]">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <div className="absolute bottom-0 right-0 w-6.5 h-6.5 bg-[#00D632] rounded-full border-2 border-white flex items-center justify-center text-white text-xs">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 4h3l2-3h6l2 3h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <circle cx="12" cy="12" r="5" />
            </svg>
          </div>
        </div>

        {/* Name and Cashtag */}
        <div className="text-2xl font-bold text-[#111111] flex items-center gap-1.5 mb-1">
          Apple1247
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D632" strokeWidth="3">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
          </svg>
        </div>
        <div className="text-sm text-[#8E8E93] mb-5">$Apple1247</div>

        <button className="w-full h-11 bg-[#F4F4F6] border-0 rounded-full text-sm font-semibold text-[#111111] cursor-pointer">
          Edit Profile
        </button>
      </div>

      {/* Add Photo Card */}
      <div className="bg-white mx-4 mb-3 rounded-4xl p-4 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-10.5 h-10.5 rounded-full border-2 border-dashed border-[#00D632] text-[#00D632] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12" />
              <path d="M6 12h12" />
            </svg>
          </div>
          <div>
            <div className="text-base font-semibold text-[#111111]">Add a profile photo</div>
            <div className="text-xs text-[#8E8E93]">Help people find you</div>
          </div>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </div>

      {/* Invite Customers Card */}
      <div className="bg-white mx-4 mb-3 rounded-4xl p-4 flex items-center justify-between cursor-pointer">
        <div className="flex items-center gap-3.5">
          <div className="w-10.5 h-10.5 rounded-full bg-[#00D632] text-white flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </div>
          <div>
            <div className="text-base font-semibold text-[#111111]">Invite customers</div>
            <div className="text-xs text-[#8E8E93]">Get $15</div>
          </div>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </div>

      {/* Settings Section */}
      <div className="text-xs font-bold uppercase text-[#8E8E93] px-6 py-3 mt-2">Account & Settings</div>

      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-black/3 cursor-pointer">
        <div className="flex items-center gap-4 text-base font-semibold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Personal</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </div>

      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-black/3 cursor-pointer">
        <div className="flex items-center gap-4 text-base font-semibold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>Favorites</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </div>

      <div className="bg-white px-6 py-4 flex justify-between items-center border-b border-black/3 cursor-pointer">
        <div className="flex items-center gap-4 text-base font-semibold text-[#111111]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          <span>Linked Banks</span>
        </div>
        <span className="text-xs text-[#C7C7CC]">❯</span>
      </div>
    </div>
  );
}
