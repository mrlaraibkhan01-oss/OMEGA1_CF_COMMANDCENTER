import { useEffect, useRef, useState } from 'react';
import { 
  FileText, Calculator, Layout, Fingerprint, 
  Download, Eye, Lock, CheckCircle, X
} from 'lucide-react';

interface Artifact {
  id: string;
  icon: React.ElementType;
  title: string;
  classification: string;
  description: string;
  contents: string[];
  redactedSections: number;
}

const artifacts: Artifact[] = [
  {
    id: 'memorandum',
    icon: FileText,
    title: 'Investment Memorandum',
    classification: 'CONFIDENTIAL',
    description: 'Comprehensive investment thesis with market analysis, competitive landscape, and strategic rationale.',
    contents: [
      'Executive Summary',
      'Market Opportunity Analysis',
      'Competitive Landscape',
      'Financial Projections',
      'Risk Assessment',
      'Strategic Recommendations',
    ],
    redactedSections: 2,
  },
  {
    id: 'roi-model',
    icon: Calculator,
    title: 'CAPEX / ROI Model',
    classification: 'RESTRICTED',
    description: 'Detailed financial model with sensitivity analysis, scenario planning, and IRR projections.',
    contents: [
      'CAPEX Breakdown',
      'Revenue Projections',
      'Sensitivity Analysis',
      'Scenario Planning',
      'IRR Calculations',
      'Payback Period Analysis',
    ],
    redactedSections: 3,
  },
  {
    id: 'blueprint',
    icon: Layout,
    title: 'Factory Blueprint Pack',
    classification: 'SOVEREIGN',
    description: 'Complete manufacturing facility specifications including BOM, process flow, and site layout.',
    contents: [
      'Bill of Materials (BOM)',
      'Process Flow Diagrams',
      'Site Layout & Civil Works',
      'Utility Requirements',
      'Equipment Specifications',
      'Implementation Timeline',
    ],
    redactedSections: 4,
  },
  {
    id: 'audit',
    icon: Fingerprint,
    title: 'Immutable Audit Chain',
    classification: 'CLASSIFIED',
    description: 'SHA-256 hash chain with complete decision provenance and constitutional compliance verification.',
    contents: [
      'Decision Hash Chain',
      'Constitutional Compliance',
      'Policy Validation Log',
      'Circuit Breaker Events',
      'Access Control Log',
      'Integrity Verification',
    ],
    redactedSections: 1,
  },
];

function ArtifactModal({ 
  artifact, 
  onClose 
}: { 
  artifact: Artifact; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2d72d2]/10 flex items-center justify-center">
              <artifact.icon className="w-6 h-6 text-[#2d72d2]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#e6edf3]">{artifact.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Lock className="w-3 h-3 text-[#d1980b]" />
                <span className="text-[10px] text-[#d1980b] uppercase tracking-wider">
                  {artifact.classification}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-[#8b949e] mb-6">{artifact.description}</p>

          {/* Document Preview */}
          <div className="glass-panel p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-[#6e7681] uppercase tracking-wider">Document Preview</span>
              <span className="text-[10px] text-[#d1980b]">{artifact.redactedSections} SECTIONS REDACTED</span>
            </div>

            <div className="space-y-3">
              {artifact.contents.map((content, i) => (
                <div 
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    i < artifact.redactedSections 
                      ? 'bg-[#d1980b]/5 border border-[#d1980b]/20' 
                      : 'bg-[#161b22] border border-[#30363d]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {i < artifact.redactedSections ? (
                      <Lock className="w-4 h-4 text-[#d1980b]" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#00a396]" />
                    )}
                    <span className={`text-sm ${i < artifact.redactedSections ? 'text-[#8b949e]' : 'text-[#e6edf3]'}`}>
                      {content}
                    </span>
                  </div>
                  {i < artifact.redactedSections && (
                    <span className="text-[10px] text-[#d1980b] uppercase">Redacted</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-panel p-4 text-center">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Pages</p>
              <p className="text-lg font-bold text-[#e6edf3] mono">{24 + artifact.redactedSections * 8}</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Hash</p>
              <p className="text-xs text-[#00a396] mono">a3f7...8e2d</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <p className="text-[10px] text-[#6e7681] uppercase tracking-wider mb-1">Status</p>
              <p className="text-xs text-[#00a396]">VERIFIED</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#2d72d2] text-white font-medium rounded-md hover:bg-[#2d72d2]/90 transition-colors">
              <Download className="w-4 h-4" />
              Download (PDF)
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 glass-panel text-[#8b949e] hover:text-[#e6edf3] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OutputArtifacts() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
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
            <FileText className="w-3 h-3 text-[#2d72d2]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Deliverables
            </span>
          </div>
          <h2 className="section-title mb-4">
            Output Artifacts <span className="text-[#2d72d2]">(Ready to Fund)</span>
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            The Genesis Engine produces comprehensive, investment-ready artifacts that transform 
            raw intelligence into actionable sovereign strategy.
          </p>
        </div>

        {/* Artifacts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {artifacts.map((artifact, index) => (
            <div
              key={artifact.id}
              className={`glass-panel p-6 transition-all duration-700 cursor-pointer hover:bg-white/5 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
              onClick={() => setSelectedArtifact(artifact)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#2d72d2]/10 flex items-center justify-center">
                    <artifact.icon className="w-6 h-6 text-[#2d72d2]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#e6edf3]">{artifact.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Lock className="w-3 h-3 text-[#d1980b]" />
                      <span className="text-[10px] text-[#d1980b] uppercase tracking-wider">
                        {artifact.classification}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="p-2 text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-[#8b949e] mb-4 leading-relaxed">
                {artifact.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#00a396]" />
                    <span className="text-xs text-[#8b949e]">
                      {artifact.contents.length - artifact.redactedSections} sections
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#d1980b]" />
                    <span className="text-xs text-[#d1980b]">
                      {artifact.redactedSections} redacted
                    </span>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-sm text-[#2d72d2] hover:text-[#e6edf3] transition-colors">
                  <Download className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className={`mt-12 glass-panel p-8 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-[#e6edf3] mono mb-2">4</p>
              <p className="text-xs text-[#8b949e] uppercase tracking-wider">Core Artifacts</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#e6edf3] mono mb-2">100+</p>
              <p className="text-xs text-[#8b949e] uppercase tracking-wider">Total Pages</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#00a396] mono mb-2">SHA-256</p>
              <p className="text-xs text-[#8b949e] uppercase tracking-wider">Hash Verified</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#d1980b] mono mb-2">Weeks</p>
              <p className="text-xs text-[#8b949e] uppercase tracking-wider">Not Years</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedArtifact && (
        <ArtifactModal 
          artifact={selectedArtifact} 
          onClose={() => setSelectedArtifact(null)} 
        />
      )}
    </section>
  );
}
