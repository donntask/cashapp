'use client';

import React, { useState } from 'react';

interface InviteFriendsStepProps {
  onNext: () => void;
}

export default function InviteFriendsStep({ onNext }: InviteFriendsStepProps) {
  const [contact, setContact] = useState('');

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="w-15 h-15 rounded-full bg-[#00D632] flex items-center justify-center text-white text-3xl">
          👤<sup className="text-2xl">+</sup>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Invite Friends, Get $15
      </h1>

      <div className="mb-8">
        <div className="flex items-center border-b border-gray-300 pb-2.5 focus-within:border-[#00D632]">
          <span className="text-base text-gray-900 font-medium mr-2">To:</span>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or Email"
            className="flex-1 border-none outline-none text-base text-gray-900 bg-transparent placeholder-gray-300"
          />
        </div>
      </div>

      <div className="mt-auto mb-0 -mx-8 -mb-5 bg-[#00D632] px-8 py-6 flex justify-between items-center text-white">
        <span className="text-sm font-medium">
          Allow contact access to make inviting friends easy
        </span>
        <button
          onClick={onNext}
          className="px-6 py-2 rounded-full bg-white text-gray-900 font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity text-sm"
        >
          Allow
        </button>
      </div>
    </>
  );
}
