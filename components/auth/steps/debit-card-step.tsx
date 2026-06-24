'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface DebitCardStepProps {
  onSkip: () => void;
  onNext: () => void;
}

export default function DebitCardStep({ onSkip, onNext }: DebitCardStepProps) {
  const { authData, updateAuthData } = useAuth();

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 19);
    updateAuthData({ cardNumber: value });
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Add a bank using your debit card
      </h1>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <input
            type="text"
            value={authData.cardNumber}
            onChange={handleCardChange}
            placeholder="0"
            maxLength={19}
            className="flex-1 border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300"
          />
          <span className="text-2xl ml-2">🔒</span>
        </div>
      </div>

      <div className="mt-auto flex gap-4 items-center">
        <button
          onClick={onSkip}
          className="px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-gray-200 text-gray-900 hover:opacity-90 transition-opacity"
        >
          Skip
        </button>
        <button
          onClick={onNext}
          className="flex-1 px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity"
        >
          Next
        </button>
      </div>
    </>
  );
}
