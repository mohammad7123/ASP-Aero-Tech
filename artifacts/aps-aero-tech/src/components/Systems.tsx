import { ArrowRight, Plane, Battery, Zap } from 'lucide-react';

export function Systems() {
  return (
    <section id="systems" className="py-24 border-y border-white/5 overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative h-[400px] lg:h-[600px] w-full bg-card border border-white/10 clip-edges group">
            {/* Abstract visual of a drone */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
            <div className="absolute inset-0 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-700">
              <Plane className="w-48 h-48 text-primary transform -rotate-12 group-hover:rotate-0 transition-transform duration-700 ease-out" />
            </div>
            
            {/* Tech overlays */}
            <div className="absolute top-6 left-6 text-xs font-mono text-muted-foreground border-l-2 border-primary pl-2">
              MODEL: ASP-X GHOST<br/>
              STATUS: CLASSIFIED
            </div>
            <div className="absolute bottom-6 right-6 text-xs font-mono text-primary text-right border-r-2 border-primary pr-2">
              TARGET LOCK<br/>
              ACQUIRED
            </div>
            
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,229,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px] opacity-20" />
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-primary font-mono text-sm tracking-widest uppercase mb-4">Flagship Platform</h2>
              <h3 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">ASP-X GHOST</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The definitive tactical platform for sustained operations. Engineered with proprietary composite materials, the ASP-X Ghost delivers unprecedented endurance and silent operation for covert and industrial surveillance.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="border border-white/10 p-4 bg-white/5 clip-edges">
                <Battery className="w-6 h-6 text-primary mb-2" />
                <div className="text-2xl font-display font-bold text-white">120 Min</div>
                <div className="text-sm text-muted-foreground">Flight Endurance</div>
              </div>
              <div className="border border-white/10 p-4 bg-white/5 clip-edges-reverse">
                <Zap className="w-6 h-6 text-primary mb-2" />
                <div className="text-2xl font-display font-bold text-white">15 kg</div>
                <div className="text-sm text-muted-foreground">Payload Capacity</div>
              </div>
            </div>

            <ul className="space-y-4 text-sm text-muted-foreground font-medium mt-2">
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs">01</span>
                Anti-jamming GPS / GNSS integration for contested airspace
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs">02</span>
                Swarm-ready architecture with secure mesh networking
              </li>
              <li className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-mono text-xs">03</span>
                AI-driven autonomous tracking and obstacle avoidance
              </li>
            </ul>

            <a href="#contact" className="inline-flex items-center gap-2 text-primary font-bold hover:text-white transition-colors w-fit group uppercase tracking-wider text-sm mt-4">
              Request Technical Data Sheet
              <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
