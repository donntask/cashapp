'use client';

import { useState } from 'react';
import MoneyPage from './pages/money-page';
import PayPadPage from './pages/paypad-page';
import ActivityPage from './pages/activity-page';
import ProfileOverlay from './overlays/profile-overlay';
import PaymentFlow from './overlays/payment-flow';
import BottomNavbar from './bottom-navbar';
import AuthFlow from './auth/auth-flow';
import { useAuth } from '@/contexts/auth-context';

export default function BushFiApp() {
  const { isAuthenticated } = useAuth();
  const [authFlowComplete, setAuthFlowComplete] = useState(isAuthenticated);
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

  return (
    <div className="relative w-full max-w-[412px] h-screen max-h-[844px] bg-[#F4F4F6] flex flex-col shadow-2xl overflow-hidden">
      {/* Page Views */}
      <div className="flex-1 overflow-y-auto">
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

      {/* Bottom Navigation */}
      <BottomNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isPayPadActive={activeTab === 'paypad'}
      />
    </div>
  );
}
