'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface CodeVerifyStepProps {
  verificationEmail: string;
  onNext: () => void;
}

export default function CodeVerifyStep({
  verificationEmail,
  onNext,
}: CodeVerifyStepProps) {
  const { setIsOtpVerified, updateAuthData } = useAuth();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    if (input.length > 3) {
      setCode(input.substring(0, 3) + '-' + input.substring(3, 6));
    } else {
      setCode(input);
    }
  };

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      setError('');

      const otpCode = code.replace(/-/g, '');

      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, otp: otpCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to verify OTP');
        setIsLoading(false);
        return;
      }

      const data = await response.json();

      // Store the OTP verification state
      setIsOtpVerified(true);
      updateAuthData({ email: verificationEmail });

      // Note: isNewUser was already set in auth-flow when email was checked,
      // so we don't override it here

      setIsLoading(false);
      onNext();
    } catch (err) {
      console.error('[v0] Error verifying OTP:', err);
      setError('Failed to verify OTP. Please try again.');
      setIsLoading(false);
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

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-auto">
        <button
          onClick={handleVerify}
          disabled={code.length < 7 || isLoading}
          className="w-full px-7 py-3 rounded-full text-base font-semibold border-none cursor-pointer bg-[#00D632] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Verifying...' : 'Verify'}
        </button>
      </div>
    </>
  );
}
