import '@/app/globals.css';
import { Providers } from '@/components/shared/providers';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { StagewiseToolbar } from '@stagewise/toolbar-next';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nox - Modern SaaS Platform',
  description: 'A modern SaaS platform with subscription-based features',
};

// Configure stagewise toolbar
const stagewiseConfig = {
  plugins: []
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'development' && <StagewiseToolbar config={stagewiseConfig} />}
        </Providers>
      </body>
    </html>
  );
}
