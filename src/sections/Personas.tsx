import { useEffect, useRef, useState } from 'react';
import { 
  Landmark, TrendingUp, Users, Shield, Brain, 
  Target, Briefcase, Globe, Lock, Zap
} from 'lucide-react';

const personas = [
  {
    id: 'government',
    icon: Landmark,
    title: 'Government',
    subtitle: 'The Minister',
    trigger: 'National Security & GDP',
    headline: 'Sovereign capability, not software.',
    description: 'OMEGA-1 ensures that your national industrial strategy is immune to external shocks. Secure your data, localize your supply chain, and build a legacy of resilience.',
    hooks: [
      { icon: Shield, text: 'The Guard & Macroeconomics' },
      { icon: Lock, text: 'Constitutional Security' },
      { icon: Globe, text: 'Air-Gapped Deployment' },
    ],
    color: 'teal',
  },
  {
    id: 'swf',
    icon: TrendingUp,
    title: 'Sovereign Wealth Funds',
    subtitle: 'The CIO',
    trigger: 'ROI & Alpha Generation',
    headline: 'Transform leakage into a new asset class.',
    description: 'OMEGA-1 identifies high-IRR industrial opportunities hidden in your trade deficit. Deploy capital with the precision of neuro-symbolic reasoning.',
    hooks: [
      { icon: Target, text: 'Capital Markets & The Planner' },
      { icon: Zap, text: 'Arbitrage Opportunities' },
      { icon: Brain, text: 'Financial Modeling' },
    ],
    color: 'blue',
  },
  {
    id: 'uhnw',
    icon: Users,
    title: 'Family Offices',
    subtitle: 'The Patriarch',
    trigger: 'Generational Wealth & Stewardship',
    headline: 'Build your industrial empire.',
    description: 'Move from passive investing to active industrial creation. OMEGA-1 provides the blueprint for your family\'s next industrial empire.',
    hooks: [
      { icon: Briefcase, text: 'Business Genesis & Wealth' },
      { icon: Target, text: 'JV Structuring' },
      { icon: Zap, text: '90-Day Build Plans' },
    ],
    color: 'gold',
  },
];

export function Personas() {
  const [isVisible, setIsVisible] = useState(false);
  const [activePersona, setActivePersona] = useState<string>('government');
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const selectedPersona = personas.find(p => p.id === activePersona);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel mb-6">
            <Users className="w-3 h-3 text-[#d1980b]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Target Audience
            </span>
          </div>
          <h2 className="section-title mb-4">
            Built for <span className="text-[#d1980b]">Sovereign Actors</span>
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            The messaging resonates with three distinct personas, each with unique triggers 
            and strategic objectives.
          </p>
        </div>

        {/* Persona Selector */}
        <div className={`flex flex-wrap justify-center gap-4 mb-12 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {personas.map((persona) => (
            <button
              key={persona.id}
              onClick={() => setActivePersona(persona.id)}
              className={`flex items-center gap-3 px-6 py-4 glass-panel transition-all duration-300 ${
                activePersona === persona.id 
                  ? `glass-panel-${persona.color} scale-105` 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <persona.icon className={`w-5 h-5 ${
                persona.color === 'blue' ? 'text-[#2d72d2]' :
                persona.color === 'teal' ? 'text-[#00a396]' :
                'text-[#d1980b]'
              }`} />
              <div className="text-left">
                <p className="text-sm font-semibold text-[#e6edf3]">{persona.title}</p>
                <p className="text-[10px] text-[#8b949e]">{persona.subtitle}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Active Persona Detail */}
        {selectedPersona && (
          <div className={`glass-panel glass-panel-${selectedPersona.color} p-8 lg:p-12 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <selectedPersona.icon className={`w-8 h-8 ${
                    selectedPersona.color === 'blue' ? 'text-[#2d72d2]' :
                    selectedPersona.color === 'teal' ? 'text-[#00a396]' :
                    'text-[#d1980b]'
                  }`} />
                  <div>
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">
                      {selectedPersona.subtitle}
                    </p>
                    <h3 className="text-2xl font-bold text-[#e6edf3]">
                      {selectedPersona.title}
                    </h3>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-2">
                    Key Trigger
                  </p>
                  <p className={`text-lg font-medium ${
                    selectedPersona.color === 'blue' ? 'text-[#2d72d2]' :
                    selectedPersona.color === 'teal' ? 'text-[#00a396]' :
                    'text-[#d1980b]'
                  }`}>
                    {selectedPersona.trigger}
                  </p>
                </div>

                <h4 className="text-xl font-bold text-[#e6edf3] mb-4">
                  {selectedPersona.headline}
                </h4>

                <p className="text-[#8b949e] leading-relaxed mb-8">
                  {selectedPersona.description}
                </p>

                <div>
                  <p className="text-xs text-[#6e7681] uppercase tracking-wider mb-4">
                    Scientific Hooks
                  </p>
                  <div className="space-y-3">
                    {selectedPersona.hooks.map((hook, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          selectedPersona.color === 'blue' ? 'bg-[#2d72d2]/10' :
                          selectedPersona.color === 'teal' ? 'bg-[#00a396]/10' :
                          'bg-[#d1980b]/10'
                        }`}>
                          <hook.icon className={`w-4 h-4 ${
                            selectedPersona.color === 'blue' ? 'text-[#2d72d2]' :
                            selectedPersona.color === 'teal' ? 'text-[#00a396]' :
                            'text-[#d1980b]'
                          }`} />
                        </div>
                        <span className="text-sm text-[#8b949e]">{hook.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Content - Visual */}
              <div className="relative">
                <div className="glass-panel p-8">
                  <div className="text-center mb-6">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-2">
                      Alignment Score
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <div className={`text-4xl font-bold ${
                        selectedPersona.color === 'blue' ? 'text-[#2d72d2]' :
                        selectedPersona.color === 'teal' ? 'text-[#00a396]' :
                        'text-[#d1980b]'
                      }`}>
                        94%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8b949e]">Strategic Fit</span>
                        <span className="text-xs text-[#e6edf3]">98%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#161b22] overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${
                            selectedPersona.color === 'blue' ? 'bg-[#2d72d2]' :
                            selectedPersona.color === 'teal' ? 'bg-[#00a396]' :
                            'bg-[#d1980b]'
                          }`}
                          style={{ width: '98%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8b949e]">Technical Readiness</span>
                        <span className="text-xs text-[#e6edf3]">92%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#161b22] overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 delay-200 ${
                            selectedPersona.color === 'blue' ? 'bg-[#2d72d2]' :
                            selectedPersona.color === 'teal' ? 'bg-[#00a396]' :
                            'bg-[#d1980b]'
                          }`}
                          style={{ width: '92%' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#8b949e]">Security Posture</span>
                        <span className="text-xs text-[#e6edf3]">100%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#161b22] overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 delay-300 ${
                            selectedPersona.color === 'blue' ? 'bg-[#2d72d2]' :
                            selectedPersona.color === 'teal' ? 'bg-[#00a396]' :
                            'bg-[#d1980b]'
                          }`}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-[#30363d]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#6e7681]">Recommended Pillar Focus</span>
                      <span className="text-xs text-[#e6edf3]">
                        {selectedPersona.id === 'government' && 'Government + Macroeconomics'}
                        {selectedPersona.id === 'swf' && 'Capital Markets + Execution'}
                        {selectedPersona.id === 'uhnw' && 'Business Genesis + Wealth'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
