import { useEffect, useRef, useState } from 'react';
import { Factory, Cpu, FileCheck, TrendingUp, Users, Shield, Zap, Clock } from 'lucide-react';

const solutionFeatures = [
  {
    icon: Factory,
    title: 'Genesis Factory',
    description: 'Full-cycle manufacturing from raw metallurgy to smart-sensor integration. Not an assembly plant—an industrial genesis node.',
    color: 'blue',
  },
  {
    icon: Cpu,
    title: 'Digital Twin',
    description: 'Virtual replica of the facility with AI-driven predictive maintenance, ensuring world-class operational efficiency (OEE).',
    color: 'teal',
  },
  {
    icon: FileCheck,
    title: 'Digital Birth Certificate',
    description: 'Every product issued a cryptographic certificate containing metallurgical DNA, torque specs, and test results.',
    color: 'gold',
  },
];

const roiMetrics = [
  { label: 'Projected IRR', value: '18%+', icon: TrendingUp },
  { label: 'Employment Multiplier', value: '2-3x', icon: Users },
  { label: 'Deployment Timeline', value: '90 Days', icon: Clock },
  { label: 'Strategic Autonomy', value: '100%', icon: Shield },
];

export function OmegaSolution() {
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
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel mb-6">
            <Zap className="w-3 h-3 text-[#2d72d2]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              The Genesis Imperative
            </span>
          </div>
          <h2 className="section-title mb-4">
            The <span className="text-[#2d72d2]">OMEGA-1</span> Solution
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            The solution to structural economic leakage is not simple protectionism; it is 
            <span className="text-[#e6edf3] font-medium"> Scientific Industrial Localization</span>. 
            OMEGA-1 provides the "Genesis" capability—the ability to simulate, plan, and execute 
            the creation of new industrial capacity from scratch.
          </p>
        </div>

        {/* Solution Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {solutionFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`glass-panel glass-panel-${feature.color} p-8 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                feature.color === 'blue' ? 'bg-[#2d72d2]/10' :
                feature.color === 'teal' ? 'bg-[#00a396]/10' :
                'bg-[#d1980b]/10'
              }`}>
                <feature.icon className={`w-7 h-7 ${
                  feature.color === 'blue' ? 'text-[#2d72d2]' :
                  feature.color === 'teal' ? 'text-[#00a396]' :
                  'text-[#d1980b]'
                }`} />
              </div>
              <h3 className="text-xl font-semibold text-[#e6edf3] mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* ROI Section */}
        <div className={`glass-panel p-8 lg:p-12 mb-16 transition-all duration-700 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-[#e6edf3] mb-2">
              Return on Sovereignty (ROI)
            </h3>
            <p className="text-[#8b949e]">
              OMEGA-1 reframes the localization debate from "cost" to "investment"
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {roiMetrics.map((metric) => (
              <div 
                key={metric.label}
                className="text-center p-6 rounded-lg bg-[#161b22]/50 border border-[#30363d]"
              >
                <metric.icon className="w-6 h-6 text-[#d1980b] mx-auto mb-3" />
                <p className="text-2xl font-bold text-[#e6edf3] mono mb-1">{metric.value}</p>
                <p className="text-xs text-[#8b949e] uppercase tracking-wider">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture of Reversal */}
        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-[#e6edf3] mb-4">
              Architecture of Reversal
            </h3>
            <p className="text-[#8b949e] mb-6 leading-relaxed">
              OMEGA-1 acts as the engine that reverses the flow of value. The gold data particles 
              of economic value—previously flowing outward to foreign hubs—are now captured, 
              processed, and multiplied within sovereign territory.
            </p>
            <div className="space-y-3">
              {[
                'Industry 4.0 sensor fusion (vibration, thermal, acoustic)',
                'AI-driven predictive maintenance',
                'World-class operational efficiency (OEE)',
                'Cryptographic product provenance',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00a396]" />
                  <span className="text-sm text-[#8b949e]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-8">
            <h3 className="text-xl font-bold text-[#e6edf3] mb-4">
              Financial & Sovereign ROI
            </h3>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[#2d72d2]/5 border border-[#2d72d2]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#8b949e]">Financial ROI</span>
                  <span className="text-lg font-bold text-[#2d72d2] mono">18%+ IRR</span>
                </div>
                <p className="text-xs text-[#6e7681]">
                  Driven by cost arbitrage in energy, logistics, and local materials
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#00a396]/5 border border-[#00a396]/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#8b949e]">Sovereign ROI</span>
                  <span className="text-lg font-bold text-[#00a396]">Strategic</span>
                </div>
                <p className="text-xs text-[#6e7681]">
                  Employment multiplier, GDP contribution, strategic autonomy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
