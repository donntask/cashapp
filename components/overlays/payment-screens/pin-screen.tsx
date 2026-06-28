'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/contexts/toast-context';
import { useAuth } from '@/contexts/auth-context';
import { getUserAccount, getUserPin, userHasPin } from '@/lib/firestore-service';
import CreatePinOverlay from '@/components/overlays/create-pin-overlay';

interface PinScreenProps {
  amount: string;
  recipient: string;
  onPinComplete: () => void;
  onClose: () => void;
}

export default function PinScreen({ amount, recipient, onPinComplete, onClose }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [hasSufficientFunds, setHasSufficientFunds] = useState(true);
  const [userBalance, setUserBalance] = useState(0);
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [hasPin, setHasPin] = useState(true); // optimistic
  const [showCreatePin, setShowCreatePin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [wrongPinCount, setWrongPinCount] = useState(0);
  const { addToast } = useToast();
  const { userId, isAdmin, verifiedEmail } = useAuth();

  useEffect(() => {
    const init = async () => {
      if (isAdmin) { setIsLoading(false); setHasSufficientFunds(true); return; }
      if (!userId) { setIsLoading(false); return; }
      try {
        const [account, pin, pinExists] = await Promise.all([
          getUserAccount(userId),
          getUserPin(userId),
          userHasPin(userId),
        ]);
        if (account) {
          const balance = account.cashBalance || 0;
          setUserBalance(balance);
          setHasSufficientFunds(balance >= parseFloat(amount));
        }
        setStoredPin(pin);
        setHasPin(pinExists);
        if (!pinExists) setShowCreatePin(true);
      } catch (err) {
        console.error('[v0] pin-screen init error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [amount, userId, isAdmin]);

  useEffect(() => {
    if (pin.length !== 4) return;

    if (!hasSufficientFunds && !isAdmin) {
      addToast(`Insufficient funds. Balance: $${userBalance.toFixed(2)}`, 'error');
      setPin('');
      return;
    }

    // Admin: any 4 digits accepted
    if (isAdmin) { setTimeout(onPinComplete, 300); return; }

    if (storedPin && pin === storedPin) {
      setTimeout(onPinComplete, 300);
    } else {
      const count = wrongPinCount + 1;
      setWrongPinCount(count);
      addToast(count >= 3 ? 'Too many incorrect attempts' : 'Incorrect PIN', 'error');
      setPin('');
    }
  }, [pin]);

  const handleKey = (key: string) => {
    if (key === 'back') setPin((p) => p.slice(0, -1));
    else if (pin.length < 4) setPin((p) => p + key);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center">
        <div className="w-10 h-10 border-3 border-[#00D632] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <span />
          <span className="text-base font-bold text-[#111111]">Confirm your Cash PIN</span>
          <button onClick={onClose} className="text-2xl cursor-pointer bg-transparent border-0 text-[#111111]">×</button>
        </div>

        {/* Amount reminder */}
        <p className="text-center text-sm text-[#8E8E93] -mt-2 mb-2">
          Sending ${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${recipient}
        </p>

        {!hasSufficientFunds && !isAdmin && (
          <div className="mx-6 mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-semibold text-red-600">Insufficient funds</p>
            <p className="text-xs text-red-400 mt-0.5">Balance: ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
        )}

        {/* PIN dots */}
        <div className="flex justify-center gap-4 my-10">
          {[0,1,2,3].map((i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-full transition-colors ${i < pin.length ? 'bg-[#111111]' : 'bg-[#E5E7EB]'}`} />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 text-center px-6 mt-auto pb-10">
          {[1,2,3,4,5,6,7,8,9].map((n) => (
            <button key={n} onClick={() => handleKey(String(n))}
              className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 active:rounded-xl border-0 bg-transparent"
            >{n}</button>
          ))}
          <div />
          <button onClick={() => handleKey('0')}
            className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 active:rounded-xl border-0 bg-transparent"
          >0</button>
          <button onClick={() => handleKey('back')}
            className="h-16 flex items-center justify-center cursor-pointer active:bg-black/5 active:rounded-xl border-0 bg-transparent"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-[#8E8E93] text-center pb-6">
          Forgot PIN? <button onClick={() => setShowCreatePin(true)} className="text-[#00D632] font-semibold cursor-pointer border-0 bg-transparent">Reset PIN</button>
        </p>
      </div>

      <CreatePinOverlay
        isOpen={showCreatePin}
        onClose={() => { setShowCreatePin(false); if (!hasPin) onClose(); }}
        email={verifiedEmail}
        onPinCreated={() => {
          setShowCreatePin(false);
          setHasPin(true);
          // Reload stored pin
          if (userId) getUserPin(userId).then(setStoredPin);
        }}
      />
    </>
  );
}
