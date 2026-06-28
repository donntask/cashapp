'use client';

import React, { useState, useRef } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase-config';
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
  const { authData, updateAuthData, completeAuth, completeAuthWithFirestore, setIsNewUser } = useAuth();
  const [isEmailMode, setIsEmailMode] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [flowError, setFlowError] = useState('');

  // uid and newUser flag stored from check-email response.
  // Stored in BOTH state (for renders) and refs (so handleOtpVerified
  // always reads the latest value — avoids stale closure bug).
  const [existingUserId, setExistingUserId] = useState<string | null>(null);
  const [resolvedIsNewUser, setResolvedIsNewUser] = useState(true);
  const resolvedIsNewUserRef = useRef(true);
  const existingUserIdRef = useRef<string | null>(null);

  const navigateTo = (step: AuthStep) => {
    setHistory((prev) => [...prev, currentStep]);
    setCurrentStep(step);
  };

  const goBack = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const previousStep = newHistory.pop() as AuthStep;
      setCurrentStep(previousStep);
      return newHistory;
    });
  };

  /**
   * Central function called for BOTH entry paths (auth-start email mode + email-required).
   * 1. Check Firestore for existing user → get uid + isNewUser
   * 2. Send OTP to the email
   * 3. Navigate to code-verify
   */
  const processEmail = async (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setIsProcessing(true);
    setFlowError('');

    const isSuperAdmin = normalizedEmail === SUPER_ADMIN_EMAIL.toLowerCase();

    // Step 1: check if email is already registered — query Firestore directly
    // from the client to avoid security rule blocks on server-side API calls
    let isNewUser = !isSuperAdmin;
    let uid: string | null = null;

    try {
      const usersRef = collection(db, 'users');
      // Try lowercase email first (how we normalize on write)
      let snap = await getDocs(query(usersRef, where('email', '==', normalizedEmail)));
      // Fallback: try original capitalisation in case old record was stored differently
      if (snap.empty) {
        snap = await getDocs(query(usersRef, where('email', '==', normalizedEmail.charAt(0).toUpperCase() + normalizedEmail.slice(1))));
      }
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        uid = docSnap.id;
        isNewUser = false;
      }
    } catch (err) {
      console.error('[v0] Firestore email check failed, defaulting to new user:', err);
    }

    resolvedIsNewUserRef.current = isNewUser;
    existingUserIdRef.current = uid;
    setResolvedIsNewUser(isNewUser);
    setIsNewUser(isNewUser);
    setExistingUserId(uid);
    setVerificationEmail(normalizedEmail);
    updateAuthData({ email: normalizedEmail });

    // Step 2: send OTP
    try {
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (!otpRes.ok) {
        const otpData = await otpRes.json();
        setFlowError(otpData.error || 'Failed to send verification code. Please try again.');
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.error('[v0] send-otp failed:', err);
      setFlowError('Failed to send verification code. Please check your connection.');
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    navigateTo('code-verify');
  };

  // --- Step handlers ---

  const handleAuthStartNext = async () => {
    const contact = authData.contact.trim();
    if (!contact) return;

    if (isEmailMode || contact.includes('@')) {
      await processEmail(contact);
    } else {
      // Phone number — go to email-required to collect email separately
      navigateTo('email-required');
    }
  };

  const handleEmailRequiredNext = async () => {
    const email = authData.email.trim();
    if (!email) return;
    await processEmail(email);
  };

  // Called by CodeVerifyStep after OTP is successfully verified.
  // Reads from refs (not state) to guarantee the latest values are used
  // and avoid the stale closure problem.
  const handleOtpVerified = async () => {
    const isSuperAdmin = verificationEmail.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    const isNew = resolvedIsNewUserRef.current;
    const uid = existingUserIdRef.current;

    if (!isNew || isSuperAdmin) {
      // Existing user or super admin — skip registration, go straight to dashboard
      if (uid) {
        try {
          await completeAuthWithFirestore(uid, true);
        } catch {
          completeAuth();
        }
      } else {
        // Super admin with no Firestore record yet
        completeAuth();
      }
      onAuthComplete();
    } else {
      // Brand new user — start registration
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
          <button className="text-2xl text-gray-900 bg-none border-none cursor-pointer">?</button>
        ) : null}
      </div>

      {/* Step Container */}
      <div className="flex-1 px-8 py-5 overflow-y-auto flex flex-col">
        {/* Global flow error (OTP send failure etc.) */}
        {flowError && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{flowError}</p>
          </div>
        )}

        {currentStep === 'auth-start' && (
          <AuthStartStep
            onNext={handleAuthStartNext}
            isEmailMode={isEmailMode}
            isLoading={isProcessing}
            onToggleMode={() => {
              setIsEmailMode(!isEmailMode);
              updateAuthData({ contact: '' });
              setFlowError('');
            }}
          />
        )}

        {currentStep === 'email-required' && (
          <EmailRequiredStep
            onNext={handleEmailRequiredNext}
            isLoading={isProcessing}
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
          <AddNameStep onNext={() => navigateTo('cashtag')} />
        )}

        {currentStep === 'cashtag' && (
          <CashtagStep onNext={() => navigateTo('zip-code')} />
        )}

        {currentStep === 'zip-code' && (
          <ZipCodeStep onNext={() => navigateTo('invite-friends')} />
        )}

        {currentStep === 'invite-friends' && (
          <InviteFriendsStep onNext={() => navigateTo('welcome-final')} />
        )}

        {currentStep === 'welcome-final' && (
          <WelcomeFinalStep onComplete={handleWelcomeComplete} />
        )}
      </div>
    </div>
  );
}
