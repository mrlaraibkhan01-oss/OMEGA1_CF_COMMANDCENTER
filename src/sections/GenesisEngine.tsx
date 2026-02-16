import { useEffect, useRef, useState } from 'react';
import { 
  Database, Search, FileSpreadsheet, Factory, Shield, 
  FileText, Calculator, Layout, Route, Fingerprint,
  ArrowRight, CheckCircle
} from 'lucide-react';

const workflowSteps = [
  {
    id: 'ingest',
    number: '01',
    title: 'INGEST',
    subtitle: 'Trade & Customs',
    description: 'Raw HS Codes (Imports/Exports)',
    action: 'The system connects to customs databases and ingests millions of rows of trade data.',
    tech: 'perception/open_connectors.py',
    icon: Database,
    color: 'blue',
  },
  {
    id: 'detect',
    number: '02',
    title: 'DETECT',
    subtitle: 'Leakage Graph',
    description: 'Key dependencies',
    action: 'The Id (Explorer) identifies leakage vectors. Flags high-value dependencies where the nation is critically exposed.',
    output: 'Leakage Graph visualization',
    icon: Search,
    color: 'blue',
  },
  {
    id: 'synthesize',
    number: '03',
    title: 'SYNTHESIZE',
    subtitle: 'Genesis Brief',
    description: 'Product Family + Targets',
    action: 'The Ego (Planner) synthesizes data into a Genesis Brief with product family definition and localization targets.',
    example: '70% Local Content by 2028',
    icon: FileSpreadsheet,
    color: 'teal',
  },
  {
    id: 'generate',
    number: '04',
    title: 'GENERATE',
    subtitle: 'Factory Pack',
    description: 'BOM + Process + Site',
    action: 'The Planner generates the full Factory Pack: Bill of Materials, manufacturing process flow, site layout, and utilities.',
    icon: Factory,
    color: 'teal',
  },
  {
    id: 'govern',
    number: '05',
    title: 'GOVERN',
    subtitle: 'Constitutional Gate',
    description: 'Audit + Policy Lock',
    action: 'The Superego (Guard) stamps the project with a Constitutional Gate and locks the decision in the Policy-Locked Hash Chain.',
    icon: Shield,
    color: 'gold',
  },
];

const outputArtifacts = [
  { name: 'Investment Memorandum', icon: FileText },
  { name: 'CAPEX / ROI Model', icon: Calculator, note: '(Sensitivity Analysis)' },
  { name: 'Factory Blueprint Pack', icon: Layout, note: '(BOM, process, site, utilities)' },
  { name: 'Execution Roadmap', icon: Route, note: '(Weeks, not Years)' },
  { name: 'Immutable Audit Fingerprints', icon: Fingerprint },
];

export function GenesisEngine() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState<string>('ingest');
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

  const selectedStep = workflowSteps.find(s => s.id === activeStep);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel mb-6">
            <Factory className="w-3 h-3 text-[#2d72d2]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Operational Workflow
            </span>
          </div>
          <h2 className="section-title mb-4">
            The <span className="text-[#2d72d2]">Genesis Engine</span>
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            From Ingest to Govern: The linear process that transforms raw trade data into 
            "Ready to Fund" investment artifacts.
          </p>
        </div>

        {/* Workflow Diagram */}
        <div className={`glass-panel p-6 mb-12 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">
              Genesis Engine Workflow
            </span>
            <div className="flex items-center gap-2">
              <div className="status-dot status-active" />
              <span className="text-[10px] text-[#00a396]">ACTIVE</span>
            </div>
          </div>
          <img 
            src="/images/genesis-engine-diagram.png" 
            alt="The Genesis Engine: INGEST → DETECT → SYNTHESIZE → GENERATE → GOVERN"
            className="w-full h-auto rounded-lg"
          />
        </div>

        {/* Interactive Workflow Steps */}
        <div className={`grid lg:grid-cols-5 gap-4 mb-12 transition-all duration-700 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {workflowSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`relative glass-panel p-4 text-left transition-all duration-300 ${
                activeStep === step.id 
                  ? `glass-panel-${step.color} scale-105` 
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              {/* Connector Line */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-2 w-4 h-px bg-[#30363d] z-10">
                  <ArrowRight className="absolute -right-1 -top-1.5 w-3 h-3 text-[#30363d]" />
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  step.color === 'blue' ? 'bg-[#2d72d2]/10' :
                  step.color === 'teal' ? 'bg-[#00a396]/10' :
                  'bg-[#d1980b]/10'
                }`}>
                  <step.icon className={`w-4 h-4 ${
                    step.color === 'blue' ? 'text-[#2d72d2]' :
                    step.color === 'teal' ? 'text-[#00a396]' :
                    'text-[#d1980b]'
                  }`} />
                </div>
                <span className="text-[10px] text-[#6e7681] mono">{step.number}</span>
              </div>

              <h3 className="text-sm font-bold text-[#e6edf3] mb-1">{step.title}</h3>
              <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-2">{step.subtitle}</p>
              <p className="text-xs text-[#6e7681]">{step.description}</p>
            </button>
          ))}
        </div>

        {/* Active Step Details */}
        {selectedStep && (
          <div className={`glass-panel glass-panel-${selectedStep.color} p-8 mb-12 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <selectedStep.icon className={`w-6 h-6 ${
                    selectedStep.color === 'blue' ? 'text-[#2d72d2]' :
                    selectedStep.color === 'teal' ? 'text-[#00a396]' :
                    'text-[#d1980b]'
                  }`} />
                  <h3 className="text-xl font-bold text-[#e6edf3]">
                    {selectedStep.title}: {selectedStep.subtitle}
                  </h3>
                </div>
                <p className="text-[#8b949e] mb-6 leading-relaxed">{selectedStep.action}</p>
                
                {selectedStep.tech && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6e7681]">Tech:</span>
                    <code className="px-2 py-1 rounded bg-[#161b22] text-[#00a396] mono">
                      {selectedStep.tech}
                    </code>
                  </div>
                )}
                
                {selectedStep.output && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6e7681]">Output:</span>
                    <span className="text-[#e6edf3]">{selectedStep.output}</span>
                  </div>
                )}
                
                {selectedStep.example && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#6e7681]">Example:</span>
                    <span className="text-[#d1980b]">{selectedStep.example}</span>
                  </div>
                )}
              </div>

              <div className="glass-panel p-6">
                <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-4">
                  Processing Status
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8b949e]">Data Ingestion</span>
                    <CheckCircle className="w-4 h-4 text-[#00a396]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8b949e]">Pattern Analysis</span>
                    <CheckCircle className="w-4 h-4 text-[#00a396]" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#8b949e]">Constitutional Validation</span>
                    <CheckCircle className="w-4 h-4 text-[#00a396]" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#30363d]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#e6edf3]">Step Status</span>
                      <span className={`text-xs font-mono ${
                        selectedStep.color === 'blue' ? 'text-[#2d72d2]' :
                        selectedStep.color === 'teal' ? 'text-[#00a396]' :
                        'text-[#d1980b]'
                      }`}>
                        {activeStep === 'govern' ? 'LOCKED' : 'PROCESSING'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Output Artifacts */}
        <div className={`transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <h3 className="text-lg font-semibold text-[#e6edf3] mb-6 text-center">
            Output Artifacts <span className="text-[#00a396]">(Ready to Fund)</span>
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {outputArtifacts.map((artifact) => (
              <div
                key={artifact.name}
                className="glass-panel p-4 text-center transition-all duration-300 hover:bg-white/5"
              >
                <artifact.icon className="w-6 h-6 text-[#8b949e] mx-auto mb-3" />
                <p className="text-sm text-[#e6edf3] mb-1">{artifact.name}</p>
                {artifact.note && (
                  <p className="text-[10px] text-[#6e7681]">{artifact.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className={`mt-8 text-center transition-all duration-700 delay-600 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-xs text-[#6e7681]">
            Air-gapped by default. All decisions are policy-validated and hash-chained.
          </p>
        </div>
      </div>
    </section>
  );
}
