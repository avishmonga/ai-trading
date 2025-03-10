import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BinanceInitializer from '../components/BinanceInitializer';
import Navbar from '../components/Navbar';
import { WatchlistProvider } from '@/contexts/WatchlistContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Crypto Trading Platform',
  description:
    'Automated crypto analysis and AI-powered trading recommendations',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WatchlistProvider>
          <BinanceInitializer />
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
        </WatchlistProvider>
      </body>
    </html>
  );
}
