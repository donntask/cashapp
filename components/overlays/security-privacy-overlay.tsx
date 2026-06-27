'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import CreatePinOverlay from './create-pin-overlay';

interface SecurityPrivacyOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecurityPrivacyOverlay({ isOpen, onClose }: SecurityPrivacyOverlayProps) {
  const { verifiedEmail } = useAuth();
  const [showCreatePin, setShowCreatePin] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="absolute inset-0 bg-[#F4F4F6] z-40 flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-0">
          <span className="text-base font-bold">Security & Privacy</span>
          <button onClick={onClose} className="text-2xl cursor-pointer bg-none border-0 text-[#111111]">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-2 space-y-3">
          {/* Create Payment PIN */}
          <button
            onClick={() => setShowCreatePin(true)}
            className="w-full bg-white px-6 py-4 flex justify-between items-center rounded-lg cursor-pointer border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4 text-base font-semibold text-[#111111] text-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="19" cy="12" r="1"/>
                <circle cx="5" cy="12" r="1"/>
                <path d="M7 6h10M7 18h10M4 9v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9"/>
              </svg>
              <div>
                <div className="font-bold">Create Payment PIN</div>
                <div className="text-xs text-gray-500">Secure your transactions</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          {/* Two-Factor Authentication */}
          <button
            className="w-full bg-white px-6 py-4 flex justify-between items-center rounded-lg cursor-pointer border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4 text-base font-semibold text-[#111111] text-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 1v22M4.22 4.22l15.56 15.56M1 12h22M4.22 19.78L19.78 4.22"/>
              </svg>
              <div>
                <div className="font-bold">Two-Factor Authentication</div>
                <div className="text-xs text-gray-500">Off</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          {/* Device Management */}
          <button
            className="w-full bg-white px-6 py-4 flex justify-between items-center rounded-lg cursor-pointer border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4 text-base font-semibold text-[#111111] text-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
              <div>
                <div className="font-bold">Trusted Devices</div>
                <div className="text-xs text-gray-500">1 device</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          {/* Login Activity */}
          <button
            className="w-full bg-white px-6 py-4 flex justify-between items-center rounded-lg cursor-pointer border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4 text-base font-semibold text-[#111111] text-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 17"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <div>
                <div className="font-bold">Login Activity</div>
                <div className="text-xs text-gray-500">View recent login attempts</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>

          {/* Privacy Settings */}
          <button
            className="w-full bg-white px-6 py-4 flex justify-between items-center rounded-lg cursor-pointer border-0 hover:bg-gray-50"
          >
            <div className="flex items-center gap-4 text-base font-semibold text-[#111111] text-left">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <div className="font-bold">Privacy Settings</div>
                <div className="text-xs text-gray-500">Control who can contact you</div>
              </div>
            </div>
            <span className="text-xs text-gray-400">❯</span>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 px-4 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg cursor-pointer font-semibold"
          >
            Back
          </button>
        </div>
      </div>

      <CreatePinOverlay
        isOpen={showCreatePin}
        onClose={() => setShowCreatePin(false)}
        email={verifiedEmail}
      />
    </>
  );
}
