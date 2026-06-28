'use client';

import { useState, useEffect } from 'react';
import MoneyPage from './pages/money-page';
import PayPadPage from './pages/paypad-page';
import ActivityPage from './pages/activity-page';
import AdminDiscoveryPage from './pages/admin-discovery-page';
import BrowserPage from './pages/browser-page';
import ProfileOverlay from './overlays/profile-overlay';
import SettingsOverlay from './overlays/settings-overlay';
import SecurityPrivacyOverlay from './overlays/security-privacy-overlay';
import PaymentFlow from './overlays/payment-flow';
import BottomNavbar from './bottom-navbar';
import AuthFlow from './auth/auth-flow';
import { useAuth } from '@/contexts/auth-context';

type Tab = 'money' | 'card' | 'paypad' | 'search' | 'activity';

export default function CashApp() {
  const { isAuthenticated, sessionPersisted, isAdmin } = useAuth();
  const [authFlowComplete, setAuthFlowComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('money');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSecurityPrivacy, setShowSecurityPrivacy] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentFlowStep, setPaymentFlowStep] = useState<'recipient' | 'pin' | 'status'>('recipient');
  const [padAmount, setPadAmount] = useState('0');
  const [globalTransactionType, setGlobalTransactionType] = useState<'Pay' | 'Request'>('Pay');
  const [screenHistory, setScreenHistory] = useState<Array<{ type: string; data?: any }>>([]);
  const [selectedAccountSetting, setSelectedAccountSetting] = useState<string | null>(null);

  useEffect(() => {
    if (sessionPersisted || isAuthenticated) {
      setAuthFlowComplete(true);
      return;
    }
    try {
      const authData = localStorage.getItem('cashapp_auth_data');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed && Object.keys(parsed).length > 0) {
          setAuthFlowComplete(true);
        }
      }
    } catch {}
  }, [isAuthenticated, sessionPersisted]);

  const handleGoBack = () => {
    const newHistory = [...screenHistory];
    newHistory.pop();
    setScreenHistory(newHistory);
    const prev = newHistory[newHistory.length - 1];
    if (prev?.type === 'profile') {
      setShowProfile(true);
      setSelectedAccountSetting(null);
    } else if (prev?.type === 'accountSetting') {
      setSelectedAccountSetting(prev.data);
    }
  };

  const handleInitiatePayment = (type: 'Pay' | 'Request') => {
    if (padAmount === '0') return;
    setGlobalTransactionType(type);
    setPaymentFlowStep('recipient');
    setShowPaymentFlow(true);
  };

  const handleExitPaymentFlow = () => {
    setShowPaymentFlow(false);
    setPadAmount('0');
  };

  if (!authFlowComplete) {
    return <AuthFlow onAuthComplete={() => setAuthFlowComplete(true)} />;
  }

  // Hide navbar when paypad is open (it renders its own nav) or overlays are up
  const shouldHideNavbar =
    activeTab === 'paypad' || showPaymentFlow || showProfile || showSettings || showSecurityPrivacy;

  return (
    <div
      className="relative w-full max-w-[412px] h-screen max-h-[844px] bg-[#F4F4F6] flex flex-col shadow-2xl overflow-hidden select-none"
      style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      {/* Page content */}
      <div className={`flex-1 overflow-y-auto ${!shouldHideNavbar ? 'pb-[70px]' : ''}`}>

        {activeTab === 'money' && (
          <MoneyPage
            onOpenProfile={() => setShowProfile(true)}
            isAdmin={isAdmin}
            onOpenAdminActions={isAdmin ? () => setActiveTab('search') : undefined}
          />
        )}

        {activeTab === 'card' && (
          // Card tab — placeholder, same for admin and user
          <div className="flex flex-col items-center justify-center h-full gap-4 px-6 py-20">
            <div className="w-20 h-20 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#B3B3B7" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <p className="text-xl font-bold text-[#111111]">Cash Card</p>
            <p className="text-sm text-[#8E8E93] text-center">Your Cash Card will appear here once activated.</p>
          </div>
        )}

        {activeTab === 'paypad' && (
          <PayPadPage
            amount={padAmount}
            onAmountChange={setPadAmount}
            onOpenProfile={() => setShowProfile(true)}
            onInitiatePayment={handleInitiatePayment}
            onNavigateToMoney={() => setActiveTab('money')}
            onNavigateToActivity={() => setActiveTab('activity')}
          />
        )}

        {activeTab === 'search' && (
          // Admins get user management; regular users get a coming-soon placeholder
          isAdmin ? (
            <AdminDiscoveryPage onOpenProfile={() => setShowProfile(true)} />
          ) : (
            <BrowserPage onOpenProfile={() => setShowProfile(true)} />
          )
        )}

        {activeTab === 'activity' && (
          <ActivityPage onOpenProfile={() => setShowProfile(true)} />
        )}
      </div>

      {/* Overlays — same for admin and user */}
      {showProfile && (
        <ProfileOverlay
          onClose={() => setShowProfile(false)}
          onSelectSetting={(setting: string) => {
            if (setting === 'Security & Privacy') {
              setShowProfile(false);
              setShowSecurityPrivacy(true);
            } else {
              setSelectedAccountSetting(setting);
              setScreenHistory([...screenHistory, { type: 'profile' }, { type: 'accountSetting', data: setting }]);
            }
          }}
          onOpenSettings={() => {
            setShowProfile(false);
            setShowSettings(true);
          }}
        />
      )}
      {showSettings && (
        <SettingsOverlay isOpen={showSettings} onClose={() => setShowSettings(false)} />
      )}
      {showSecurityPrivacy && (
        <SecurityPrivacyOverlay isOpen={showSecurityPrivacy} onClose={() => setShowSecurityPrivacy(false)} />
      )}
      {showPaymentFlow && (
        <PaymentFlow
          step={paymentFlowStep}
          amount={padAmount}
          transactionType={globalTransactionType}
          onStepChange={setPaymentFlowStep}
          onClose={handleExitPaymentFlow}
        />
      )}

      {/* Bottom Navigation */}
      {!shouldHideNavbar && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <BottomNavbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isPayPadActive={activeTab === 'paypad'}
            canGoBack={selectedAccountSetting !== null}
            onGoBack={handleGoBack}
          />
        </div>
      )}
    </div>
  );
}
