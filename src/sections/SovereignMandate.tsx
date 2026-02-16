import { useEffect, useRef, useState } from 'react';
import { Database, Cpu, TrendingUp, Lock, Globe, Server } from 'lucide-react';

const mandates = [
  {
    icon: Database,
    title: 'Data Residency & Control',
    description: 'All operational data resides on sovereign nodes within national jurisdiction, subject to strict "no egress" policies.',
    color: 'gold',
  },
  {
    icon: Cpu,
    title: 'Cognitive Autonomy',
    description: 'Local LLM stubs and meta-learning capabilities enable independent evolution, mitigating risks of external kill switches or bias injection.',
    color: 'forest',
  },
  {
    icon: TrendingUp,
    title: 'Economic Alignment',
    description: 'AI objective function hard-coded to maximize In-Country Value (ICV) and reverse trade deficits, not shareholder returns.',
    color: 'gold',
  },
];

export function SovereignMandate() {
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel mb-6">
            <Lock className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            <span className="micro-label" style={{ color: 'var(--gold)' }}>
              Constitutional Foundation
            </span>
          </div>
          <h2 className="section-title mb-4">
            The <span className="gradient-gold">Sovereign AI</span> Mandate
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            Sovereign AI has transcended buzzword status to become a core component of national 
            security strategy. Nations increasingly view AI infrastructure as critical assets 
            akin to energy reserves or military capabilities.
          </p>
        </div>

        {/* Three Pillars of Sovereignty */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {mandates.map((mandate, index) => (
            <div
              key={mandate.title}
              className={`glass-panel p-8 transition-all duration-700 hover:scale-[1.02] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                style={{ 
                  background: mandate.color === 'gold' 
                    ? 'rgba(201, 169, 98, 0.1)' 
                    : 'rgba(45, 74, 62, 0.2)',
                }}
              >
                <mandate.icon 
                  className="w-7 h-7" 
                  style={{ color: mandate.color === 'gold' ? 'var(--gold)' : 'var(--sage)' }}
                />
              </div>
              <h3 className="text-xl font-medium mb-3" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond' }}>
                {mandate.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {mandate.description}
              </p>
            </div>
          ))}
        </div>

        {/* Sovereignty Statement */}
        <div className={`glass-panel p-8 lg:p-12 transition-all duration-1000 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-medium mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond' }}>
                Strategic Autonomy Partner
              </h3>
              <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>OMEGA-1 is a Sovereign Decision Engine that converts national import dependence into an execution plan: leakage detection, industrial prioritization, CAPEX/ROI, and a governed roadmap. It is not a tool. It is a strategic autonomy partner for ministries - built to operationalize localization decisions with auditability and policy control.</p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Globe className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <span>Data Sovereignty</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Server className="w-4 h-4" style={{ color: 'var(--sage)' }} />
                  <span>Air-Gapped Deployment</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="glass-panel p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="micro-label">Sovereignty Status</span>
                  <div className="flex items-center gap-2">
                    <div className="status-dot status-active" />
                    <span className="text-xs" style={{ color: 'var(--success)' }}>ENFORCED</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Data Residency', status: 'COMPLIANT' },
                    { label: 'Cognitive Autonomy', status: 'VERIFIED' },
                    { label: 'Economic Alignment', status: 'LOCKED' },
                    { label: 'No Egress Policy', status: 'ACTIVE' },
                  ].map((item) => (
                    <div 
                      key={item.label} 
                      className="flex items-center justify-between py-2 border-b"
                      style={{ borderColor: 'rgba(201, 169, 98, 0.1)' }}
                    >
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span className="text-xs mono" style={{ color: 'var(--success)' }}>{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



