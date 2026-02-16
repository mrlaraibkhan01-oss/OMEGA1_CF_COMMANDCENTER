import { useState, useEffect } from 'react';
import { Menu, X, Terminal } from 'lucide-react';

interface NavigationProps {
  scrollY: number;
  onNavigate: (sectionId: string) => void;
  onDemoClick: () => void;
}

const navItems = [
  { id: 'sovereign-mandate', label: 'Mandate' },
  { id: 'economic-leakage', label: 'Leakage' },
  { id: 'three-brains', label: 'Architecture' },
  { id: 'seven-pillars', label: 'Pillars' },
  { id: 'technology-security', label: 'Security' },
  { id: 'request-access', label: 'Access' },
];

export function Navigation({ scrollY, onNavigate, onDemoClick }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(scrollY > 100);
  }, [scrollY]);

  const handleNavClick = (sectionId: string) => {
    onNavigate(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Main Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isVisible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
      >
        <div className="mx-4 mt-4">
          <div 
            className="glass-panel px-6 py-3 max-w-7xl mx-auto"
            style={{ backdropFilter: 'blur(24px)' }}
          >
            <div className="flex items-center justify-between">
              {/* Logo */}
              <button 
                onClick={() => handleNavClick('hero')}
                className="flex items-center gap-3 group"
              >
                <img 
                  src="/images/rebootix-logo.png" 
                  alt="Rebootix" 
                  className="h-8 w-auto opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span 
                  className="text-sm font-medium tracking-wider transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  OMEGA-1
                </span>
              </button>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="px-4 py-2 text-xs font-medium tracking-wider uppercase rounded-md transition-all hover:bg-white/5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Demo Button */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={onDemoClick}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase rounded-lg transition-all"
                  style={{ 
                    background: 'rgba(201, 169, 98, 0.1)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(201, 169, 98, 0.25)',
                  }}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  War Room
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mx-4 mt-2">
            <div className="glass-panel p-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full px-4 py-3 text-left text-sm font-medium rounded-md transition-all hover:bg-white/5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {item.label}
                </button>
              ))}
              <div 
                className="pt-2 mt-2 border-t"
                style={{ borderColor: 'rgba(201, 169, 98, 0.1)' }}
              >
                <button
                  onClick={() => {
                    onDemoClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg"
                  style={{ 
                    background: 'rgba(201, 169, 98, 0.1)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(201, 169, 98, 0.25)',
                  }}
                >
                  <Terminal className="w-4 h-4" />
                  Enter War Room
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Static Logo (visible when nav is hidden) */}
      <div 
        className={`fixed top-6 left-6 z-40 transition-opacity duration-500 ${
          isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button 
          onClick={() => handleNavClick('hero')}
          className="flex items-center gap-3 group"
        >
          <img 
            src="/images/rebootix-logo.png" 
            alt="Rebootix" 
            className="h-10 w-auto opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </button>
      </div>

      {/* Static Demo Button (visible when nav is hidden) */}
      <div 
        className={`fixed top-6 right-6 z-40 transition-opacity duration-500 ${
          isVisible ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <button
          onClick={onDemoClick}
          className="flex items-center gap-2 px-4 py-2 text-xs font-medium tracking-wider uppercase glass-panel transition-all"
          style={{ color: 'var(--text-muted)' }}
        >
          <Terminal className="w-3.5 h-3.5" />
          War Room
        </button>
      </div>
    </>
  );
}
