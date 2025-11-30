import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { NavBar } from '@/components/NavBar';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://bellum.ai'),
  title: {
    default: 'Bellum',
    template: '%s | Bellum',
  },
  description: 'High-Performance Web Native Computing. Run x86 binaries and DirectX 12 games directly in your browser.',
  keywords: [
    'Bellum',
    'WebGPU',
    'DirectX 12',
    'x86 emulation',
    'cloud gaming',
    'web assembly',
    'compiler',
  ],
  authors: [{ name: 'Bellum' }],
  creator: 'Bellum',
  publisher: 'Bellum',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Bellum',
    title: 'Bellum - Web Native Computing',
    description: 'Run x86 binaries and DirectX 12 games directly in your browser.',
    images: [
      {
        url: '/az.png', // TODO: Update logo
        width: 1200,
        height: 630,
        alt: 'Bellum',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bellum',
    description: 'Run x86 binaries and DirectX 12 games directly in your browser.',
    images: ['/az.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/az.png" />
        <link rel="apple-touch-icon" href="/az.png" />
        <meta name="theme-color" content="#050505" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Origin Trial Token for WebGPU if needed, though mostly standard now */}
      </head>
      <body className="min-h-screen bg-[#050505] font-sans antialiased text-white selection:bg-white/20">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
