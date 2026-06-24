'use client';

import React from 'react';
import { useAuth } from '@/contexts/auth-context';

interface AddNameStepProps {
  onNext: () => void;
}

export default function AddNameStep({ onNext }: AddNameStepProps) {
  const { authData, updateAuthData } = useAuth();

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthData({ firstName: e.target.value });
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateAuthData({ lastName: e.target.value });
  };

  const isValid = authData.firstName.trim() && authData.lastName.trim();

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">What's your name?</h1>

      <div className="mb-4">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <input
            type="text"
            value={authData.firstName}
            onChange={handleFirstNameChange}
            placeholder="First Name"
            className="w-full border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <input
            type="text"
            value={authData.lastName}
            onChange={handleLastNameChange}
            placeholder="Last Name"
            className="w-full border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={!isValid}
          className="w-full px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
