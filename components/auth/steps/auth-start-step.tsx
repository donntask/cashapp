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
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        {isEmailMode ? 'Enter your email' : 'Enter your phone or email'}
      </h1>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          {!isEmailMode && (
            <span className="text-2xl text-gray-900 mr-1.5 font-normal">+1</span>
          )}
          <input
            type={isEmailMode ? 'email' : 'text'}
            value={authData.contact}
            onChange={isEmailMode ? handleEmailChange : handlePhoneChange}
            placeholder={isEmailMode ? 'you@example.com' : '(555) 555-5555'}
            className="flex-1 border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mt-auto flex gap-4 items-center">
        <button
          onClick={onToggleMode}
          className="px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-gray-200 text-gray-900 hover:opacity-90 transition-opacity"
        >
          {isEmailMode ? 'Use Phone' : 'Use Email'}
        </button>
        <button
          onClick={onNext}
          disabled={!authData.contact.trim()}
          className="flex-1 px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
