'use client';

import CashAppMain from '@/components/cash-app';
import { AuthProvider } from '@/contexts/auth-context';

export default function Page() {
  return (
    <AuthProvider>
      <CashAppMain />
    </AuthProvider>
  );
}
