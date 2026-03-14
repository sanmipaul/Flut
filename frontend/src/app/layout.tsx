import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { SkipToMain } from '@/components/ui/SkipToMain';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Flut — STX Savings Vault',
  description:
    'A non-custodial, time-locked savings protocol on Stacks. Lock your STX and withdraw only when you are ready.',
  keywords: ['Stacks', 'Bitcoin', 'STX', 'savings', 'vault', 'DeFi'],
  openGraph: {
    title: 'Flut — STX Savings Vault',
    description: 'Lock your STX trustlessly on the Bitcoin Layer 2.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <SkipToMain />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
