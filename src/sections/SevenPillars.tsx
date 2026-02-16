import { useEffect, useRef, useState } from 'react';
import { 
  Landmark, TrendingUp, Building2, Shield, FileText, 
  Wallet, Zap, Activity, Clock, CheckCircle 
} from 'lucide-react';

interface Pillar {
  id: string;
  icon: React.ElementType;
  name: string;
  definition: string;
  operations: string[];
  confidence: number;
  latency: number;
  color: string;
}

const pillars: Pillar[] = [
  {
    id: 'capital-markets',
    icon: Landmark,
    name: 'Capital Markets',
    definition: 'Market structure and funding rails',
    operations: [
      'Funding Models (Budget/SWF)',
      'ROI Frames (Strategic vs. Financial)',
      'Risk Constraints & Exposure',
    ],
    confidence: 0.72,
    latency: 12,
    color: 'gold',
  },
  {
    id: 'macroeconomics',
    icon: TrendingUp,
    name: 'Macroeconomics',
    definition: 'Macro impact and scenario framing',
    operations: [
      'National KPI Targets (GDP, Jobs)',
      'Stress Scenarios (Oil Shock, FX)',
      'Policy Levers (Tariffs, Subsidies)',
    ],
    confidence: 0.70,
    latency: 14,
    color: 'gold',
  },
  {
    id: 'business-genesis',
    icon: Building2,
    name: 'Business Genesis',
    definition: 'JV blueprint and operating model',
    operations: [
      'JV Structure (IP, Governance)',
      '90-Day Build Plan (MVP → Scale)',
      'Delivery Org Architecture',
    ],
    confidence: 0.74,
    latency: 10,
    color: 'forest',
  },
  {
    id: 'government',
    icon: Shield,
    name: 'Government',
    definition: 'Regulatory and procurement alignment',
    operations: [
      'Data Sovereignty Posture (Air-Gapped)',
      'Role-Based Access Control (RBAC)',
      'Compliance Evidence (Audit Chain)',
    ],
    confidence: 0.76,
    latency: 8,
    color: 'forest',
  },
  {
    id: 'instruments',
    icon: FileText,
    name: 'Instruments',
    definition: 'Decision objects and outputs',
    operations: [
      'Structured Memos & Dashboards',
      'Decision Rubrics & Scorecards',
      'Red-Team Integrity Checks',
    ],
    confidence: 0.69,
    latency: 15,
    color: 'gold',
  },
  {
    id: 'wealth',
    icon: Wallet,
    name: 'Wealth',
    definition: 'Value capture and wealth flywheel',
    operations: [
      'Value Capture (Licensing/Service Fees)',
      'Local Capacity Building (Sovereign Ops)',
      'Export Denied Policies',
    ],
    confidence: 0.71,
    latency: 11,
    color: 'gold',
  },
  {
    id: 'execution',
    icon: Zap,
    name: 'Execution',
    definition: 'Operational runbook and actions',
    operations: [
      'Immediate Next Actions (Deploy/Verify)',
      'Incident Response Runbooks',
      'System Uptime & Audit Integrity KPIs',
    ],
    confidence: 0.66,
    latency: 5,
    color: 'forest',
  },
];

// Sparkline Component
function Sparkline({ color }: { color: string }) {
  const points = [...Array(10)].map(() => 20 + Math.random() * 60);
  const path = points.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * 10} ${100 - y}`).join(' ');
  
  const strokeColor = color === 'gold' ? 'var(--gold)' : 'var(--sage)';
  
  return (
    <svg viewBox="0 0 90 100" className="w-full h-8">
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}

// Live Metric Component
function LiveMetric({ 
  label, 
  value, 
  unit, 
  color 
}: { 
  label: string; 
  value: number; 
  unit: string; 
  color: string 
}) {
  const [displayValue, setDisplayValue] = useState(value);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValue(prev => {
        const change = (Math.random() - 0.5) * 0.02;
        const newValue = Math.max(0, Math.min(1, prev + change));
        return newValue;
      });
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const colorValue = color === 'gold' ? 'var(--gold)' : 'var(--sage)';
  
  return (
    <div>
      <p className="micro-label mb-1">{label}</p>
      <p className="text-lg font-bold mono" style={{ color: colorValue }}>
        {unit === 'ms' ? displayValue.toFixed(0) : displayValue.toFixed(2)}
        <span className="text-xs ml-1">{unit}</span>
      </p>
    </div>
  );
}

export function SevenPillars() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredPillar, setHoveredPillar] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
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

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel mb-6">
            <Activity className="w-4 h-4" style={{ color: 'var(--sage)' }} />
            <span className="micro-label" style={{ color: 'var(--sage)' }}>
              Operational Framework
            </span>
          </div>
          <h2 className="section-title mb-4">
            The <span className="gradient-forest">Seven Pillars</span> of Sovereign Intelligence
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            The 3 Brains rely on 7 Pillars of data and operational logic. These pillars are the 
            "organs" of the OMEGA-1 body, each responsible for a specific domain of sovereign stability.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {pillars.slice(0, 4).map((pillar, index) => (
            <div
              key={pillar.id}
              className={`glass-panel p-6 transition-all duration-700 cursor-pointer hover:scale-[1.02] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              } ${hoveredPillar === pillar.id ? 'z-10' : ''}`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onMouseEnter={() => setHoveredPillar(pillar.id)}
              onMouseLeave={() => setHoveredPillar(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: pillar.color === 'gold' 
                      ? 'rgba(201, 169, 98, 0.1)' 
                      : 'rgba(45, 74, 62, 0.2)',
                  }}
                >
                  <pillar.icon 
                    className="w-5 h-5" 
                    style={{ color: pillar.color === 'gold' ? 'var(--gold)' : 'var(--sage)' }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <div className="status-dot status-active" />
                </div>
              </div>

              <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond' }}>
                {pillar.name}
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{pillar.definition}</p>

              {/* Live Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <LiveMetric 
                  label="Confidence" 
                  value={pillar.confidence} 
                  unit="" 
                  color={pillar.color} 
                />
                <LiveMetric 
                  label="Latency" 
                  value={pillar.latency} 
                  unit="ms" 
                  color={pillar.color} 
                />
              </div>

              <Sparkline color={pillar.color} />

              {/* Expanded Content on Hover */}
              {hoveredPillar === pillar.id && (
                <div 
                  className="mt-4 pt-4 animate-fade-in-up"
                  style={{ borderTop: '1px solid rgba(201, 169, 98, 0.1)' }}
                >
                  <p className="micro-label mb-2">Operations</p>
                  <ul className="space-y-1">
                    {pillar.operations.map((op, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle className="w-3 h-3" style={{ color: 'var(--sage)' }} />
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {pillars.slice(4).map((pillar, index) => (
            <div
              key={pillar.id}
              className={`glass-panel p-6 transition-all duration-700 cursor-pointer hover:scale-[1.02] ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              } ${hoveredPillar === pillar.id ? 'z-10' : ''}`}
              style={{ transitionDelay: `${(index + 4) * 100}ms` }}
              onMouseEnter={() => setHoveredPillar(pillar.id)}
              onMouseLeave={() => setHoveredPillar(null)}
            >
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ 
                    background: pillar.color === 'gold' 
                      ? 'rgba(201, 169, 98, 0.1)' 
                      : 'rgba(45, 74, 62, 0.2)',
                  }}
                >
                  <pillar.icon 
                    className="w-5 h-5" 
                    style={{ color: pillar.color === 'gold' ? 'var(--gold)' : 'var(--sage)' }}
                  />
                </div>
                <div className="flex items-center gap-1">
                  <div className="status-dot status-active" />
                </div>
              </div>

              <h3 className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Cormorant Garamond' }}>
                {pillar.name}
              </h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>{pillar.definition}</p>

              {/* Live Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <LiveMetric 
                  label="Confidence" 
                  value={pillar.confidence} 
                  unit="" 
                  color={pillar.color} 
                />
                <LiveMetric 
                  label="Latency" 
                  value={pillar.latency} 
                  unit="ms" 
                  color={pillar.color} 
                />
              </div>

              <Sparkline color={pillar.color} />

              {/* Expanded Content on Hover */}
              {hoveredPillar === pillar.id && (
                <div 
                  className="mt-4 pt-4 animate-fade-in-up"
                  style={{ borderTop: '1px solid rgba(201, 169, 98, 0.1)' }}
                >
                  <p className="micro-label mb-2">Operations</p>
                  <ul className="space-y-1">
                    {pillar.operations.map((op, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                        <CheckCircle className="w-3 h-3" style={{ color: 'var(--sage)' }} />
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* System Status Footer */}
        <div className={`mt-8 glass-panel p-4 flex flex-wrap items-center justify-between gap-4 transition-all duration-1000 delay-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: 'var(--sage)' }} />
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>All Pillars Operational</span>
            </div>
            <div 
              className="w-px h-4"
              style={{ background: 'rgba(201, 169, 98, 0.2)' }}
            />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs mono" style={{ color: 'var(--text-muted)' }}>
                Last Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>System Health:</span>
            <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>OPTIMAL</span>
          </div>
        </div>
      </div>
    </section>
  );
}
