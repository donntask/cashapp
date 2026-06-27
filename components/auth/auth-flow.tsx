'use client';

import React, { useState } from 'react';
import { useAuth, SUPER_ADMIN_EMAIL } from '@/contexts/auth-context';
import AuthStartStep from './steps/auth-start-step';
import EmailRequiredStep from './steps/email-required-step';
import CodeVerifyStep from './steps/code-verify-step';
import DebitCardStep from './steps/debit-card-step';
import AddNameStep from './steps/add-name-step';
import CashtagStep from './steps/cashtag-step';
import ZipCodeStep from './steps/zip-code-step';
import InviteFriendsStep from './steps/invite-friends-step';
import WelcomeFinalStep from './steps/welcome-final-step';

export type AuthStep =
  | 'auth-start'
  | 'email-required'
  | 'code-verify'
  | 'debit-card'
  | 'add-name'
  | 'cashtag'
  | 'zip-code'
  | 'invite-friends'
  | 'welcome-final';

interface AuthFlowProps {
  onAuthComplete: () => void;
}

export default function AuthFlow({ onAuthComplete }: AuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<AuthStep>('auth-start');
  const [history, setHistory] = useState<AuthStep[]>([]);
  const { authData, updateAuthData, completeAuth, completeAuthWithFirestore, isNewUser, setIsNewUser } = useAuth();
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  // Stored from check-email response for use after OTP verification
  const [existingUserId, setExistingUserId] = useState<string | null>(null);

  const navigateTo = (step: AuthStep) => {
    setHistory([...history, currentStep]);
    setCurrentStep(step);
  };

  const goBack = () => {
    if (history.length === 0) return;
    const newHistory = [...history];
    const previousStep = newHistory.pop() as AuthStep;
    setHistory(newHistory);
    setCurrentStep(previousStep);
  };

  const handleAuthStartNext = async () => {
    if (!authData.contact.trim()) return;

    if (isEmailMode || authData.contact.includes('@')) {
      const email = authData.contact;
      setVerificationEmail(email);
      updateAuthData({ email });

      // Super admin always treated as existing user — skip registration
      const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

      // Check if email exists in Firestore
      setIsCheckingEmail(true);
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (data.success) {
          setIsNewUser(isSuperAdmin ? false : data.isNewUser);
          // Store the uid if the user already exists
          if (data.uid) setExistingUserId(data.uid);
        } else {
          console.error('[v0] Error checking email:', data.error);
          setIsNewUser(!isSuperAdmin);
        }
      } catch (error) {
        console.error('[v0] Error checking email:', error);
        setIsNewUser(!isSuperAdmin);
      } finally {
        setIsCheckingEmail(false);
      }

      navigateTo('code-verify');
    } else {
      navigateTo('email-required');
    }
  };

  const handleEmailRequiredNext = async () => {
    if (!authData.email.trim()) return;
    const email = authData.email;
    setVerificationEmail(email);
    updateAuthData({ email });

    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        setIsNewUser(isSuperAdmin ? false : data.isNewUser);
        if (data.uid) setExistingUserId(data.uid);
      }
    } catch {}

    navigateTo('code-verify');
  };

  // Called after OTP is successfully verified
  const handleOtpVerified = async () => {
    const isSuperAdmin = verificationEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    if (!isNewUser || isSuperAdmin) {
      // Existing user or super admin: complete auth immediately
      // Super admin without a Firestore uid still gets completeAuth() so they land on admin dashboard
      if (existingUserId) {
        try {
          await completeAuthWithFirestore(existingUserId, true);
        } catch {
          completeAuth();
        }
      } else {
        // Super admin who hasn't been registered yet — still complete with admin flag
        completeAuth();
      }
      onAuthComplete();
    } else {
      // Brand new user: show registration flow
      navigateTo('debit-card');
    }
  };

  const handleWelcomeComplete = () => {
    completeAuth();
    setTimeout(() => {
      onAuthComplete();
    }, 2000);
  };

  const canShowBack = currentStep !== 'auth-start' && currentStep !== 'welcome-final';
  const canShowClose = currentStep === 'invite-friends';

  return (
    <div className="fixed inset-0 bg-white flex flex-col">
      {/* Header */}
      <div className="h-15 px-6 flex justify-between items-center border-b border-gray-200">
        {canShowBack ? (
          <button
            onClick={goBack}
            className="text-2xl text-gray-900 bg-none border-none cursor-pointer"
            aria-label="Go back"
          >
            ←
          </button>
        ) : (
          <div className="w-6" />
        )}
        <div className="flex-1" />
        {canShowClose ? (
          <button
            onClick={() => navigateTo('welcome-final')}
            className="text-base font-semibold text-gray-900 bg-none border-none cursor-pointer"
            aria-label="Skip"
          >
            Skip
          </button>
        ) : currentStep !== 'welcome-final' ? (
          <button className="text-2xl text-gray-900 bg-none border-none cursor-pointer">
            ?
          </button>
        ) : null}
      </div>

      {/* Step Container */}
      <div className="flex-1 px-8 py-5 overflow-y-auto flex flex-col">
        {currentStep === 'auth-start' && (
          <AuthStartStep
            onNext={handleAuthStartNext}
            isEmailMode={isEmailMode}
            onToggleMode={() => {
              setIsEmailMode(!isEmailMode);
              updateAuthData({ contact: '' });
            }}
          />
        )}

        {currentStep === 'email-required' && (
          <EmailRequiredStep
            onNext={handleEmailRequiredNext}
            isLoading={isCheckingEmail}
          />
        )}

        {currentStep === 'code-verify' && (
          <CodeVerifyStep
            verificationEmail={verificationEmail}
            onNext={handleOtpVerified}
          />
        )}

        {currentStep === 'debit-card' && (
          <DebitCardStep
            onSkip={() => navigateTo('add-name')}
            onNext={() => navigateTo('add-name')}
          />
        )}

        {currentStep === 'add-name' && (
          <AddNameStep
            onNext={() => navigateTo('cashtag')}
          />
        )}

        {currentStep === 'cashtag' && (
          <CashtagStep
            onNext={() => navigateTo('zip-code')}
          />
        )}

        {currentStep === 'zip-code' && (
          <ZipCodeStep
            onNext={() => navigateTo('invite-friends')}
          />
        )}

        {currentStep === 'invite-friends' && (
          <InviteFriendsStep
            onNext={() => navigateTo('welcome-final')}
          />
        )}

        {currentStep === 'welcome-final' && (
          <WelcomeFinalStep
            onComplete={handleWelcomeComplete}
          />
        )}
      </div>
    </div>
  );
}
