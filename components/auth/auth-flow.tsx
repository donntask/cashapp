'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
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
  const { authData, updateAuthData, completeAuth, isOtpVerified, isNewUser } = useAuth();
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

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

  const handleAuthStartNext = () => {
    if (!authData.contact.trim()) return;

    if (isEmailMode || authData.contact.includes('@')) {
      setVerificationEmail(authData.contact);
      navigateTo('code-verify');
    } else {
      navigateTo('email-required');
    }
  };

  const handleEmailRequiredNext = () => {
    if (!authData.email.trim()) return;
    setVerificationEmail(authData.email);
    navigateTo('code-verify');
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
          />
        )}

        {currentStep === 'code-verify' && (
          <CodeVerifyStep
            verificationEmail={verificationEmail}
            onNext={() => {
              // If user is NOT new (existing user), go directly to dashboard
              if (!isNewUser) {
                completeAuth();
                setTimeout(() => {
                  onAuthComplete();
                }, 500);
              } else {
                // For new users, continue with registration steps
                navigateTo('debit-card');
              }
            }}
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
