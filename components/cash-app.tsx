'use client';

import { useState, useEffect } from 'react';
import MoneyPage from './pages/money-page';
import PayPadPage from './pages/paypad-page';
import ActivityPage from './pages/activity-page';
import ProfileOverlay from './overlays/profile-overlay';
import SettingsOverlay from './overlays/settings-overlay';
import PaymentFlow from './overlays/payment-flow';
import BottomNavbar from './bottom-navbar';
import AuthFlow from './auth/auth-flow';
import { useAuth } from '@/contexts/auth-context';

export default function CashApp() {
  const { isAuthenticated, sessionPersisted, userId, isAdmin, setIsAdmin } = useAuth();
  const [authFlowComplete, setAuthFlowComplete] = useState(false);
  const [activeTab, setActiveTab] = useState<'money' | 'paypad' | 'activity'>('money');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentFlowStep, setPaymentFlowStep] = useState<'recipient' | 'pin' | 'status'>('recipient');
  const [padAmount, setPadAmount] = useState('0');
  const [globalTransactionType, setGlobalTransactionType] = useState<'Pay' | 'Request'>('Pay');
  const [screenHistory, setScreenHistory] = useState<Array<{ type: string; data?: any }>>([]);
  const [selectedAccountSetting, setSelectedAccountSetting] = useState<string | null>(null);

  // Check for persistent session and verify Firestore admin status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // If session persisted from auth context, we're authenticated
        if (sessionPersisted || isAuthenticated) {
          setAuthFlowComplete(true);
          
          // Check Firestore for admin status
          if (userId) {
            const { getUserAdminStatus } = await import('@/lib/firestore-service');
            const adminStatus = await getUserAdminStatus(userId);
            setIsAdmin(adminStatus);
          }
          return;
        }
        
        // Otherwise check localStorage as fallback
        const authData = localStorage.getItem('cashapp_auth_data');
        const userIdStored = localStorage.getItem('cashapp_user_id');
        
        if (authData && userIdStored) {
          setAuthFlowComplete(true);
          
          // Check Firestore for admin status
          const { getUserAdminStatus } = await import('@/lib/firestore-service');
          const adminStatus = await getUserAdminStatus(userIdStored);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('[v0] Error checking auth status:', error);
      }
    };
    
    checkAuthStatus();
  }, [sessionPersisted, isAuthenticated, userId, setIsAdmin]);

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
  const shouldHideNavbar = activeTab === 'paypad' || showPaymentFlow || showProfile || showSettings;
  
  return (
    <div className="relative w-full max-w-[412px] h-screen max-h-[844px] bg-[#F4F4F6] flex flex-col shadow-2xl overflow-hidden select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      {/* Page Views - Account for fixed navbar height at bottom when navbar is visible */}
      <div className={`flex-1 overflow-y-auto ${!shouldHideNavbar ? 'pb-[70px]' : ''}`}>
        {activeTab === 'money' && <MoneyPage onOpenProfile={() => setShowProfile(true)} />}
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
            setSelectedAccountSetting(setting);
            setScreenHistory([...screenHistory, { type: 'profile' }, { type: 'accountSetting', data: setting }]);
          }}
          onOpenSettings={() => {
            setShowProfile(false);
            setShowSettings(true);
          }}
        />
      )}
      {showSettings && <SettingsOverlay isOpen={showSettings} onClose={() => setShowSettings(false)} />}
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
