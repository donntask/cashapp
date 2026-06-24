'use client';

import { useState, useEffect } from 'react';

interface PinScreenProps {
  amount: string;
  recipient: string;
  onPinComplete: () => void;
  onClose: () => void;
}

export default function PinScreen({
  amount,
  recipient,
  onPinComplete,
  onClose,
}: PinScreenProps) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => {
        onPinComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pin, onPinComplete]);

  const handleKeyPress = (key: string) => {
    if (key === 'back') {
      setPin(pin.slice(0, -1));
    } else if (pin.length < 4) {
      setPin(pin + key);
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b-0">
        <span />
        <div className="text-base font-bold text-[#111111] mt-2.5">Confirm your Cash PIN</div>
        <button onClick={onClose} className="text-xl cursor-pointer bg-none border-0 text-[#111111]">
          ×
        </button>
      </div>

      {/* PIN Dots */}
      <div className="flex justify-center gap-4 my-10">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`w-3.5 h-3.5 rounded-full ${
              index < pin.length ? 'bg-[#A1A1AA]' : 'bg-[#E5E7EB]'
            }`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 text-center px-6 mb-10 mt-auto pb-10">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(String(num))}
            className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 active:rounded-lg"
          >
            {num}
          </button>
        ))}
        <button className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center" />
        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 active:rounded-lg"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('back')}
          className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 active:rounded-lg"
        >
          &lt;
        </button>
      </div>
    </div>
  );
}
