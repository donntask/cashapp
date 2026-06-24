'use client';

import { useState } from 'react';

interface RecipientScreenProps {
  amount: string;
  transactionType: 'Pay' | 'Request';
  onAdvanceToPin: (recipient: string) => void;
  onClose: () => void;
}

interface Contact {
  id: string;
  name: string;
  cashtag: string;
  avatarBg: string;
  avatarLetter: string;
}

const CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'Christina M Cravens',
    cashtag: '$ChristinaM',
    avatarBg: 'bg-red-500',
    avatarLetter: 'C',
  },
  {
    id: '2',
    name: 'Lupe Ruelas',
    cashtag: '$LupeR',
    avatarBg: 'bg-cyan-500',
    avatarLetter: 'L',
  },
];

export default function RecipientScreen({
  amount,
  transactionType,
  onAdvanceToPin,
  onClose,
}: RecipientScreenProps) {
  const [inputValue, setInputValue] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContactSelect = (contact: Contact) => {
    const isChecked = selectedId === contact.id;
    if (!isChecked) {
      setSelectedId(contact.id);
      setInputValue(contact.cashtag);
    } else {
      setSelectedId(null);
      setInputValue('');
    }
  };

  const handlePay = () => {
    if (!inputValue.trim()) return;
    onAdvanceToPin(inputValue);
  };

  return (
    <div className="flex flex-col w-full h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#E5E7EB] bg-white">
        <button onClick={onClose} className="text-xl cursor-pointer bg-none border-0 text-[#111111]">
          ×
        </button>
        <div className="flex-1 text-center">
          <div className="text-base font-bold text-[#111111]">${amount}</div>
          <div className="text-xs text-[#8E8E93]">{transactionType === 'Pay' ? 'Bank of America ▾' : 'Cash Balance ▾'}</div>
        </div>
        <button
          onClick={handlePay}
          className="bg-[#00D632] text-white border-0 px-4.5 py-1.5 rounded-4xl font-semibold text-sm cursor-pointer"
        >
          {transactionType}
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto bg-white">

        {/* To Input */}
        <div className="flex items-center px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <span className="font-semibold w-10 text-base">To</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-base text-[#111111]"
            placeholder="Name, $Cashtag, Phone, Email"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        {/* For Input */}
        <div className="flex items-center px-6 py-4 border-b border-[#E5E7EB] gap-3">
          <span className="font-semibold w-10 text-base">For</span>
          <input
            type="text"
            className="flex-1 border-0 outline-none text-base text-[#111111]"
            placeholder="Add a note"
          />
        </div>

        {/* Suggested Title */}
        <div className="text-xs font-bold uppercase text-[#8E8E93] px-6 py-3 tracking-wide">
          Suggested
        </div>

        {/* Contact List */}
        {CONTACTS.map((contact) => (
          <div
            key={contact.id}
            onClick={() => handleContactSelect(contact)}
            className="flex items-center justify-between px-6 py-3 cursor-pointer hover:bg-black/2"
          >
            <div className="flex items-center gap-3">
              <div className={`${contact.avatarBg} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}>
                {contact.avatarLetter}
              </div>
              <div>
                <div className="font-semibold text-base">{contact.name}</div>
                <div className="text-xs text-[#8E8E93]">{contact.cashtag}</div>
              </div>
            </div>
            <div
              className={`w-5.5 h-5.5 rounded border-2 flex items-center justify-center ${
                selectedId === contact.id
                  ? 'bg-[#00D632] border-[#00D632]'
                  : 'border-[#E5E7EB]'
              }`}
            >
              {selectedId === contact.id && <span className="text-white text-xs font-bold">✓</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
