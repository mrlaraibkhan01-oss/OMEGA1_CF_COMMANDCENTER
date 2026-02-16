import { Shield, Lock, Server, Globe } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { id: 'sovereign-mandate', label: 'Sovereign Mandate' },
    { id: 'economic-leakage', label: 'Economic Leakage' },
    { id: 'three-brains', label: 'Three Brains' },
    { id: 'seven-pillars', label: 'Seven Pillars' },
    { id: 'technology-security', label: 'Technology' },
    { id: 'request-access', label: 'Request Access' },
  ];

  return (
    <footer className="relative z-10 border-t border-[#30363d] bg-[#0d1117]/80 backdrop-blur-xl">
      {/* Status Bar */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="status-dot status-active" />
                <span className="text-xs text-[#8b949e] mono">SYSTEM OPERATIONAL</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-3 h-3 text-[#00a396]" />
                <span className="text-xs text-[#8b949e] mono">ENCRYPTED</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-3 h-3 text-[#2d72d2]" />
                <span className="text-xs text-[#8b949e] mono">AIR-GAPPED</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3 h-3 text-[#8b949e]" />
              <span className="text-xs text-[#8b949e] mono">SOVEREIGN NODE: ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="/images/rebootix-logo.png" 
                alt="Rebootix" 
                className="h-10 w-auto opacity-60"
              />
              <div>
                <h3 className="text-lg font-semibold text-[#e6edf3]">REBOOTIX</h3>
                <p className="text-xs text-[#8b949e]">ARTIFICIAL INTELLIGENCE R&D</p>
              </div>
            </div>
            <p className="text-sm text-[#8b949e] max-w-md mb-6">
              OMEGA-1: The Sovereign Decision Engine. Architecting national industrial 
              ecosystems through neuro-symbolic AI, constitutional governance, and 
              immutable audit chains.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#6e7681]">
              <Shield className="w-4 h-4 text-[#00a396]" />
              <span>All data processed on sovereign nodes. No egress.</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#6e7681] mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => onNavigate(link.id)}
                    className="text-sm text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-wider uppercase text-[#6e7681] mb-4">
              Secure Contact
            </h4>
            <div className="space-y-3">
              <div className="glass-panel p-3">
                <p className="text-xs text-[#6e7681] mb-1">CLASSIFICATION</p>
                <p className="text-sm text-[#e6edf3] font-medium">SOVEREIGN / RESTRICTED</p>
              </div>
              <div className="glass-panel p-3">
                <p className="text-xs text-[#6e7681] mb-1">DEPLOYMENT</p>
                <p className="text-sm text-[#e6edf3] font-medium">On-Premise / Air-Gapped</p>
              </div>
              <p className="text-xs text-[#6e7681]">
                Access requests are vetted for sovereign alignment.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-[#30363d] flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-[#6e7681]">
            © {currentYear} Rebootix Artificial Intelligence Research and Development Services. 
            All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#6e7681] mono">OMEGA-1 v2.4.1</span>
            <span className="text-xs text-[#00a396] mono">SHA-256 VERIFIED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
