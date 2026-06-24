'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface AuthStartStepProps {
  onNext: () => void;
  isEmailMode: boolean;
  onToggleMode: () => void;
}

export default function AuthStartStep({
  onNext,
  isEmailMode,
  onToggleMode,
}: AuthStartStepProps) {
  const { authData, updateAuthData } = useAuth();

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';

    if (cleaned.length > 0) {
      formatted += '(' + cleaned.substring(0, 3);
    }
    if (cleaned.length >= 4) {
      formatted += ') ' + cleaned.substring(3, 6);
    }
    if (cleaned.length >= 7) {
      formatted += '-' + cleaned.substring(6, 10);
    }

    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateAuthData({ contact: formatted });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthData({ contact: e.target.value });
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-[#111111] mb-8">
        {isEmailMode ? 'Enter your email' : 'Enter your phone or email'}
      </h1>

      <div className="mb-8 flex-1">
        <div className="flex items-center border-b-2 border-[#E5E7EB] pb-3 focus-within:border-[#00D632]">
          {!isEmailMode && (
            <span className="text-xl text-[#111111] mr-2 font-normal">+1</span>
          )}
          <input
            type={isEmailMode ? 'email' : 'text'}
            value={authData.contact}
            onChange={isEmailMode ? handleEmailChange : handlePhoneChange}
            placeholder={isEmailMode ? 'you@example.com' : 'Mobile Number'}
            className="flex-1 border-none outline-none text-xl text-[#111111] bg-transparent placeholder-[#B3B3B7]"
          />
        </div>
      </div>

      <div className="mt-auto flex gap-4 items-center">
        <button
          onClick={onToggleMode}
          className="flex-1 px-7 py-3.5 rounded-full text-base font-semibold border-none cursor-pointer bg-[#F4F4F6] text-[#111111] hover:opacity-90 transition-opacity"
        >
          {isEmailMode ? 'Use Phone' : 'Use Email'}
        </button>
        <button
          onClick={onNext}
          disabled={!authData.contact.trim()}
          className="flex-1 px-7 py-3.5 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
