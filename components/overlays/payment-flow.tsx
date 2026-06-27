'use client';

import { useState } from 'react';
import RecipientScreen from './payment-screens/recipient-screen';
import PinScreen from './payment-screens/pin-screen';
import StatusScreen from './payment-screens/status-screen';

interface PaymentFlowProps {
  step: 'recipient' | 'pin' | 'status';
  amount: string;
  transactionType: 'Pay' | 'Request';
  onStepChange: (step: 'recipient' | 'pin' | 'status') => void;
  onClose: () => void;
}

export default function PaymentFlow({
  step,
  amount,
  transactionType,
  onStepChange,
  onClose,
}: PaymentFlowProps) {
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');

  const handleAdvanceToPin = (selectedRecipient: string, selectedNote: string) => {
    setRecipient(selectedRecipient);
    setNote(selectedNote);
    onStepChange('pin');
  };

  const handlePinComplete = () => {
    onStepChange('status');
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col">
      {step === 'recipient' && (
        <RecipientScreen
          amount={amount}
          transactionType={transactionType}
          onAdvanceToPin={handleAdvanceToPin}
          onClose={onClose}
        />
      )}
      {step === 'pin' && (
        <PinScreen
          amount={amount}
          recipient={recipient}
          onPinComplete={handlePinComplete}
          onClose={onClose}
        />
      )}
      {step === 'status' && (
        <StatusScreen
          amount={amount}
          transactionType={transactionType}
          recipient={recipient}
          note={note}
          onClose={onClose}
        />
      )}
    </div>
  );
}
