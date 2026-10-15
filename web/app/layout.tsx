import './globals.css';
import { Be_Vietnam_Pro, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import SessionSync from './session-sync';

const body = Be_Vietnam_Pro({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-body', display: 'swap' });
const display = Space_Grotesk({ subsets: ['vietnamese', 'latin'], weight: ['500', '600', '700'], variable: '--font-display', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['vietnamese', 'latin'], weight: ['400', '500', '600', '700'], variable: '--font-mono', display: 'swap' });

export const metadata = { title: 'Cho Dem Ngau Hanh', description: 'Shop vat pham game tu dong 24/7' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body className="font-sans">
        <SessionSync />
        {children}
      </body>
    </html>
  );
}
