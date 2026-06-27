'use client';

import { useEffect, useState } from 'react';
import CashAppMain from '@/components/cash-app';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

function AppContent() {
  const { isAuthenticated, sessionPersisted } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait a tick to ensure auth context is fully loaded
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null;
  }
  
  // CashAppMain now handles both admin and regular user modes based on isAdmin flag
  return <CashAppMain />;
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
