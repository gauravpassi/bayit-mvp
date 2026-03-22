import type { Metadata } from 'next';
import ChatInterface from '@/components/ChatInterface';

export const metadata: Metadata = {
  title: 'Chat with bAytI — Morocco Real Estate Advisor',
  description: 'Describe what you want and bAytI will guide you to the right property in Morocco.',
};

export default function ChatPage() {
  return <ChatInterface />;
}
