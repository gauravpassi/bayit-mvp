'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

// bAytI brand logotype — house icon + wordmark with A and I accented in blue
function BaytiLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Blue square with house icon */}
      <div className="w-8 h-8 bg-bayit-blue rounded-lg flex items-center justify-center shadow-sm">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2L2 7.5V14h4.5v-4h3v4H14V7.5L8 2Z" fill="white" strokeWidth="0" />
        </svg>
      </div>
      {/* Wordmark */}
      <span className="font-bold text-xl tracking-tight">
        <span className="text-bayit-dark">b</span>
        <span className="text-bayit-blue">A</span>
        <span className="text-bayit-dark">yt</span>
        <span className="text-bayit-blue">I</span>
      </span>
    </div>
  );
}

const NAV_LINKS = [
  { label: 'Home',       href: '/'          },
  { label: 'Properties', href: '/properties' },
  { label: 'About us',   href: '/#why-bayit' },
  { label: 'Contact',    href: '/#contact'   },
];

export default function Header() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
        scrolled
          ? 'bg-white/96 backdrop-blur-md shadow-sm border-b border-bayit-border py-3'
          : 'bg-white py-4'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <BaytiLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              className="text-bayit-gray hover:text-bayit-dark text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Chat CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/chat"
            className="bg-bayit-blue hover:bg-bayit-blue-dark text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors shadow-sm"
          >
            Chat with bAytI
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-bayit-dark p-1"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-bayit-border px-4 py-3 space-y-0.5">
          {NAV_LINKS.map(link => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-bayit-gray hover:text-bayit-blue text-sm font-medium py-2.5 px-2 rounded-lg hover:bg-bayit-blue-soft transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="block text-center bg-bayit-blue text-white text-sm font-semibold px-4 py-2.5 rounded-full"
            >
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
