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
    <html lang="en">
      <body className="min-h-screen bg-[#faf9f7]">{children}</body>
    </html>
  );
}

