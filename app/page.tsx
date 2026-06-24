'use client';

import CashApp from '@/components/bush-fi-app';
import { AuthProvider } from '@/contexts/auth-context';

export default function Page() {
  return (
    <AuthProvider>
      <CashApp />
    </AuthProvider>
  );
}
