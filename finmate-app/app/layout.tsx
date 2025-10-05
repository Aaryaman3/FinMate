import type { Metadata } from 'next';
import './globals.css';
import { EchoProvider } from '@/components/echo-provider';

export const metadata: Metadata = {
  title: 'FinMate - AI Financial Assistant for International Students',
  description: 'Your AI-powered financial companion for navigating U.S. banking, taxes, and credit as an international student',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <EchoProvider>
          {children}
        </EchoProvider>
      </body>
    </html>
  );
}
