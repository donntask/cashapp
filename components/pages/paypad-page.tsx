'use client';

interface PayPadPageProps {
  amount: string;
  onAmountChange: (amount: string) => void;
  onOpenProfile: () => void;
  onInitiatePayment: (type: 'Pay' | 'Request') => void;
}

export default function PayPadPage({
  amount,
  onAmountChange,
  onOpenProfile,
  onInitiatePayment,
}: PayPadPageProps) {
  const handleKeyPress = (key: string) => {
    let newAmount = amount;

    if (key === 'back') {
      if (newAmount.length > 1) {
        newAmount = newAmount.slice(0, -1);
      } else {
        newAmount = '0';
      }
    } else if (key === '.') {
      if (!newAmount.includes('.')) {
        newAmount += '.';
      }
    } else {
      if (newAmount === '0') {
        newAmount = key;
      } else {
        if (newAmount.includes('.')) {
          const decimals = newAmount.split('.')[1];
          if (decimals.length >= 2) return;
        }
        newAmount += key;
      }
    }

    onAmountChange(newAmount);
  };

  return (
    <div className="flex flex-col w-full h-full bg-[#00D632] text-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        </svg>

        <div className="bg-black/10 px-3.5 py-1.5 rounded-4xl text-sm font-semibold flex items-center gap-1 cursor-pointer">
          <span>USD</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>

        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-white/20 cursor-pointer overflow-hidden border border-white/30 flex items-center justify-center text-white"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* Amount Display */}
      <div className="flex-1 flex flex-col justify-center items-center pb-5">
        <div className="text-8xl font-medium text-white mb-3 leading-tight tracking-tighter">
          ${amount}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-3 text-center px-6 mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeyPress(String(num))}
            className="h-16 text-2xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleKeyPress('.')}
          className="h-16 text-2xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
        >
          .
        </button>
        <button
          onClick={() => handleKeyPress('0')}
          className="h-16 text-2xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
        >
          0
        </button>
        <button
          onClick={() => handleKeyPress('back')}
          className="h-16 text-2xl font-medium text-white flex items-center justify-center cursor-pointer active:bg-white/10 active:rounded-lg"
        >
          &lt;
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 px-6 pb-6">
        <button
          onClick={() => onInitiatePayment('Request')}
          className="flex-1 h-14 bg-black/15 text-white text-base font-semibold border-0 rounded-full cursor-pointer"
        >
          Request
        </button>
        <button
          onClick={() => onInitiatePayment('Pay')}
          className="flex-1 h-14 bg-black/15 text-white text-base font-semibold border-0 rounded-full cursor-pointer"
        >
          Pay
        </button>
      </div>
    </div>
  );
}
