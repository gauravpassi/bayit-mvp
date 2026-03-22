import Header             from '@/components/Header';
import Hero               from '@/components/Hero';
import HowItWorks         from '@/components/HowItWorks';
import FeaturedProperties from '@/components/FeaturedProperties';
import WhyBayit           from '@/components/WhyBayit';
import Link               from 'next/link';
import { MapPin }         from 'lucide-react';
import dynamic            from 'next/dynamic';

// Reuse the same light map background for the teaser section
const HeroMapBg = dynamic(() => import('@/components/HeroMapBg'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-bayit-blue-soft" />,
});

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-bayit-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-bayit-blue rounded-lg flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 7.5V14h4.5v-4h3v4H14V7.5L8 2Z" fill="white" />
            </svg>
          </div>
          <span className="text-bayit-dark font-bold text-lg tracking-tight">
            b<span className="text-bayit-blue">A</span>yt<span className="text-bayit-blue">I</span>
          </span>
        </div>
        <p className="text-bayit-muted text-sm text-center">
          © {new Date().getFullYear()} bAytI · AI-Powered Real Estate · Morocco
        </p>
        <div className="flex gap-5 text-bayit-muted text-xs">
          <a href="#" className="hover:text-bayit-blue transition-colors">Privacy</a>
          <a href="#" className="hover:text-bayit-blue transition-colors">Terms</a>
          <a href="#" className="hover:text-bayit-blue transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// ── Map teaser strip (replaces full MapSection on homepage) ───────────────────
function MapTeaser() {
  return (
    <section className="py-20 bg-bayit-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-bayit-border shadow-card overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10">
            {/* Left */}
            <div className="flex-1">
              <span className="section-badge mb-4">Interactive Map</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-bayit-dark mt-3 mb-3">
                Explore properties across Morocco
              </h2>
              <p className="text-bayit-gray text-base mb-6 max-w-sm">
                Browse the full map + list view. Filter by city, price, and type. Click any marker for details.
              </p>
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 bg-bayit-blue hover:bg-bayit-blue-dark text-white font-semibold px-6 py-3 rounded-full transition-colors shadow-sm"
              >
                <MapPin size={16} />
                Open Map View
              </Link>
            </div>
            {/* Right — mini real map preview */}
            <div className="shrink-0 w-full sm:w-72 h-44 rounded-xl overflow-hidden border border-bayit-border relative pointer-events-none">
              <HeroMapBg />
              {/* Floating price chips over the real map */}
              <div className="absolute top-3 left-6 z-[400] price-bubble-marker text-xs pointer-events-none">2,500,000 MAD</div>
              <div className="absolute bottom-6 right-4 z-[400] price-bubble-marker selected text-xs pointer-events-none">1,800,000 MAD</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <FeaturedProperties />
      <WhyBayit />
      <MapTeaser />
      <Footer />
    </main>
  );
}
