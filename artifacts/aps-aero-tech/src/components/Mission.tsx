import { Globe, Cpu, Wrench } from 'lucide-react';

export function Mission() {
  return (
    <section id="mission" className="py-24 bg-card relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-primary font-mono text-sm tracking-widest uppercase mb-4">Our Origin</h2>
          <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">ENGINEERED IN INDIA.<br/>DEPLOYED WORLDWIDE.</h3>
          <p className="text-muted-foreground text-lg">
            ASP Aertech is committed to deep-tech indigenous manufacturing. We build our own flight controllers, train our own computer vision models, and machine our own composite airframes to ensure absolute sovereign capability and zero compromise on quality.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <div className="p-8 bg-background border border-white/5 text-center flex flex-col items-center gap-4 hover:border-primary/30 transition-colors clip-edges">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Cpu className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-display font-bold text-xl text-white">Proprietary Avionics</h4>
            <p className="text-sm text-muted-foreground">In-house designed flight control systems ensuring absolute data security and hardware reliability.</p>
          </div>
          
          <div className="p-8 bg-background border border-white/5 text-center flex flex-col items-center gap-4 hover:border-primary/30 transition-colors clip-edges-reverse">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Wrench className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-display font-bold text-xl text-white">Precision Manufacturing</h4>
            <p className="text-sm text-muted-foreground">Aerospace-grade materials machined to exacting tolerances at our domestic facilities.</p>
          </div>
          
          <div className="p-8 bg-background border border-white/5 text-center flex flex-col items-center gap-4 hover:border-primary/30 transition-colors clip-edges">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h4 className="font-display font-bold text-xl text-white">Global Standards</h4>
            <p className="text-sm text-muted-foreground">Certified against international aerospace benchmarks for unrestricted operational deployment.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
