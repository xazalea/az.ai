import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'az.ai - Unified AI Platform',
  description: 'Access 50+ AI models through a single OpenAI-compatible API with reasoning and memory.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a]">{children}</body>
    </html>
  );
}

