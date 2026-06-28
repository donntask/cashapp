'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface AuthStartStepProps {
  onNext: () => void;
  isEmailMode: boolean;
  onToggleMode: () => void;
  isLoading?: boolean;
}

export default function AuthStartStep({
  onNext,
  isEmailMode,
  onToggleMode,
  isLoading = false,
}: AuthStartStepProps) {
  const { authData, updateAuthData, setVerifiedEmail } = useAuth();
  const [error, setError] = useState('');

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';
    if (cleaned.length > 0) formatted += '(' + cleaned.substring(0, 3);
    if (cleaned.length >= 4) formatted += ') ' + cleaned.substring(3, 6);
    if (cleaned.length >= 7) formatted += '-' + cleaned.substring(6, 10);
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    updateAuthData({ contact: formatPhoneNumber(e.target.value) });
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    updateAuthData({ contact: e.target.value });
  };

  const handleNext = () => {
    const value = authData.contact.trim();
    if (!value) return;

    if (isEmailMode || value.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError('Please enter a valid email address.');
        return;
      }
      setVerifiedEmail(value);
      updateAuthData({ email: value });
    }

    onNext();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleNext();
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
            onKeyDown={handleKeyDown}
            placeholder={isEmailMode ? 'you@example.com' : 'Mobile Number'}
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete={isEmailMode ? 'email' : 'tel'}
            className="flex-1 border-none outline-none text-xl text-[#111111] bg-transparent placeholder-[#B3B3B7]"
          />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      <div className="mt-auto flex gap-4 items-center">
        <button
          onClick={onToggleMode}
          disabled={isLoading}
          className="flex-1 px-7 py-3.5 rounded-full text-base font-semibold border-none cursor-pointer bg-[#F4F4F6] text-[#111111] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEmailMode ? 'Use Phone' : 'Use Email'}
        </button>
        <button
          onClick={handleNext}
          disabled={!authData.contact.trim() || isLoading}
          className="flex-1 px-7 py-3.5 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Next'}
        </button>
      </div>
    </>
  );
}
