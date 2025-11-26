import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://az.ai'),
  title: {
    default: 'az.ai - Unified AI Platform',
    template: '%s | az.ai',
  },
  description: 'Access 1300+ AI models through a single OpenAI-compatible API. Better prices, better uptime, no subscription. Includes advanced reasoning and memory systems.',
  keywords: [
    'AI API',
    'OpenAI compatible',
    'GPT-5',
    'Claude Opus',
    'Gemini',
    'DeepSeek',
    'AI models',
    'unified AI',
    'OpenReason',
    'OpenMemory',
    'AI reasoning',
    'AI memory',
    'chat completions',
    'image generation',
    'video generation',
  ],
  authors: [{ name: 'az.ai' }],
  creator: 'az.ai',
  publisher: 'az.ai',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'az.ai',
    title: 'az.ai - Unified AI Platform',
    description: 'Access 1300+ AI models through a single OpenAI-compatible API with reasoning and memory.',
    images: [
      {
        url: '/az.png',
        width: 1200,
        height: 630,
        alt: 'az.ai - Unified AI Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'az.ai - Unified AI Platform',
    description: 'Access 1300+ AI models through a single OpenAI-compatible API with reasoning and memory.',
    images: ['/az.png'],
    creator: '@azai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
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
        <meta name="theme-color" content="#faf9f7" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'az.ai',
              description: 'Unified AI Platform - Access 1300+ AI models through a single OpenAI-compatible API',
              url: 'https://az.ai',
              applicationCategory: 'DeveloperApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '5',
                ratingCount: '1',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-[#faf9f7] font-sans antialiased">{children}</body>
    </html>
  );
}

