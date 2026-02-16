import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Hero } from './sections/Hero';
import { SovereignMandate } from './sections/SovereignMandate';
import { EconomicLeakage } from './sections/EconomicLeakage';
import { OmegaSolution } from './sections/OmegaSolution';
import { ThreeBrains } from './sections/ThreeBrains';
import { SevenPillars } from './sections/SevenPillars';
import { GenesisEngine } from './sections/GenesisEngine';
import { TechnologySecurity } from './sections/TechnologySecurity';
import { Personas } from './sections/Personas';
import { OutputArtifacts } from './sections/OutputArtifacts';
import { RequestAccess } from './sections/RequestAccess';
import DemoPage from './pages/DemoPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'demo'>('home');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentPage === 'demo') {
    return <DemoPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen console-grid noise-overlay relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Warm gradient background */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 20%, rgba(201, 169, 98, 0.06), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(45, 74, 62, 0.08), transparent),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(139, 115, 85, 0.05), transparent)
          `,
        }}
      />
      
      {/* Subtle grid */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 169, 98, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 169, 98, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />
      
      {/* Navigation */}
      <Navigation 
        scrollY={scrollY} 
        onNavigate={scrollToSection}
        onDemoClick={() => setCurrentPage('demo')}
      />
      
      {/* Main Content */}
      <main className="relative z-10">
        <section id="hero">
          <Hero onCtaClick={() => scrollToSection('request-access')} />
        </section>
        
        <section id="sovereign-mandate">
          <SovereignMandate />
        </section>
        
        <section id="economic-leakage">
          <EconomicLeakage />
        </section>
        
        <section id="omega-solution">
          <OmegaSolution />
        </section>
        
        <section id="three-brains">
          <ThreeBrains />
        </section>
        
        <section id="seven-pillars">
          <SevenPillars />
        </section>
        
        <section id="genesis-engine">
          <GenesisEngine />
        </section>
        
        <section id="technology-security">
          <TechnologySecurity />
        </section>
        
        <section id="personas">
          <Personas />
        </section>
        
        <section id="output-artifacts">
          <OutputArtifacts />
        </section>
        
        <section id="request-access">
          <RequestAccess />
        </section>
      </main>
      
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}

export default App;
