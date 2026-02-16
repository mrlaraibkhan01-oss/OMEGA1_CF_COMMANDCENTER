import { useEffect, useRef, useState } from 'react';
import { 
  Lock, Shield, Send, CheckCircle, AlertTriangle,
  User, Building, ShieldCheck, Target
} from 'lucide-react';

const clearanceLevels = [
  { value: 'government', label: 'Government', description: 'Ministries, Agencies, State Entities' },
  { value: 'institutional', label: 'Institutional', description: 'Sovereign Wealth Funds, Public Funds' },
  { value: 'private', label: 'Private', description: 'Family Offices, UHNW Individuals' },
];

export function RequestAccess() {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    clearanceLevel: '',
    missionObjective: '',
  });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      {/* Background Logo Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img 
          src="/images/rebootix-logo.png" 
          alt="" 
          className="w-[800px] h-auto opacity-[0.02]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel mb-6">
            <Lock className="w-3 h-3 text-[#d1980b]" />
            <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Secure Gateway
            </span>
          </div>
          <h2 className="section-title mb-4">
            Initiate Protocol / <span className="text-[#d1980b]">Request Access</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Access to OMEGA-1 is restricted. Requests are vetted for sovereign alignment 
            and strategic compatibility.
          </p>
        </div>

        {/* Security Warning */}
        <div className={`glass-panel glass-panel-gold p-4 mb-8 transition-all duration-700 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[#d1980b] flex-shrink-0" />
            <p className="text-sm text-[#8b949e]">
              <span className="text-[#e6edf3] font-medium">Classification Notice:</span> All submissions 
              are processed on air-gapped sovereign nodes. Information provided is subject to 
              constitutional verification protocols.
            </p>
          </div>
        </div>

        {/* Form */}
        {!isSubmitted ? (
          <form 
            onSubmit={handleSubmit}
            className={`glass-panel p-8 lg:p-12 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-xs text-[#6e7681] uppercase tracking-wider mb-3">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#2d72d2] transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Organization */}
              <div>
                <label className="flex items-center gap-2 text-xs text-[#6e7681] uppercase tracking-wider mb-3">
                  <Building className="w-4 h-4" />
                  Organization
                </label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#2d72d2] transition-colors"
                  placeholder="Government entity, SWF, or Family Office"
                />
              </div>
            </div>

            {/* Clearance Level */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-xs text-[#6e7681] uppercase tracking-wider mb-3">
                <ShieldCheck className="w-4 h-4" />
                Clearance Level
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {clearanceLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, clearanceLevel: level.value })}
                    className={`p-4 text-left border rounded-md transition-all ${
                      formData.clearanceLevel === level.value
                        ? 'border-[#2d72d2] bg-[#2d72d2]/10'
                        : 'border-[#30363d] bg-[#161b22] hover:border-[#8b949e]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${
                        formData.clearanceLevel === level.value ? 'bg-[#2d72d2]' : 'bg-[#30363d]'
                      }`} />
                      <span className={`text-sm font-medium ${
                        formData.clearanceLevel === level.value ? 'text-[#e6edf3]' : 'text-[#8b949e]'
                      }`}>
                        {level.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#6e7681]">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Mission Objective */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-xs text-[#6e7681] uppercase tracking-wider mb-3">
                <Target className="w-4 h-4" />
                Mission Objective
              </label>
              <textarea
                required
                rows={4}
                value={formData.missionObjective}
                onChange={(e) => setFormData({ ...formData, missionObjective: e.target.value })}
                className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-md text-[#e6edf3] placeholder-[#6e7681] focus:outline-none focus:border-[#2d72d2] transition-colors resize-none"
                placeholder="Describe your sovereign AI objectives, industrial localization goals, or strategic initiatives..."
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-[#2d72d2] text-white font-semibold rounded-md hover:bg-[#2d72d2]/90 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit Request
              </button>
              <p className="text-xs text-[#6e7681] text-center sm:text-left">
                Response time: 24-48 hours. All requests subject to sovereign alignment vetting.
              </p>
            </div>
          </form>
        ) : (
          /* Success State */
          <div className={`glass-panel glass-panel-teal p-12 text-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <div className="w-16 h-16 rounded-full bg-[#00a396]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#00a396]" />
            </div>
            <h3 className="text-2xl font-bold text-[#e6edf3] mb-4">
              Protocol Initiated
            </h3>
            <p className="text-[#8b949e] mb-6 max-w-md mx-auto">
              Your access request has been securely transmitted to sovereign nodes. 
              You will receive a response within 24-48 hours.
            </p>
            <div className="glass-panel inline-flex items-center gap-3 px-4 py-2">
              <Shield className="w-4 h-4 text-[#00a396]" />
              <span className="text-xs text-[#8b949e] mono">Request ID: OMEGA-{Date.now().toString(36).toUpperCase().slice(-8)}</span>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div className={`mt-8 text-center transition-all duration-700 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <p className="text-xs text-[#6e7681]">
            By submitting this form, you acknowledge that all information will be processed 
            in accordance with sovereign data residency protocols.
          </p>
        </div>
      </div>
    </section>
  );
}
