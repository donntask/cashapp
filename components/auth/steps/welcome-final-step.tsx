'use client';

import React, { useEffect } from 'react';

interface WelcomeFinalStepProps {
  onComplete: () => void;
}

export default function WelcomeFinalStep({ onComplete }: WelcomeFinalStepProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="w-19 h-19 rounded-full border-4 border-[#00D632] flex items-center justify-center text-[#00D632] text-5xl font-bold">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        Welcome to Cash App!
      </h1>
    </div>
  );
}
