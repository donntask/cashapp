'use client';

import React, { useState, useEffect } from 'react';

interface WelcomeFinalStepProps {
  onComplete: () => void;
}

export default function WelcomeFinalStep({ onComplete }: WelcomeFinalStepProps) {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5">
      <div className="w-19 h-19 rounded-full border-4 border-[#00D632] flex items-center justify-center text-[#00D632] text-5xl font-bold">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-gray-900 text-center">
        Welcome to Bush Fi!
      </h1>
      {showButton && (
        <button
          onClick={onComplete}
          className="mt-5 bg-[#00D632] text-white border-0 px-8 py-3 rounded-full font-semibold text-base cursor-pointer hover:bg-[#00b029]"
        >
          Get Started
        </button>
      )}
    </div>
  );
}
