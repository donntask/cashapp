'use client';

interface MoneyPageProps {
  onOpenProfile: () => void;
}

export default function MoneyPage({ onOpenProfile }: MoneyPageProps) {
  return (
    <div className="flex flex-col w-full h-full overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-3xl font-bold text-[#111111]">Money</h1>
        <button
          onClick={onOpenProfile}
          className="w-9 h-9 rounded-full bg-[#E5E7EB] cursor-pointer overflow-hidden border border-black/5 flex items-center justify-center text-[#111111]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>

      {/* Money Card */}
      <div className="bg-white mx-4 mb-4 p-6 rounded-[18px]">
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-semibold text-[#111111]">Cash balance</span>
          <a href="#" className="text-xs text-[#8E8E93] no-underline flex items-center gap-1">
            Account & routing <span className="text-[10px]">❯</span>
          </a>
        </div>
        <div className="text-5xl font-bold text-[#111111] mb-6 leading-tight">$0.00</div>
        <div className="flex gap-3">
          <button className="flex-1 h-12 bg-[#F4F4F6] text-[#111111] text-base font-semibold border-0 rounded-full cursor-pointer">
            Add Cash
          </button>
          <button className="flex-1 h-12 bg-[#F4F4F6] text-[#111111] text-base font-semibold border-0 rounded-full cursor-pointer">
            Cash Out
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 pb-6">
        {/* Savings */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-[#111111]">Savings</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#C8E6C9] flex items-center justify-center text-[#2E7D32] mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="6" x2="12" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-lg font-bold text-[#111111]">$0.00</div>
          <div className="text-xs text-[#8E8E93]">Save for a goal</div>
        </div>

        {/* Buy bitcoin */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-[#111111]">Buy bitcoin</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#E3F2FD] flex items-center justify-center mb-3">
            <div className="text-2xl font-bold text-[#1976D2]">₿</div>
          </div>
        </div>

        {/* Invest in stocks */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-[#111111]">Invest in stocks</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#F3E5F5] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1FA2" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>

        {/* Free tax filing */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer">
          <div className="flex justify-between items-start mb-2">
            <span className="text-sm font-semibold text-[#111111]">Free tax filing</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-[#FFF9C4] flex items-center justify-center mb-3">
            <div className="text-2xl">📋</div>
          </div>
        </div>
      </div>
    </div>
  );
}
