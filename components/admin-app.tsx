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

export default function AdminApp() {
  const { isAuthenticated, isAdmin, sessionPersisted, userId, setIsAdmin } = useAuth();
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
  const [searchedUsers, setSearchedUsers] = useState<any[]>([]);

  // Check for existing logged-in user on mount and verify Firestore admin status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // If session was persisted in auth context, restore it
        if (sessionPersisted || isAuthenticated) {
          setAuthFlowComplete(true);
          
          // Verify admin status from Firestore
          if (userId) {
            const { getUserAdminStatus } = await import('@/lib/firestore-service');
            const adminStatus = await getUserAdminStatus(userId);
            setIsAdmin(adminStatus);
          }
          return;
        }
        
        // Otherwise check localStorage
        const authData = localStorage.getItem('cashapp_auth_data');
        const userIdStored = localStorage.getItem('cashapp_user_id');
        
        // If user data exists in localStorage, they should remain logged in
        if (authData && userIdStored) {
          setAuthFlowComplete(true);
          
          // Verify admin status from Firestore
          const { getUserAdminStatus } = await import('@/lib/firestore-service');
          const adminStatus = await getUserAdminStatus(userIdStored);
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error('[v0] Error checking persistent auth:', error);
      }
    };
    
    checkAuthStatus();
  }, [isAuthenticated, sessionPersisted, userId, setIsAdmin]);

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

  // Hide navbar when PayPad page is active, payment flow is open, or profile is open
  const shouldHideNavbar = activeTab === 'paypad' || showPaymentFlow || showProfile || showSettings;
  
  return (
    <div className="relative w-full h-screen bg-[#F4F4F6] flex flex-col shadow-2xl overflow-hidden select-none" style={{ WebkitUserSelect: 'none', userSelect: 'none' }}>
      {/* Admin Header */}
      <div className="bg-[#00D632] text-white px-6 py-3 flex justify-between items-center flex-shrink-0">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <div className="text-sm opacity-90">CashApp Admin</div>
      </div>

      {/* Page Views - Account for fixed navbar height at bottom when navbar is visible */}
      <div className={`flex-1 overflow-y-auto ${!shouldHideNavbar ? 'pb-[70px]' : ''}`}>
        {activeTab === 'money' && <MoneyPage onOpenProfile={() => setShowProfile(true)} isAdmin={isAdmin} />}
        {activeTab === 'paypad' && (
          <PayPadPage
            amount={padAmount}
            onAmountChange={setPadAmount}
            onOpenProfile={() => setShowProfile(true)}
            onInitiatePayment={handleInitiatePayment}
            onNavigateToMoney={() => setActiveTab('money')}
            onNavigateToActivity={() => setActiveTab('activity')}
            isAdmin={isAdmin}
            onAddSearchedUser={(user) => setSearchedUsers([...searchedUsers, user])}
          />
        )}
        {activeTab === 'activity' && <ActivityPage onOpenProfile={() => setShowProfile(true)} isAdmin={isAdmin} />}
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

      {/* Bottom Navigation - Hide when payment flow or profile is open */}
      {!shouldHideNavbar && (
        <div className="absolute bottom-0 left-0 right-0 z-50">
          <BottomNavbar
            activeTab={activeTab as any}
            onTabChange={setActiveTab as any}
            isPayPadActive={activeTab === 'paypad'}
            canGoBack={selectedAccountSetting !== null}
            onGoBack={handleGoBack}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  );
}
