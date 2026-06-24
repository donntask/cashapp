'use client';

import AdminApp from '@/components/admin-app';
import { AuthProvider } from '@/contexts/auth-context';

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminApp />
    </AuthProvider>
  );
}
