import { useEffect, useState } from 'react';
import { ChevronRight, Shield, Brain, Lock, Sparkles } from 'lucide-react';

interface HeroProps {
  onCtaClick: () => void;
}

export function Hero({ onCtaClick }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Warm gradient background */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 30%, rgba(201, 169, 98, 0.08), transparent),
            radial-gradient(ellipse 50% 40% at 80% 70%, rgba(45, 74, 62, 0.1), transparent),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(139, 115, 85, 0.06), transparent)
          `,
        }}
      />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 z-[1] opacity-40"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 98, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <div 
          className={`inline-flex items-center gap-3 px-4 py-2 glass-panel mb-8 transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="relative">
            <div className="status-dot status-active" />
            <div className="absolute inset-0 status-dot status-active animate-ping opacity-50" />
          </div>
          <span className="micro-label" style={{ color: 'var(--gold)' }}>
            Sovereign Intelligence System
          </span>
          <Sparkles className="w-4 h-4" style={{ color: 'var(--gold)' }} />
        </div>

        {/* Main Title */}
        <div 
          className={`space-y-6 mb-10 transition-all duration-1000 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h1 className="section-title">
            <span style={{ color: 'var(--text-primary)' }}>The Operating System</span>
            <br />
            <span style={{ color: 'var(--text-primary)' }}>for </span>
            <span className="gradient-gold">Sovereign AI</span>
          </h1>
          <p 
            className="text-xl md:text-2xl max-w-3xl mx-auto"
            style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}
          >
            OMEGA-1 transforms generative AI into constitutional intelligence—
            architecting national industrial ecosystems with immutable audit trails 
            and sovereign-grade governance.
          </p>
        </div>

        {/* Feature Pills */}
        <div 
          className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-1000 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { icon: Brain, text: 'Neuro-Symbolic AI' },
            { icon: Shield, text: 'Constitutional Governance' },
            { icon: Lock, text: 'SHA-256 Audit Chain' },
          ].map((feature, i) => (
            <div 
              key={feature.text}
              className="flex items-center gap-2 px-4 py-2 glass-panel"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <feature.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div 
          className={`flex flex-wrap justify-center gap-4 mb-16 transition-all duration-1000 delay-600 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button onClick={onCtaClick} className="btn-primary flex items-center gap-2 group">
            <span>Request Access</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => document.getElementById('sovereign-mandate')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-secondary"
          >
            Explore Architecture
          </button>
        </div>

        {/* Stats */}
        <div 
          className={`grid grid-cols-3 gap-8 max-w-2xl mx-auto transition-all duration-1000 delay-800 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {[
            { value: '$3B+', label: 'Leakage Recaptured' },
            { value: '18%+', label: 'Projected IRR' },
            { value: '90', label: 'Days to Deploy' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="metric-value gradient-gold mb-1">{stat.value}</p>
              <p className="metric-label">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Ornate Divider */}
        <div className="ornate-divider max-w-md mx-auto mt-16">
          <span className="text-2xl" style={{ color: 'var(--gold)' }}>◆</span>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        <span className="micro-label">Scroll to Explore</span>
        <div 
          className="w-px h-12"
          style={{
            background: 'linear-gradient(to bottom, var(--gold), transparent)',
          }}
        />
      </div>
    </section>
  );
}
