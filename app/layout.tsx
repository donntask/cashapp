import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { ToastProvider } from '@/contexts/toast-context'
import ToastDisplay from '@/components/toast-display'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cash App',
  description: 'Send, receive, and invest money with Cash App.',
  generator: 'v0.dev',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Cash App',
    startupImage: '/cash-app-icon.png',
  },
  icons: {
    icon: [
      { url: '/cash-app-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/cash-app-icon.png', sizes: '180x180' },
      { url: '/cash-app-icon.png', sizes: '512x512' },
    ],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#00D632',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-[#E5E7EB]`}>
      <body className="font-sans antialiased bg-[#E5E7EB] h-screen w-screen overflow-hidden flex justify-center items-center">
        <ToastProvider>
          {children}
          <ToastDisplay />
        </ToastProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
