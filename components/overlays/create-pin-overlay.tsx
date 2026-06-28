'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { useAuth } from '@/contexts/auth-context';
import { saveUserPin } from '@/lib/firestore-service';

interface CreatePinOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onPinCreated?: () => void;
}

type Step = 'create' | 'confirm';

export default function CreatePinOverlay({ isOpen, onClose, email, onPinCreated }: CreatePinOverlayProps) {
  const { userId } = useAuth();
  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { addToast } = useToast();

  const handleKey = (key: string, current: string, setter: (v: string) => void) => {
    if (key === 'back') setter(current.slice(0, -1));
    else if (current.length < 4) setter(current + key);
  };

  const handleNext = () => {
    if (pin.length < 4) { addToast('Enter a 4-digit PIN', 'error'); return; }
    setConfirmPin('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (confirmPin !== pin) { addToast('PINs do not match. Try again.', 'error'); setConfirmPin(''); return; }
    if (!userId) { addToast('Not logged in', 'error'); return; }
    setIsSaving(true);
    try {
      await saveUserPin(userId, pin);
      addToast('PIN created successfully', 'success');
      setTimeout(() => { onPinCreated?.(); onClose(); setStep('create'); setPin(''); setConfirmPin(''); }, 800);
    } catch {
      addToast('Failed to save PIN. Try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const activePin = step === 'create' ? pin : confirmPin;
  const activeSetter = step === 'create' ? setPin : setConfirmPin;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <button
          onClick={() => { if (step === 'confirm') { setStep('create'); setConfirmPin(''); } else { onClose(); setStep('create'); setPin(''); setConfirmPin(''); } }}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F4F4F6] cursor-pointer border-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-base font-bold text-[#111111]">
          {step === 'create' ? 'Create Cash PIN' : 'Confirm Cash PIN'}
        </span>
        <div className="w-9" />
      </div>

      <p className="text-sm text-[#8E8E93] text-center px-8 mb-2">
        {step === 'create'
          ? 'Choose a 4-digit PIN to authorize payments'
          : 'Re-enter your PIN to confirm'}
      </p>

      {/* PIN dots */}
      <div className="flex justify-center gap-5 my-10">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-colors ${i < activePin.length ? 'bg-[#111111]' : 'bg-[#E5E7EB]'}`}
          />
        ))}
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 px-8 mt-auto pb-12">
        {[1,2,3,4,5,6,7,8,9].map((n) => (
          <button
            key={n}
            onClick={() => handleKey(String(n), activePin, activeSetter)}
            className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 rounded-xl border-0 bg-transparent"
          >
            {n}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleKey('0', activePin, activeSetter)}
          className="h-16 text-2xl font-medium text-[#111111] flex items-center justify-center cursor-pointer active:bg-black/5 rounded-xl border-0 bg-transparent"
        >
          0
        </button>
        <button
          onClick={() => handleKey('back', activePin, activeSetter)}
          className="h-16 flex items-center justify-center cursor-pointer active:bg-black/5 rounded-xl border-0 bg-transparent"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="2">
            <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <line x1="18" y1="9" x2="12" y2="15" /><line x1="12" y1="9" x2="18" y2="15" />
          </svg>
        </button>
      </div>

      {/* Action button */}
      <div className="px-6 pb-8">
        <button
          onClick={step === 'create' ? handleNext : handleConfirm}
          disabled={activePin.length < 4 || isSaving}
          className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : step === 'create' ? 'Next' : 'Create PIN'}
        </button>
      </div>
    </div>
  );
}
