'use client';

import { useEffect, useState } from 'react';
import CashAppMain from '@/components/cash-app';
import AdminApp from '@/components/admin-app';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

function AppContent() {
  const { isAdmin, isAuthenticated, sessionPersisted } = useAuth();
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
  
  // If not authenticated and no session was persisted, show auth page from CashApp/AdminApp
  // If authenticated or session persisted, check if admin
  if (isAuthenticated || sessionPersisted) {
    return isAdmin ? <AdminApp /> : <CashAppMain />;
  }
  
  // Default to CashApp which will show the auth flow
  return <CashAppMain />;
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
