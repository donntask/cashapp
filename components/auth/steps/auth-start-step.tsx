'use client';

import React, { useState } from 'react';
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
  const { authData, updateAuthData, setVerifiedEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleNext = async () => {
    try {
      setIsLoading(true);
      setError('');

      // For email mode, send OTP
      if (isEmailMode) {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: authData.contact,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || 'Failed to send OTP');
          setIsLoading(false);
          return;
        }

        // Store verified email for next step
        setVerifiedEmail(authData.contact);
      }

      setIsLoading(false);
      onNext();
    } catch (err) {
      console.error('[v0] Error sending OTP:', err);
      setError('Failed to send OTP. Please try again.');
      setIsLoading(false);
    }
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

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

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
          {isLoading ? 'Sending...' : 'Next'}
        </button>
      </div>
    </>
  );
}
