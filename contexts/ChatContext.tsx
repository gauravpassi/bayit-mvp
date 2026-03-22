'use client';

import React, { createContext, useCallback, useContext } from 'react';
import { useRouter } from 'next/navigation';

interface ChatContextValue {
  isOpen:     boolean;           // always false — chat is now a dedicated page
  openChat:   (query?: string) => void;
  closeChat:  () => void;
  toggleChat: () => void;
}

const ChatContext = createContext<ChatContextValue>({
  isOpen:     false,
  openChat:   () => {},
  closeChat:  () => {},
  toggleChat: () => {},
});

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Navigate to the dedicated chat page, optionally pre-filling a query
  const openChat = useCallback((query?: string) => {
    if (query?.trim()) {
      router.push(`/chat?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/chat');
    }
  }, [router]);

  const closeChat  = useCallback(() => {}, []);
  const toggleChat = useCallback(() => {}, []);

  return (
    <ChatContext.Provider value={{ isOpen: false, openChat, closeChat, toggleChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  return useContext(ChatContext);
}
