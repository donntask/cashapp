'use client';

import { useState, useEffect } from 'react';
import CashAppMain from '@/components/cash-app';
import AdminApp from '@/components/admin-app';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

function AppContent() {
  const { isAdmin, sessionPersisted } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for Firestore to load user profile and determine admin status
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="w-full h-screen bg-[#F4F4F6] flex justify-center items-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00D632] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAdmin ? <AdminApp /> : <CashAppMain />;
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
