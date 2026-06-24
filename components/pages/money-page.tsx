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
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer min-h-[140px]">
          <div className="flex justify-between items-center mb-3 text-sm font-semibold text-[#111111]">
            <span>Savings</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 mb-4 relative">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            <div className="absolute top-0.5 right-3 w-1.5 h-1.5 bg-[#00D632] rounded-full" />
          </div>
          <div className="text-xl font-bold text-[#111111] mb-0.5">$0.00</div>
          <div className="text-xs text-[#8E8E93]">Up to 4.5% interest</div>
        </div>

        {/* Borrow */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer min-h-[140px]">
          <div className="flex justify-between items-center mb-3 text-sm font-semibold text-[#111111]">
            <span>Borrow</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="text-xl font-bold text-[#111111] mb-0.5">$0.00</div>
          <div className="text-xs text-[#8E8E93]">Available</div>
        </div>

        {/* Taxes */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer min-h-[140px]">
          <div className="flex justify-between items-center mb-3 text-sm font-semibold text-[#111111]">
            <span>Taxes</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div className="text-xl font-bold text-[#111111] mb-0.5">&nbsp;</div>
          <div className="text-xs text-[#8E8E93] mt-auto">Pay $0 to file</div>
        </div>

        {/* Paychecks */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer min-h-[140px]">
          <div className="flex justify-between items-center mb-3 text-sm font-semibold text-[#111111]">
            <span>Paychecks</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-[#00D632] mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </div>
          <div className="text-xl font-bold text-[#111111] mb-0.5">&nbsp;</div>
          <div className="text-xs text-[#8E8E93] mt-auto">Get direct deposits early</div>
        </div>

        {/* Bitcoin */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer min-h-[140px]">
          <div className="flex justify-between items-center mb-3 text-sm font-semibold text-[#111111]">
            <span>Bitcoin</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-500 mb-4 text-lg font-bold italic">
            B
          </div>
        </div>

        {/* Stocks */}
        <div className="bg-white rounded-[18px] p-4 flex flex-col cursor-pointer min-h-[140px]">
          <div className="flex justify-between items-center mb-3 text-sm font-semibold text-[#111111]">
            <span>Stocks</span>
            <span className="text-xs text-[#C7C7CC]">❯</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
