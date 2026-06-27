'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/toast-context';
import { otpStore } from '@/lib/otp-store';

interface CreatePinOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onPinCreated?: () => void;
}

type Step = 'create' | 'verify' | 'confirm';

export default function CreatePinOverlay({
  isOpen,
  onClose,
  email,
  onPinCreated,
}: CreatePinOverlayProps) {
  const [step, setStep] = useState<Step>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [otp, setOtp] = useState('');
  const { addToast } = useToast();

  const handleSendOtp = () => {
    if (pin.length < 4) {
      addToast('PIN must be 4 digits', 'error');
      return;
    }

    // Generate OTP and store it
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    otpStore.setOTP(email, generatedOtp);

    setVerificationCode(generatedOtp); // In production, this would be sent via email
    addToast(`Verification code sent to ${email}`, 'success');
    setStep('verify');
  };

  const handleVerifyOtp = () => {
    if (otp !== verificationCode) {
      addToast('Invalid verification code', 'error');
      return;
    }

    setStep('confirm');
  };

  const handleConfirmPin = () => {
    if (pin !== confirmPin) {
      addToast('PINs do not match', 'error');
      return;
    }

    // Save PIN to localStorage
    try {
      const userData = localStorage.getItem('cashapp_auth_data');
      if (userData) {
        const data = JSON.parse(userData);
        data.pin = pin;
        localStorage.setItem('cashapp_auth_data', JSON.stringify(data));
      }

      addToast('PIN created successfully', 'success');
      setTimeout(() => {
        onPinCreated?.();
        onClose();
      }, 1500);
    } catch (error) {
      addToast('Error creating PIN', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-[#111111]">Create Payment PIN</h2>
          <button
            onClick={onClose}
            className="text-2xl cursor-pointer bg-none border-0 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {step === 'create' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Create a 4-digit PIN to secure your payments
              </p>
              
              {/* PIN Display */}
              <div className="flex justify-center gap-4 my-6">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      index < pin.length ? 'bg-[#A1A1AA]' : 'bg-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => pin.length < 4 && setPin(pin + num)}
                    className="h-12 text-xl font-medium bg-[#F4F4F6] text-[#111111] rounded-lg cursor-pointer active:bg-gray-300"
                  >
                    {num}
                  </button>
                ))}
                <button className="h-12" />
                <button
                  onClick={() => pin.length < 4 && setPin(pin + '0')}
                  className="h-12 text-xl font-medium bg-[#F4F4F6] text-[#111111] rounded-lg cursor-pointer active:bg-gray-300"
                >
                  0
                </button>
                <button
                  onClick={() => setPin(pin.slice(0, -1))}
                  className="h-12 text-xl font-medium bg-[#F4F4F6] text-[#111111] rounded-lg cursor-pointer active:bg-gray-300"
                >
                  ←
                </button>
              </div>

              <button
                onClick={handleSendOtp}
                disabled={pin.length < 4}
                className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                Next
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Enter the verification code sent to {email}
              </p>

              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                placeholder="0000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 text-center text-2xl border-2 border-[#E5E7EB] rounded-lg focus:border-[#00D632] focus:outline-none"
              />

              <button
                onClick={handleVerifyOtp}
                disabled={otp.length < 4}
                className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                Confirm your 4-digit PIN
              </p>

              {/* PIN Display */}
              <div className="flex justify-center gap-4 my-6">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full ${
                      index < confirmPin.length ? 'bg-[#A1A1AA]' : 'bg-[#E5E7EB]'
                    }`}
                  />
                ))}
              </div>

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    onClick={() => confirmPin.length < 4 && setConfirmPin(confirmPin + num)}
                    className="h-12 text-xl font-medium bg-[#F4F4F6] text-[#111111] rounded-lg cursor-pointer active:bg-gray-300"
                  >
                    {num}
                  </button>
                ))}
                <button className="h-12" />
                <button
                  onClick={() => confirmPin.length < 4 && setConfirmPin(confirmPin + '0')}
                  className="h-12 text-xl font-medium bg-[#F4F4F6] text-[#111111] rounded-lg cursor-pointer active:bg-gray-300"
                >
                  0
                </button>
                <button
                  onClick={() => setConfirmPin(confirmPin.slice(0, -1))}
                  className="h-12 text-xl font-medium bg-[#F4F4F6] text-[#111111] rounded-lg cursor-pointer active:bg-gray-300"
                >
                  ←
                </button>
              </div>

              <button
                onClick={handleConfirmPin}
                disabled={confirmPin.length < 4}
                className="w-full h-12 bg-[#00D632] text-white font-bold rounded-full border-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                Create PIN
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
