import type { Metadata } from 'next';
import './globals.css';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: 'Bayit – Find Your Perfect Property in Morocco',
  description:
    'AI-powered real estate search for Morocco. Describe what you need and let Bayit\'s intelligent assistant find your perfect home in Marrakech, Casablanca, Rabat, Agadir, and more.',
  keywords: 'Morocco real estate, property Morocco, buy house Morocco, riad Marrakech, apartment Casablanca',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-bayit-cream text-bayit-dark antialiased">
        <ChatProvider>
          {children}
          {/* Chat widget is always present so it can be opened from anywhere */}
          <ChatWidget />
        </ChatProvider>
      </body>
    </html>
  );
}
