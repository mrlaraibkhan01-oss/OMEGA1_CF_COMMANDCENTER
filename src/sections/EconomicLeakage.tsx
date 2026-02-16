import { useEffect, useRef, useState } from 'react';
import { ArrowRight, TrendingDown, AlertTriangle, Package, DollarSign, ArrowLeftRight } from 'lucide-react';

// 3D Globe Visualization Component
function Globe3D({ reversed = false }: { reversed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();
    window.addEventListener('resize', resize);

    let rotation = 0;
    const particles: { angle: number; lat: number; speed: number; active: boolean }[] = [];
    
    // Create particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        angle: (i / 30) * Math.PI * 2,
        lat: (Math.random() - 0.5) * Math.PI * 0.8,
        speed: 0.005 + Math.random() * 0.005,
        active: Math.random() > 0.3,
      });
    }

    const animate = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;

      ctx.clearRect(0, 0, width, height);

      rotation += 0.003;

      // Draw globe wireframe
      ctx.strokeStyle = reversed ? 'rgba(0, 163, 150, 0.2)' : 'rgba(209, 152, 11, 0.2)';
      ctx.lineWidth = 1;

      // Latitude lines
      for (let lat = -2; lat <= 2; lat++) {
        const y = centerY + (lat / 3) * radius * 0.8;
        const r = Math.sqrt(radius * radius - (lat / 3 * radius * 0.8) ** 2);
        ctx.beginPath();
        ctx.ellipse(centerX, y, r, r * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitude lines
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI + rotation;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius * Math.abs(Math.cos(angle)), radius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw globe outline
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = reversed ? 'rgba(0, 163, 150, 0.4)' : 'rgba(209, 152, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw particles
      particles.forEach((p) => {
        if (!p.active) return;
        
        p.angle += reversed ? -p.speed : p.speed;
        
        const x3d = Math.cos(p.lat) * Math.cos(p.angle + rotation) * radius;
        const y3d = Math.sin(p.lat) * radius;
        const z3d = Math.cos(p.lat) * Math.sin(p.angle + rotation) * radius;
        
        // Only draw front-facing particles
        if (z3d > 0) {
          const x = centerX + x3d;
          const y = centerY + y3d;
          const size = 2 + (z3d / radius) * 2;
          const alpha = 0.3 + (z3d / radius) * 0.7;
          
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = reversed 
            ? `rgba(0, 163, 150, ${alpha})`
            : `rgba(209, 152, 11, ${alpha})`;
          ctx.fill();
          
          // Glow effect
          ctx.beginPath();
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          gradient.addColorStop(0, reversed 
            ? `rgba(0, 163, 150, ${alpha * 0.5})`
            : `rgba(209, 152, 11, ${alpha * 0.5})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, [reversed]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}

export function EconomicLeakage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
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

  const leakageStats = [
    { value: '$500M+', label: 'Annual Valve Leakage (KSA)', icon: DollarSign },
    { value: '$2B+', label: 'UAE Trade Deficit (Valves)', icon: TrendingDown },
    { value: '$3B+', label: '5-Year Cumulative Drain', icon: AlertTriangle },
  ];

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-panel mb-6">
            <AlertTriangle className="w-4 h-4 text-[#d1980b]" />
            <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#8b949e]">
              Critical Vulnerability
            </span>
          </div>
          <h2 className="section-title mb-4">
            The <span className="text-[#d1980b]">Economic Leakage</span> Imperative
          </h2>
          <p className="section-subtitle max-w-3xl mx-auto">
            Economic leakage is not merely an accounting discrepancy; it is a systemic 
            vulnerability that bleeds national wealth, exports intellectual property, and 
            cements dependency on foreign adversaries.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {leakageStats.map((stat, index) => (
            <div
              key={stat.label}
              className={`glass-panel glass-panel-gold p-8 text-center transition-all duration-700 hover:scale-105 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ 
                transitionDelay: `${index * 150}ms`,
                boxShadow: '0 8px 32px rgba(209, 152, 11, 0.15)',
              }}
            >
              <stat.icon className="w-10 h-10 text-[#d1980b] mx-auto mb-4" />
              <p className="text-4xl font-bold text-[#e6edf3] mono mb-2">{stat.value}</p>
              <p className="text-sm text-[#8b949e]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Problem/Solution Visualization */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* 3D Globe */}
          <div 
            className={`relative h-[400px] glass-panel overflow-hidden transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
            }`}
            style={{
              boxShadow: showSolution 
                ? '0 20px 60px rgba(0, 163, 150, 0.2)' 
                : '0 20px 60px rgba(209, 152, 11, 0.2)',
            }}
          >
            <div className="absolute top-4 left-4 z-10">
              <span className="text-[11px] text-[#6e7681] uppercase tracking-wider">
                {showSolution ? 'Value Recapture Flow' : 'Capital Flight Visualization'}
              </span>
            </div>
            
            {/* Flow direction indicator */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${showSolution ? 'bg-[#00a396]' : 'bg-[#d1980b]'}`} />
              <span className={`text-[10px] uppercase ${showSolution ? 'text-[#00a396]' : 'text-[#d1980b]'}`}>
                {showSolution ? 'INBOUND' : 'OUTBOUND'}
              </span>
            </div>

            <Globe3D reversed={showSolution} />

            {/* Foreign hubs labels */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] text-[#6e7681] uppercase">
              <span>Houston</span>
              <span>Milan</span>
              <span>Shanghai</span>
            </div>
          </div>

          {/* Problem Details */}
          <div 
            className={`space-y-6 transition-all duration-1000 delay-500 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
            }`}
          >
            {/* HS-Code Arbitrage */}
            <div className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#d1980b]/10 flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-[#d1980b]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">
                    HS-Code Arbitrage
                  </h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    Raw materials exported at low cost are processed abroad and re-imported as 
                    finished high-precision goods at massive premiums. Foreign entities capture 
                    the value-add margin while the sovereign nation bleeds wealth.
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-[#161b22] text-[10px] text-[#6e7681] mono">
                      HS: 8481.80
                    </span>
                    <span className="px-2 py-1 rounded bg-[#161b22] text-[10px] text-[#6e7681] mono">
                      HS: 8481.90
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Value-Add Gap */}
            <div className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#2d72d2]/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-6 h-6 text-[#2d72d2]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">
                    The Value-Add Gap
                  </h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    The import market is bifurcated: high-value segments dominated by USA/Western 
                    Europe commanding premiums for reliability and certification, and volume 
                    segments dominated by China where competing is a "race to the bottom."
                  </p>
                </div>
              </div>
            </div>

            {/* Strategic Vulnerability */}
            <div className="glass-panel p-6 hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#00a396]/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-[#00a396]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#e6edf3] mb-2">
                    Strategic Vulnerability
                  </h3>
                  <p className="text-sm text-[#8b949e] leading-relaxed">
                    Reliance on imported components for mission-critical infrastructure introduces 
                    unacceptable risk. Supply chains stretching across continents create lead times 
                    that jeopardize operational continuity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solution Toggle CTA */}
        <div 
          className={`text-center transition-all duration-1000 delay-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="group inline-flex items-center gap-3 px-8 py-4 glass-panel text-[#e6edf3] hover:bg-white/5 transition-all duration-300"
            style={{
              boxShadow: showSolution 
                ? '0 8px 32px rgba(0, 163, 150, 0.2)' 
                : '0 8px 32px rgba(209, 152, 11, 0.2)',
            }}
          >
            <ArrowLeftRight className={`w-5 h-5 transition-transform duration-500 ${showSolution ? 'rotate-180' : ''}`} />
            <span>{showSolution ? 'View Leakage Problem' : 'Preview Reversal Solution'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
