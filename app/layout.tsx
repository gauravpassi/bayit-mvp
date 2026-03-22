import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { ChatProvider }         from '@/contexts/ChatContext';
import { PropertyModalProvider } from '@/contexts/PropertyModalContext';
import CacheWarmer               from '@/components/CacheWarmer';

// Serif for headings — warmth, authority, subtle luxury
const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  display:  'swap',
  weight:   ['400', '500', '600', '700'],
});

// Clean humanist sans for body — readable, friendly
const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'bAytI — Discover Your Home in Morocco',
  description:
    'Thoughtfully curated real estate across Morocco. Tell bAytI what you\'re looking for and discover homes that feel right.',
  keywords: 'Morocco real estate, property Morocco, buy house Morocco, riad Marrakech, apartment Casablanca',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`scroll-smooth ${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-white text-bayit-dark antialiased font-sans">
        <PropertyModalProvider>
          <ChatProvider>
            {children}
            <CacheWarmer />
          </ChatProvider>
        </PropertyModalProvider>
      </body>
    </html>
  );
}
