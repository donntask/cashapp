'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { updateUserProfile } from '@/lib/firestore-service';
import { useToast } from '@/contexts/toast-context';

interface EditProfileOverlayProps {
  onClose: () => void;
}

export default function EditProfileOverlay({ onClose }: EditProfileOverlayProps) {
  const { authData, updateAuthData, userId } = useAuth();
  const { addToast } = useToast();

  const [firstName, setFirstName] = useState(authData.firstName || '');
  const [lastName, setLastName] = useState(authData.lastName || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!firstName.trim()) { addToast('First name is required', 'error'); return; }
    setIsSaving(true);
    try {
      if (userId) {
        await updateUserProfile(userId, { firstName: firstName.trim(), lastName: lastName.trim() });
      }
      updateAuthData({ firstName: firstName.trim(), lastName: lastName.trim() });
      addToast('Profile updated', 'success');
      onClose();
    } catch {
      addToast('Failed to save. Try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-[#F4F4F6] z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between bg-white px-5 pt-12 pb-4 border-b border-[#E5E7EB]">
        <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F4F4F6] cursor-pointer border-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-base font-bold text-[#111111]">Edit Profile</span>
        <div className="w-9" />
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-8 mb-6">
        <div className="w-24 h-24 rounded-full bg-[#E5E7EB] flex items-center justify-center relative">
          <span className="text-4xl font-bold text-[#8E8E93]">{firstName.charAt(0).toUpperCase() || '?'}</span>
          <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#00D632] rounded-full border-2 border-white flex items-center justify-center cursor-pointer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M4 4h3l2-3h6l2 3h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-[#00D632] font-semibold mt-2 cursor-pointer">Change photo</p>
      </div>

      {/* Form */}
      <div className="px-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="h-12 bg-white rounded-xl px-4 text-sm font-medium text-[#111111] border-0 outline-none ring-0 focus:ring-2 focus:ring-[#00D632]"
            placeholder="First name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="h-12 bg-white rounded-xl px-4 text-sm font-medium text-[#111111] border-0 outline-none ring-0 focus:ring-2 focus:ring-[#00D632]"
            placeholder="Last name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">$Cashtag</label>
          <div className="h-12 bg-[#F4F4F6] rounded-xl px-4 flex items-center">
            <span className="text-sm text-[#C7C7CC] font-medium">${authData.cashtag}</span>
            <span className="ml-auto text-xs text-[#C7C7CC]">Cannot change</span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wide">Email</label>
          <div className="h-12 bg-[#F4F4F6] rounded-xl px-4 flex items-center">
            <span className="text-sm text-[#C7C7CC] font-medium">{authData.email}</span>
            <span className="ml-auto text-xs text-[#C7C7CC]">Cannot change</span>
          </div>
        </div>
      </div>

      <div className="px-5 mt-auto pb-10 pt-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
