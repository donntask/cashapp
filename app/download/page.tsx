'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

const ANDROID_APK_URL = 'https://apk.e-droid.net/apk/app4099914-crwt7g.apk?v=1';

function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-155.5-127.5c-42.7-76.9-72.5-199.7-72.5-316.9 0-202.2 131.8-308.9 261.5-308.9 66 0 121.2 43.4 162.6 43.4 39.5 0 101.1-46 176.3-46 28.5 0 130.9 2.6 198.3 99.2zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z" />
    </svg>
  );
}

function AndroidIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.523 15.341c-.32 0-.579-.26-.579-.58s.26-.579.58-.579.579.26.579.579-.259.58-.58.58m-11.046 0c-.32 0-.579-.26-.579-.58s.26-.579.579-.579.58.26.58.579-.26.58-.58.58M17.67 9.927l1.164-2.016a.243.243 0 0 0-.088-.331.243.243 0 0 0-.331.088l-1.178 2.041A7.29 7.29 0 0 0 12 8.876a7.29 7.29 0 0 0-5.237 2.833L5.585 7.668a.243.243 0 0 0-.331-.088.243.243 0 0 0-.088.331L6.33 9.927C4.265 11.064 2.877 13.207 2.75 15.685h18.5c-.127-2.478-1.514-4.62-3.58-5.758" />
    </svg>
  );
}

function DownloadButtons({ platform }: { platform: Platform }) {
  const [showIOSBanner, setShowIOSBanner] = React.useState(false);

  const handleIOSClick = () => {
    // On iOS Safari, prompt the user — they must use the native Share sheet
    setShowIOSBanner(true);
    // Briefly scroll to the instruction steps below
    document.getElementById('ios-steps')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* iOS button */}
      {(platform === 'ios' || platform === 'desktop') && (
        <button
          onClick={handleIOSClick}
          className="w-full h-14 bg-black text-white rounded-2xl flex items-center gap-4 px-5 shadow-lg active:opacity-80 transition-opacity"
        >
          <AppleIcon />
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-white/60 leading-none">Download on</span>
            <span className="text-base font-bold leading-tight">iPhone (iOS)</span>
          </div>
          {showIOSBanner && (
            <span className="ml-auto text-[10px] text-[#00D632] font-semibold">See steps below</span>
          )}
        </button>
      )}

      {/* Android button */}
      {(platform === 'android' || platform === 'desktop') && (
        <a
          href={ANDROID_APK_URL}
          className="w-full h-14 bg-black text-white rounded-2xl flex items-center gap-4 px-5 shadow-lg active:opacity-80 transition-opacity"
          download
        >
          <AndroidIcon />
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-white/60 leading-none">Download for</span>
            <span className="text-base font-bold leading-tight">Android</span>
          </div>
        </a>
      )}
    </div>
  );
}

function IOSInstructions() {
  const [step, setStep] = useState(0);

  const steps = [
    {
      num: 1,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      ),
      title: 'Tap the Share button',
      desc: 'In Safari, tap the Share icon at the bottom center of your screen.',
    },
    {
      num: 2,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      ),
      title: 'Add to Home Screen',
      desc: 'Scroll down in the Share menu and tap "Add to Home Screen".',
    },
    {
      num: 3,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      title: 'Tap Add',
      desc: 'Confirm by tapping "Add" in the top-right corner. Cash App will appear on your home screen.',
    },
  ];

  return (
    <div className="w-full flex flex-col gap-3 mt-2">
      {steps.map((s, i) => (
        <button
          key={s.num}
          onClick={() => setStep(i)}
          className={`flex items-start gap-4 p-4 rounded-2xl text-left transition-all border ${
            step === i
              ? 'bg-white/15 border-white/30'
              : 'bg-white/5 border-white/10'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-white">
            {s.icon}
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">{s.title}</p>
            <p className="text-white/70 text-xs leading-relaxed mt-0.5">{s.desc}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function DownloadPage() {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setIsStandalone(
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  }, []);

  // Already installed — redirect to app
  if (isStandalone) {
    if (typeof window !== 'undefined') window.location.href = '/';
    return null;
  }

  return (
    <div
      className="fixed inset-0 overflow-y-auto w-full flex flex-col items-center z-[9999]"
      style={{ background: 'linear-gradient(160deg, #00D632 0%, #00a826 55%, #007a1c 100%)' }}
    >
      {/* Nav */}
      <header className="w-full max-w-lg flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
            <Image
              src="/cash-app-icon.png"
              alt="Cash App icon"
              width={36}
              height={36}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Cash App</span>
        </div>
        <a
          href="/"
          className="text-white/80 text-sm font-medium hover:text-white transition-colors"
        >
          Sign in
        </a>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full max-w-lg flex flex-col items-center px-6 pb-12">

        {/* Phone mockup */}
        <div className="relative w-56 h-auto mt-4 mb-8 drop-shadow-2xl">
          <Image
            src="/download-hero.png"
            alt="Cash App on iPhone"
            width={224}
            height={420}
            className="w-full h-auto object-contain rounded-3xl"
            priority
          />
        </div>

        {/* Headline */}
        <h1 className="text-white font-black text-3xl text-center leading-tight mb-3 text-balance">
          The money app<br />that works for you
        </h1>
        <p className="text-white/75 text-center text-sm leading-relaxed max-w-xs mb-8">
          Send money, pay bills, and invest — all from one simple app. Free to download, free to use.
        </p>

        {/* Platform-specific CTA */}
        {platform === 'ios' && (
          <div className="w-full flex flex-col items-center gap-3 max-w-xs">
            <DownloadButtons platform="ios" />
            <div id="ios-steps" className="w-full mt-2">
              <p className="text-white/60 text-xs font-semibold uppercase tracking-widest text-center mb-3">
                How to install
              </p>
              <IOSInstructions />
            </div>
          </div>
        )}

        {platform === 'android' && (
          <div className="w-full flex flex-col items-center gap-3 max-w-xs">
            <DownloadButtons platform="android" />
          </div>
        )}

        {(platform === 'desktop' || platform === 'unknown') && (
          <div className="w-full flex flex-col items-center gap-4 max-w-xs">
            <p className="text-white/70 text-sm text-center leading-relaxed">
              Open this page on your iPhone in Safari, then tap&nbsp;
              <span className="inline-flex items-center gap-1 bg-white/15 rounded px-1.5 py-0.5 text-white font-medium text-xs">
                Share
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>
              </span>
              &nbsp;then &ldquo;Add to Home Screen&rdquo; to install.
            </p>
            <DownloadButtons platform="desktop" />
          </div>
        )}

        {/* Ratings row */}
        <div className="flex items-center justify-center gap-8 mt-10 pt-8 border-t border-white/20 w-full">
          <div className="flex flex-col items-center gap-1">
            <p className="text-white font-black text-2xl">4.8</p>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i < 5 ? 'white' : 'none'} stroke="white" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ))}
            </div>
            <p className="text-white/60 text-[10px]">App Store</p>
          </div>

          <div className="w-px h-10 bg-white/20" />

          <div className="flex flex-col items-center gap-1">
            <p className="text-white font-black text-2xl">50M+</p>
            <p className="text-white/60 text-[10px]">Downloads</p>
          </div>

          <div className="w-px h-10 bg-white/20" />

          <div className="flex flex-col items-center gap-1">
            <p className="text-white font-black text-2xl">Free</p>
            <p className="text-white/60 text-[10px]">No fees to send</p>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {['Send Money', 'Receive Payments', 'Cash Card', 'Bitcoin', 'Stocks', 'Direct Deposit'].map(f => (
            <span key={f} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-medium">
              {f}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-lg px-6 pb-10 flex flex-col items-center gap-3">
        <p className="text-white/40 text-[10px] text-center leading-relaxed">
          Cash App is a financial services platform, not a bank. Banking services provided by Cash App&apos;s bank partners. &copy; {new Date().getFullYear()} Block, Inc.
        </p>
      </footer>
    </div>
  );
}
