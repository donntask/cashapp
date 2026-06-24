import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - CashApp',
  description: 'Admin dashboard for CashApp management',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
