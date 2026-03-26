import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'AVG Headcount Planning',
  description: 'Veterinary group resource and headcount planning tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-50 text-slate-900 antialiased">
        <div className="flex h-screen overflow-hidden">
          <Navigation />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
