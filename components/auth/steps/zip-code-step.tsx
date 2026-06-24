'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface ZipCodeStepProps {
  onNext: () => void;
}

export default function ZipCodeStep({ onNext }: ZipCodeStepProps) {
  const { authData, updateAuthData } = useAuth();

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    updateAuthData({ zipCode: value });
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Please enter your ZIP Code
      </h1>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <input
            type="text"
            value={authData.zipCode}
            onChange={handleZipChange}
            placeholder="ZIP Code"
            maxLength={5}
            className="w-full border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={authData.zipCode.length < 5}
          className="w-full px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
