'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface WelcomeFinalStepProps {
  onComplete: () => void;
}

export default function WelcomeFinalStep({ onComplete }: WelcomeFinalStepProps) {
  const { completeAuthWithFirestore, setUserId, authData } = useAuth();
  const [showButton, setShowButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      // Generate a unique user ID
      const uid = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Set user ID and complete auth with Firestore
      setUserId(uid);
      await completeAuthWithFirestore(uid);
      
      setTimeout(() => {
        onComplete();
      }, 500);
    } catch (error) {
      console.error('[v0] Error completing auth:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="w-19 h-19 rounded-full border-4 border-[#00D632] flex items-center justify-center text-[#00D632] text-5xl font-bold">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        Welcome to Cash App!
      </h1>
      {showButton && (
        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="mt-5 bg-[#00D632] text-white border-0 px-8 py-3 rounded-full font-semibold text-base cursor-pointer hover:bg-[#00b029] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Setting up...' : 'Get Started'}
        </button>
      )}
    </div>
  );
}
