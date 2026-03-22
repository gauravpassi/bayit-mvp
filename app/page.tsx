import Header             from '@/components/Header';
import Hero               from '@/components/Hero';
import HowItWorks         from '@/components/HowItWorks';
import FeaturedProperties from '@/components/FeaturedProperties';
import WhyBayit           from '@/components/WhyBayit';
import MapSection         from '@/components/MapSection';

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-bayit-dark border-t border-white/8 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-bayit-gold flex items-center justify-center">
            <span className="text-white font-bold text-xs">B</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            bay<span className="text-bayit-gold">it</span>
          </span>
        </div>
        <p className="text-white/40 text-sm text-center">
          © {new Date().getFullYear()} Bayit · AI-Powered Real Estate · Morocco
        </p>
        <div className="flex gap-5 text-white/40 text-xs">
          <a href="#" className="hover:text-bayit-gold transition-colors">Privacy</a>
          <a href="#" className="hover:text-bayit-gold transition-colors">Terms</a>
          <a href="#" className="hover:text-bayit-gold transition-colors">Contact</a>
        </div>
      </div>
    </footer>
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
      <MapSection />
      <Footer />
    </main>
  );
}
