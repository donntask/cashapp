'use client';

import React, { useState } from 'react';

interface CodeVerifyStepProps {
  verificationEmail: string;
  onNext: () => void;
}

export default function CodeVerifyStep({
  verificationEmail,
  onNext,
}: CodeVerifyStepProps) {
  const [code, setCode] = useState('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length > 3) {
      setCode(input.substring(0, 3) + '-' + input.substring(3, 6));
    } else {
      setCode(input);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Enter the code sent to your email
      </h1>
      <p className="text-sm text-gray-600 mb-8 leading-relaxed">
        We sent a verification code to {verificationEmail}.
      </p>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <input
            type="text"
            value={code}
            onChange={handleCodeChange}
            placeholder="000-000"
            maxLength={7}
            className="w-full border-none outline-none text-2xl text-gray-900 bg-transparent placeholder-gray-300 tracking-wide"
          />
        </div>
      </div>

      <div className="mt-auto">
        <button
          onClick={onNext}
          disabled={code.length < 7}
          className="w-full px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </>
  );
}
