import { useEffect, useRef, useState } from 'react';
import { Brain, Search, Map, Shield, Lock, GitBranch, Sparkles } from 'lucide-react';

const brains = [
  {
    id: 'id',
    name: 'ID',
    alias: 'The Explorer',
    role: 'Pattern Recognition',
    params: '70B Parameters',
    mission: 'Quantify leakage, map logistical voids, identify arbitrage opportunities',
    description: 'The raw, intuitive power of deep learning. Operates on the Perception Layer, ingesting vast quantities of unstructured trade data to detect patterns invisible to the human eye.',
    features: [
      'Neural Search (DARTS) for HS-Code Arbitrage detection',
      'Meta-Learning Loop for environment adaptation',
      'Raw pattern recognition from global trade data',
    ],
    color: 'blue',
    icon: Search,
    visual: 'chaos',
  },
  {
    id: 'ego',
    name: 'EGO',
    alias: 'The Planner',
    role: 'Strategic Decision',
    params: 'Industrial Logic',
    mission: 'Architect the Genesis facility, optimize human capital, model financial viability',
    description: 'The rational mediator. Leverages Neuro-Symbolic AI to impose logic onto the Id\'s intuitions. Translates raw patterns into actionable engineering blueprints.',
    features: [
      'Digital Twin Generation with Monte Carlo simulations',
      'LoRA Adaptation for national context fine-tuning',
      'Factory floor plans and P&L statements',
    ],
    color: 'teal',
    icon: Map,
    visual: 'structure',
  },
  {
    id: 'superego',
    name: 'SUPEREGO',
    alias: 'The Guard',
    role: 'Cryptographic Law',
    params: 'SHA-256 Constitution',
    mission: 'Audit sovereignty, enforce regulatory compliance, uphold constitutional constraints',
    description: 'The moral and legal conscience. A Deterministic Kernel governed by a Constitution. Ensures the AI never makes a decision that violates sovereign law.',
    features: [
      'Immutable SHA-256 Audit Trail',
      'Circuit Breakers for policy violations',
      'Policy-Locked Hash Chain enforcement',
    ],
    color: 'gold',
    icon: Shield,
    visual: 'law',
  },
];

// 3D Brain Visual Component
function BrainVisual({ type, color }: { type: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: '#2d72d2',
    teal: '#00a396',
    gold: '#d1980b',
  };
  
  const c = colorMap[color];

  if (type === 'chaos') {
    return (
      <div className="relative w-32 h-32">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: c,
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animation: `pulse ${1 + Math.random()}s ease-in-out infinite`,
              boxShadow: `0 0 10px ${c}`,
              opacity: 0.7,
            }}
          />
        ))}
        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {[...Array(8)].map((_, i) => (
            <line
              key={i}
              x1={20 + Math.random() * 60}
              y1={20 + Math.random() * 60}
              x2={20 + Math.random() * 60}
              y2={20 + Math.random() * 60}
              stroke={c}
              strokeWidth="0.5"
              opacity="0.3"
            />
          ))}
        </svg>
      </div>
    );
  }

  if (type === 'structure') {
    return (
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="grid grid-cols-3 gap-2">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 rounded transition-all duration-300"
              style={{
                background: c,
                opacity: 0.3 + (i % 3) * 0.2,
                boxShadow: `0 0 10px ${c}`,
                animation: `pulse ${2 + i * 0.2}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
        {/* Connecting lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="w-24 h-24 border-2 rounded-lg"
            style={{ borderColor: `${c}40` }}
          />
        </div>
      </div>
    );
  }

  // Law visual
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div 
        className="w-24 h-24 border-2 rounded-lg flex items-center justify-center"
        style={{ 
          borderColor: c,
          boxShadow: `0 0 20px ${c}40, inset 0 0 20px ${c}20`,
        }}
      >
        <Lock className="w-10 h-10" style={{ color: c }} />
      </div>
      {/* Orbiting ring */}
      <div 
        className="absolute w-28 h-28 border rounded-lg animate-spin"
        style={{ 
          borderColor: `${c}30`,
          animationDuration: '10s',
        }}
      />
    </div>
  );
}

export function ThreeBrains() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeBrain, setActiveBrain] = useState<string>('id');
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

  const selectedBrain = brains.find(b => b.id === activeBrain);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel mb-6">
            <Brain className="w-4 h-4 text-[#2d72d2]" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Tripartite Cognitive Architecture
            </span>
          </div>
          <h2 className="section-title mb-4">
            The <span className="bg-gradient-to-r from-[#2d72d2] via-[#00a396] to-[#d1980b] bg-clip-text text-transparent">3 Brains</span>
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            Unlike standard monolithic AI models, OMEGA-1 is structured into three distinct 
            processing centers that mirror the Freudian psychoanalytic structure.
          </p>
        </div>

        {/* Brain Selector - 3D Cards */}
        <div className={`flex flex-wrap justify-center gap-6 mb-12 transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          {brains.map((brain, index) => (
            <button
              key={brain.id}
              onClick={() => setActiveBrain(brain.id)}
              className={`relative group perspective-1000 transition-all duration-500 ${
                activeBrain === brain.id ? 'scale-105 z-10' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div 
                className={`glass-panel p-6 w-48 text-center transition-all duration-500 ${
                  activeBrain === brain.id ? `glass-panel-${brain.color}` : ''
                }`}
                style={{
                  transform: activeBrain === brain.id ? 'translateZ(20px)' : 'translateZ(0)',
                  boxShadow: activeBrain === brain.id 
                    ? `0 20px 60px ${brain.color === 'blue' ? 'rgba(45, 114, 210, 0.3)' : brain.color === 'teal' ? 'rgba(0, 163, 150, 0.3)' : 'rgba(209, 152, 11, 0.3)'}`
                    : 'none',
                }}
              >
                <div className="mb-4 flex justify-center">
                  <BrainVisual type={brain.visual} color={brain.color} />
                </div>
                <h3 className="text-xl font-bold text-[#e6edf3] mb-1">{brain.name}</h3>
                <p className={`text-sm ${
                  brain.color === 'blue' ? 'text-[#2d72d2]' :
                  brain.color === 'teal' ? 'text-[#00a396]' :
                  'text-[#d1980b]'
                }`}>{brain.alias}</p>
                
                {activeBrain === brain.id && (
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full ${
                    brain.color === 'blue' ? 'bg-[#2d72d2]' :
                    brain.color === 'teal' ? 'bg-[#00a396]' :
                    'bg-[#d1980b]'
                  }`} />
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          {/* Architecture Diagram */}
          <div 
            className="glass-panel p-6 overflow-hidden"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(45, 114, 210, 0.1)',
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] text-[#6e7681] uppercase tracking-wider">
                OMEGA-1 Architecture
              </span>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="status-dot status-active" />
                  <div className="absolute inset-0 status-dot status-active animate-ping" />
                </div>
                <span className="text-[10px] text-[#00a396]">ACTIVE</span>
              </div>
            </div>
            <img 
              src="/images/omega1-architecture-diagram.png" 
              alt="OMEGA-1 Architecture: Three Brains + Seven Pillars"
              className="w-full h-auto rounded-lg"
            />
          </div>

          {/* Active Brain Details */}
          <div className="space-y-6">
            {selectedBrain && (
              <div 
                className={`glass-panel glass-panel-${selectedBrain.color} p-8 transition-all duration-500`}
                style={{
                  boxShadow: selectedBrain.color === 'blue' 
                    ? '0 20px 60px rgba(45, 114, 210, 0.2)' 
                    : selectedBrain.color === 'teal' 
                    ? '0 20px 60px rgba(0, 163, 150, 0.2)' 
                    : '0 20px 60px rgba(209, 152, 11, 0.2)',
                }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-14 h-14 rounded-xl flex items-center justify-center`}
                      style={{
                        background: selectedBrain.color === 'blue' ? 'rgba(45, 114, 210, 0.15)' :
                                   selectedBrain.color === 'teal' ? 'rgba(0, 163, 150, 0.15)' :
                                   'rgba(209, 152, 11, 0.15)',
                      }}
                    >
                      <selectedBrain.icon className={`w-7 h-7 ${
                        selectedBrain.color === 'blue' ? 'text-[#2d72d2]' :
                        selectedBrain.color === 'teal' ? 'text-[#00a396]' :
                        'text-[#d1980b]'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-[#e6edf3]">
                        {selectedBrain.name}
                      </h3>
                      <p className={`text-lg ${
                        selectedBrain.color === 'blue' ? 'text-[#2d72d2]' :
                        selectedBrain.color === 'teal' ? 'text-[#00a396]' :
                        'text-[#d1980b]'
                      }`}>
                        {selectedBrain.alias}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Role</p>
                    <p className="text-sm text-[#e6edf3] font-medium">{selectedBrain.role}</p>
                    <p className="text-xs text-[#8b949e] mono mt-1">{selectedBrain.params}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] text-[#6e7681] uppercase tracking-wider mb-2">Mission</p>
                  <p className="text-sm text-[#e6edf3] leading-relaxed">{selectedBrain.mission}</p>
                </div>

                <div className="mb-6">
                  <p className="text-[11px] text-[#6e7681] uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-[#8b949e] leading-relaxed">{selectedBrain.description}</p>
                </div>

                <div>
                  <p className="text-[11px] text-[#6e7681] uppercase tracking-wider mb-3">Capabilities</p>
                  <div className="space-y-2">
                    {selectedBrain.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Sparkles className={`w-4 h-4 ${
                          selectedBrain.color === 'blue' ? 'text-[#2d72d2]' :
                          selectedBrain.color === 'teal' ? 'text-[#00a396]' :
                          'text-[#d1980b]'
                        }`} />
                        <span className="text-sm text-[#8b949e]">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Consensus Engine */}
            <div 
              className="glass-panel p-6"
              style={{
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#8b949e]/10 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-[#8b949e]" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#e6edf3]">Consensus Engine</h4>
                  <p className="text-xs text-[#6e7681]">Tripartite Mediation</p>
                </div>
              </div>
              <p className="text-sm text-[#8b949e] leading-relaxed">
                The three brains converge through the Consensus Engine, which mediates between 
                raw pattern recognition, strategic planning, and constitutional enforcement to 
                produce sovereign-aligned decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
