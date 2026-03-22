'use client';

import { MessageCircle, Cpu, LayoutGrid } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

const STEPS = [
  {
    icon: MessageCircle,
    step: '01',
    title: 'Describe Your Need',
    description:
      'Tell our AI what you\'re looking for in plain language: budget, city, property type, number of bedrooms, or any specific wishes. No complicated forms.',
    color: 'from-bayit-blue to-bayit-blue-light',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Analyses & Matches',
    description:
      'Our assistant instantly scans the full property database, understands your context, and shortlists the most relevant options, powered by OpenAI.',
    color: 'from-bayit-gold-dark to-bayit-gold',
  },
  {
    icon: LayoutGrid,
    step: '03',
    title: 'Get Rich Recommendations',
    description:
      'Receive a curated set of property cards right inside the chat, with photos, prices, key specs, and locations. Refine at any time by just chatting.',
    color: 'from-bayit-blue-light to-bayit-blue',
  },
];

export default function HowItWorks() {
  const { openChat } = useChatContext();

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="section-badge mb-4">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-bayit-dark mt-3">
            How Bayit Works
          </h2>
          <p className="text-bayit-gray mt-4 max-w-lg mx-auto text-lg">
            Finding your dream property in Morocco has never been this effortless.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-bayit-blue via-bayit-gold to-bayit-blue opacity-20" />

          {STEPS.map(({ icon: Icon, step, title, description, color }) => (
            <div
              key={step}
              className="group relative bg-bayit-cream rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-bayit-border"
            >
              {/* Step number */}
              <div className="text-5xl font-bold text-bayit-gold/15 absolute top-4 right-6 select-none">
                {step}
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-md`}>
                <Icon size={26} className="text-white" />
              </div>

              <h3 className="text-xl font-semibold text-bayit-dark mb-3">{title}</h3>
              <p className="text-bayit-gray leading-relaxed text-sm">{description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <button
            onClick={openChat}
            className="inline-flex items-center gap-2 bg-bayit-blue hover:bg-bayit-blue-light text-white font-semibold px-8 py-3.5 rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            <MessageCircle size={18} />
            Try It Now, It's Free
          </button>
        </div>
      </div>
    </section>
  );
}
