import { useEffect, useRef, useState } from 'react';
import { 
  Cpu, Database, MemoryStick, Shield, Lock, Server, 
  GitCommit, AlertOctagon, Fingerprint, CheckCircle,
  Terminal, Activity
} from 'lucide-react';

const techStack = [
  {
    category: 'Cognition',
    icon: Cpu,
    title: 'Neuro-Symbolic AI',
    description: 'Combines LLM creativity with logical validation; enables system self-adaptation.',
    color: 'blue',
  },
  {
    category: 'Perception',
    icon: Database,
    title: 'Data Mesh',
    description: 'Decentralized data ingestion; prevents data silos and enhances security.',
    color: 'blue',
  },
  {
    category: 'Memory',
    icon: MemoryStick,
    title: 'Synthetic Memory',
    description: 'Long-term context retention for strategic planning; overcomes LLM token limits.',
    color: 'teal',
  },
  {
    category: 'Security',
    icon: Shield,
    title: 'SHA-256 Blockchain',
    description: 'Creates immutable audit trails; Tamper Validation prevents unauthorized changes.',
    color: 'gold',
  },
  {
    category: 'Infrastructure',
    icon: Server,
    title: 'Sovereign Nodes',
    description: 'On-premise deployment on optimized hardware; ensures data residency.',
    color: 'teal',
  },
  {
    category: 'Adaptation',
    icon: Activity,
    title: 'Meta-Learning',
    description: 'Enables the system to learn how to learn from global market shifts.',
    color: 'blue',
  },
];

// Mock Hash Chain Visualization
function HashChain() {
  const hashes = [
    'a3f7...8e2d',
    'b8c1...4f9a',
    'd2e5...7b3c',
    'f1a9...6d8e',
    'c4b7...2a5f',
  ];

  return (
    <div className="space-y-2">
      {hashes.map((hash, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-[#00a396]' : 'bg-[#2d72d2]'}`} />
            <GitCommit className="w-3 h-3 text-[#6e7681]" />
          </div>
          <div className="flex-1 glass-panel px-3 py-2 flex items-center justify-between">
            <code className="text-xs text-[#8b949e] mono">{hash}</code>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#00a396]">PASS</span>
              <CheckCircle className="w-3 h-3 text-[#00a396]" />
            </div>
          </div>
          {i < hashes.length - 1 && (
            <div className="absolute left-4 top-full w-px h-2 bg-[#30363d]" />
          )}
        </div>
      ))}
    </div>
  );
}

// Constitutional Kernel Panel
function ConstitutionalKernel() {
  const rules = [
    { id: 'R-001', name: 'Data Egress Prohibition', status: 'ENFORCED', active: true },
    { id: 'R-002', name: 'Sovereign Node Validation', status: 'ENFORCED', active: true },
    { id: 'R-003', name: 'Audit Chain Integrity', status: 'ENFORCED', active: true },
    { id: 'R-004', name: 'Role-Based Access Control', status: 'ENFORCED', active: true },
    { id: 'R-005', name: 'Cryptographic Signature', status: 'ENFORCED', active: true },
  ];

  return (
    <div className="space-y-2">
      {rules.map((rule) => (
        <div 
          key={rule.id}
          className="flex items-center justify-between p-3 rounded-lg bg-[#161b22] border border-[#30363d]"
        >
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#00a396]" />
            <div>
              <p className="text-xs text-[#e6edf3] font-medium">{rule.name}</p>
              <p className="text-[10px] text-[#6e7681] mono">{rule.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="status-dot status-active" />
            <span className="text-[10px] text-[#00a396]">{rule.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TechnologySecurity() {
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
            <Terminal className="w-3 h-3 text-[#00a396]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Technical Backbone
            </span>
          </div>
          <h2 className="section-title mb-4">
            Technology & <span className="text-[#00a396]">Security</span> Architecture
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            The credibility of OMEGA-1 relies on its technical rigor. Sovereign-grade engineering 
            that makes it a truly "Sovereign" system.
          </p>
        </div>

        {/* Technical Skeleton Diagram */}
        <div className={`glass-panel p-6 mb-12 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">
              OMEGA-1 Technical Skeleton
            </span>
            <div className="flex items-center gap-2">
              <div className="status-dot status-active" />
              <span className="text-[10px] text-[#00a396]">VERIFIED</span>
            </div>
          </div>
          <img 
            src="/images/technical-skeleton-diagram.png" 
            alt="OMEGA-1 Technical Skeleton: Three Brains, Evolution Engine, Seven Pillars, Constitutional Shell"
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Tech Stack Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {techStack.map((tech, index) => (
            <div
              key={tech.title}
              className={`glass-panel glass-panel-${tech.color} p-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  tech.color === 'blue' ? 'bg-[#2d72d2]/10' :
                  tech.color === 'teal' ? 'bg-[#00a396]/10' :
                  'bg-[#d1980b]/10'
                }`}>
                  <tech.icon className={`w-5 h-5 ${
                    tech.color === 'blue' ? 'text-[#2d72d2]' :
                    tech.color === 'teal' ? 'text-[#00a396]' :
                    'text-[#d1980b]'
                  }`} />
                </div>
                <div>
                  <p className="text-[10px] text-[#6e7681] uppercase tracking-wider">{tech.category}</p>
                  <h3 className="text-sm font-semibold text-[#e6edf3]">{tech.title}</h3>
                </div>
              </div>
              <p className="text-sm text-[#8b949e] leading-relaxed">{tech.description}</p>
            </div>
          ))}
        </div>

        {/* Security Panels */}
        <div className={`grid lg:grid-cols-2 gap-8 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {/* Constitutional Kernel Panel */}
          <div className="glass-panel glass-panel-teal p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#00a396]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#00a396]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e6edf3]">Constitutional Kernel</h3>
                <p className="text-xs text-[#8b949e]">Rule-Based Constraint Enforcement</p>
              </div>
            </div>
            <p className="text-sm text-[#8b949e] mb-6 leading-relaxed">
              At the heart of the system is the Kernel, governed by a Constitution. This is not a 
              metaphor; it is code. The Constitution defines the boundaries of the AI's actions.
            </p>
            <ConstitutionalKernel />
          </div>

          {/* Immutable Audit Chain Panel */}
          <div className="glass-panel glass-panel-gold p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#d1980b]/10 flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-[#d1980b]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#e6edf3]">Immutable Audit Chain</h3>
                <p className="text-xs text-[#8b949e]">SHA-256 Policy-Locked Hash Chain</p>
              </div>
            </div>
            <p className="text-sm text-[#8b949e] mb-6 leading-relaxed">
              Trust is binary in sovereign operations. Every event is hashed using SHA-256 and 
              linked to the previous event, creating an unbreakable chain of custody.
            </p>
            <div className="glass-panel p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">Recent Hashes</span>
                <span className="text-[10px] text-[#00a396]">CHAIN VALID</span>
              </div>
              <HashChain />
            </div>
          </div>
        </div>

        {/* Circuit Breakers */}
        <div className={`mt-8 glass-panel p-6 transition-all duration-700 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center gap-3 mb-4">
            <AlertOctagon className="w-5 h-5 text-[#d1980b]" />
            <h3 className="text-lg font-semibold text-[#e6edf3]">Circuit Breakers</h3>
          </div>
          <p className="text-sm text-[#8b949e] mb-4">
            If the AI detects an anomaly or policy violation (e.g., a "Hash Mismatch" in the audit log), 
            the Circuit Breaker activates, freezing operations to prevent damage.
          </p>
          <div className="flex flex-wrap gap-3">
            {['Data Egress Attempt', 'Hash Mismatch', 'Unauthorized Access', 'Policy Violation'].map((trigger) => (
              <div 
                key={trigger}
                className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-[#00a396]" />
                <span className="text-xs text-[#8b949e]">{trigger}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
