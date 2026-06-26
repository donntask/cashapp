'use client';

import CashAppMain from '@/components/cash-app';
import AdminApp from '@/components/admin-app';
import { AuthProvider, useAuth } from '@/contexts/auth-context';

function AppContent() {
  const { isAdmin, isAuthenticated, sessionPersisted } = useAuth();
  
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
