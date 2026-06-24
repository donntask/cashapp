'use client';

import { useState, useEffect } from 'react';
import MoneyPage from './pages/money-page';
import PayPadPage from './pages/paypad-page';
import ActivityPage from './pages/activity-page';
import ProfileOverlay from './overlays/profile-overlay';
import PaymentFlow from './overlays/payment-flow';
import BottomNavbar from './bottom-navbar';
import AuthFlow from './auth/auth-flow';
import { useAuth } from '@/contexts/auth-context';

export default function CashApp() {
  const { isAuthenticated } = useAuth();
  const [authFlowComplete, setAuthFlowComplete] = useState(false);

  // Check for existing logged-in user on mount
  useEffect(() => {
    try {
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
      
      // Otherwise check if user is authenticated via auth context
      if (isAuthenticated) {
        setAuthFlowComplete(true);
      }
    } catch (error) {
      console.error('[v0] Error checking persistent auth:', error);
    }
  }, [isAuthenticated]);
  const [activeTab, setActiveTab] = useState<'money' | 'paypad' | 'activity'>('money');
  const [showProfile, setShowProfile] = useState(false);
  const [showPaymentFlow, setShowPaymentFlow] = useState(false);
  const [paymentFlowStep, setPaymentFlowStep] = useState<'recipient' | 'pin' | 'status'>('recipient');
  const [padAmount, setPadAmount] = useState('0');
  const [globalTransactionType, setGlobalTransactionType] = useState<'Pay' | 'Request'>('Pay');

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
  const shouldHideNavbar = activeTab === 'paypad' || showPaymentFlow || showProfile;
  
  return (
    <div className="relative w-full max-w-[412px] h-screen max-h-[844px] bg-[#F4F4F6] flex flex-col shadow-2xl overflow-hidden">
      {/* Page Views - Account for fixed navbar height at bottom when navbar is visible */}
      <div className={`flex-1 overflow-y-auto ${!shouldHideNavbar ? 'pb-[70px]' : ''}`}>
        {activeTab === 'money' && <MoneyPage onOpenProfile={() => setShowProfile(true)} />}
        {activeTab === 'paypad' && (
          <PayPadPage
            amount={padAmount}
            onAmountChange={setPadAmount}
            onOpenProfile={() => setShowProfile(true)}
            onInitiatePayment={handleInitiatePayment}
          />
        )}
        {activeTab === 'activity' && <ActivityPage onOpenProfile={() => setShowProfile(true)} />}
      </div>

      {/* Overlays */}
      {showProfile && <ProfileOverlay onClose={() => setShowProfile(false)} />}
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
          />
        </div>
      )}
    </div>
  );
}
