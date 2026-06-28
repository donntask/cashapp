import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Download Cash App',
  description: 'Send money for free, invest in stocks or bitcoin, and bank like you want to with Cash App.',
  openGraph: {
    title: 'Download Cash App',
    description: 'Send money for free, invest in stocks or bitcoin, and bank like you want to.',
    images: ['/pwa-icon-512.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#00D632',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-y-auto">
      {children}
    </div>
  );
}
