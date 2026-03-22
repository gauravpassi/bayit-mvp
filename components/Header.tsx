'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Menu, X } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';
import clsx from 'clsx';

const NAV_LINKS = [
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Properties',   href: '#properties' },
  { label: 'Why Bayit',    href: '#why-bayit' },
  { label: 'Map',          href: '#map' },
];

export default function Header() {
  const { openChat } = useChatContext();
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-bayit-dark/95 backdrop-blur-md shadow-lg py-3'
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* Logo */}
        <a href="#" className="flex items-center gap-2">
          {/* Placeholder logo box */}
          <div className="w-8 h-8 rounded-lg bg-bayit-gold flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            bay<span className="text-bayit-gold">it</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="text-white/80 hover:text-bayit-gold text-sm font-medium transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={openChat}
            className="flex items-center gap-2 bg-bayit-gold hover:bg-bayit-gold-light text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
          >
            <MessageCircle size={15} />
            Chat with AI
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-bayit-dark border-t border-white/10 px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className="block w-full text-left text-white/80 hover:text-bayit-gold text-sm font-medium py-2 transition-colors"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { setMobileOpen(false); openChat(); }}
            className="flex items-center gap-2 bg-bayit-gold text-white text-sm font-semibold px-4 py-2 rounded-full mt-2"
          >
            <MessageCircle size={15} />
            Chat with AI
          </button>
        </div>
      )}
    </header>
  );
}
