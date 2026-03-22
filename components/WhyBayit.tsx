import { Brain, Zap, LayoutGrid, Shield, Globe, MessageCircle } from 'lucide-react';

const VALUES = [
  {
    icon: Brain,
    title: 'Truly Personalized',
    description:
      'Unlike static listing portals, Bayit understands your unique needs through conversation and learns your preferences as you refine your search.',
  },
  {
    icon: Zap,
    title: 'Faster Than Browsing',
    description:
      'Skip hours of scrolling. Describe what you want in one sentence and get an instant, curated shortlist, right inside the chat window.',
  },
  {
    icon: LayoutGrid,
    title: 'Rich Property Cards',
    description:
      'Every recommendation comes as a fully detailed card with photos, price, specs, and location, so you can evaluate at a glance without leaving the chat.',
  },
  {
    icon: Shield,
    title: 'Up-to-Date Listings',
    description:
      'Properties are sourced from a live database that your team can update in seconds. Always fresh and always accurate.',
  },
  {
    icon: Globe,
    title: 'All Across Morocco',
    description:
      'From Marrakech riads to Casablanca penthouses, Agadir villas to Rabat studios. Bayit covers every major city and emerging market.',
  },
  {
    icon: MessageCircle,
    title: 'Conversational UX',
    description:
      'Natural back-and-forth dialogue means you can change your mind, add constraints, or ask follow-up questions, just as you would with a real agent.',
  },
];

export default function WhyBayit() {
  return (
    <section id="why-bayit" className="py-24 bg-white relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-bayit-blue/6 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-bayit-blue-light/8 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-badge mb-4">Why Choose Us</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-bayit-dark mt-3">
            More than a listing.{' '}
            <span className="text-bayit-blue italic">A guide.</span>
          </h2>
          <p className="text-bayit-gray mt-4 max-w-lg mx-auto text-lg">
            Bayit combines the convenience of AI conversation with real, live listings to give you an experience no traditional platform can match.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {VALUES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group bg-white hover:shadow-card-hover border border-bayit-border hover:border-bayit-blue/25 rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-11 h-11 rounded-xl bg-bayit-blue-50 flex items-center justify-center mb-5 group-hover:bg-bayit-blue/10 transition-colors">
                <Icon size={20} className="text-bayit-blue" />
              </div>
              <h3 className="text-bayit-dark font-semibold text-lg mb-2">{title}</h3>
              <p className="text-bayit-gray text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
