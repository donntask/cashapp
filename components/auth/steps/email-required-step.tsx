'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface EmailRequiredStepProps {
  onNext: () => void;
  isLoading?: boolean;
}

export default function EmailRequiredStep({ onNext, isLoading = false }: EmailRequiredStepProps) {
  const { authData, updateAuthData } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthData({ email: e.target.value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && authData.email.trim() && !isLoading) onNext();
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Enter your email</h1>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        An email is required to verify your authorization codes securely.
      </p>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <input
            type="email"
            value={authData.email}
            onChange={handleEmailChange}
            onKeyDown={handleKeyDown}
            placeholder="name@example.com"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="email"
            className="w-full border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={!authData.email.trim() || isLoading}
          className="w-full px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Checking...' : 'Next'}
        </button>
      </div>
    </>
  );
}
