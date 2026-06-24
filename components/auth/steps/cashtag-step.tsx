'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface CashtagStepProps {
  onNext: () => void;
}

export default function CashtagStep({ onNext }: CashtagStepProps) {
  const { authData, updateAuthData } = useAuth();

  const handleCashtagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthData({ cashtag: e.target.value });
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Choose a $Cashtag</h1>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        Your unique name for getting paid by anyone
      </p>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <span className="text-2xl text-[#00D632] mr-1.5 font-semibold">$</span>
          <input
            type="text"
            value={authData.cashtag}
            onChange={handleCashtagChange}
            placeholder="Cashtag"
            className="flex-1 border-none outline-none text-2xl text-[#00D632] bg-transparent placeholder-gray-300 font-medium"
          />
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={!authData.cashtag.trim()}
          className="w-full px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
