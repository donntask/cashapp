'use client';

import { useState, useEffect } from 'react';
import MoneyPage from './pages/money-page';
import PayPadPage from './pages/paypad-page';
import ActivityPage from './pages/activity-page';
import ProfileOverlay from './overlays/profile-overlay';
import SettingsOverlay from './overlays/settings-overlay';
import SecurityPrivacyOverlay from './overlays/security-privacy-overlay';
import AdminActionsOverlay from './overlays/admin-actions-overlay';
import PaymentFlow from './overlays/payment-flow';
import BottomNavbar from './bottom-navbar';
import AuthFlow from './auth/auth-flow';
import { useAuth } from '@/contexts/auth-context';

export default function CashApp() {
  const { isAuthenticated, sessionPersisted, isAdmin } = useAuth();
  const [authFlowComplete, setAuthFlowComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'money' | 'paypad' | 'activity'>('money');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSecurityPrivacy, setShowSecurityPrivacy] = useState(false);
  const [showAdminActions, setShowAdminActions] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentFlowStep, setPaymentFlowStep] = useState<'recipient' | 'pin' | 'status'>('recipient');
  const [padAmount, setPadAmount] = useState('0');
  const [globalTransactionType, setGlobalTransactionType] = useState<'Pay' | 'Request'>('Pay');
  const [screenHistory, setScreenHistory] = useState<Array<{ type: string; data?: any }>>([]);
  const [selectedAccountSetting, setSelectedAccountSetting] = useState<string | null>(null);

  // Check for existing logged-in user on mount
  useEffect(() => {
    try {
      // If session was restored from auth context, mark auth flow as complete
      if (sessionPersisted || isAuthenticated) {
        setAuthFlowComplete(true);
        return;
      }

      const authData = localStorage.getItem('cashapp_auth_data');
      const appData = localStorage.getItem('cashapp_app_data');
      
      // If user data exists in localStorage, they should remain logged in
      if (authData && appData) {
        const parsed = JSON.parse(authData);
        if (parsed && Object.keys(parsed).length > 0) {
          setAuthFlowComplete(true);
          return;
        }
      }
    } catch (error) {
      console.error('[v0] Error checking persistent auth:', error);
    }
  }, [isAuthenticated, sessionPersisted]);

  const handleGoBack = () => {
    if (screenHistory.length > 0) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      setScreenHistory(newHistory);
      const previousScreen = newHistory[newHistory.length - 1];
      if (previousScreen?.type === 'profile') {
        setShowProfile(true);
        setSelectedAccountSetting(null);
      } else if (previousScreen?.type === 'accountSetting') {
        setSelectedAccountSetting(previousScreen.data);
      }
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

  // Hide navbar when PayPad page is active, payment flow is open, or profile/settings is open
  const shouldHideNavbar = activeTab === 'paypad' || showPaymentFlow || showProfile || showSettings || showSecurityPrivacy || showAdminActions;
  
  return (
    <div className="relative w-full max-w-[412px] h-screen max-h-[844px] bg-[#F4F4F6] flex flex-col shadow-2xl overflow-hidden select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      {/* Admin Header */}
      {isAdmin && (
        <div className="bg-[#00D632] text-white px-6 py-3 flex justify-between items-center flex-shrink-0">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="text-sm opacity-90">CashApp Admin</div>
        </div>
      )}

      {/* Page Views - Account for fixed navbar height at bottom when navbar is visible */}
      <div className={`flex-1 overflow-y-auto ${!shouldHideNavbar ? 'pb-[70px]' : ''}`}>
        {activeTab === 'money' && (
          <MoneyPage 
            onOpenProfile={() => setShowProfile(true)} 
            isAdmin={isAdmin}
            onOpenAdminActions={isAdmin ? () => setShowAdminActions(true) : undefined}
          />
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
        {activeTab === 'activity' && <ActivityPage onOpenProfile={() => setShowProfile(true)} />}
      </div>

      {/* Overlays */}
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
      {showSettings && <SettingsOverlay isOpen={showSettings} onClose={() => setShowSettings(false)} />}
      {showSecurityPrivacy && <SecurityPrivacyOverlay isOpen={showSecurityPrivacy} onClose={() => setShowSecurityPrivacy(false)} />}
      {showAdminActions && isAdmin && <AdminActionsOverlay isOpen={showAdminActions} onClose={() => setShowAdminActions(false)} />}
      {showPaymentFlow && (
        <PaymentFlow
          step={paymentFlowStep}
          amount={padAmount}
          transactionType={globalTransactionType}
          onStepChange={setPaymentFlowStep}
          onClose={handleExitPaymentFlow}
        />
      )}

      {/* Bottom Navigation - Hide when PayPad page, payment flow, or profile is open */}
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
