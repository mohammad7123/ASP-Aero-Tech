import { ArrowRight, Crosshair, Navigation, ShieldCheck } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
      {/* Background element */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00E5FF12_1px,transparent_1px),linear-gradient(to_bottom,#00E5FF12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full grid lg:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 w-fit backdrop-blur-sm">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-primary uppercase">Active Deployment</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-[1.1] tracking-tight">
            INTELLIGENT <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              AERIAL SYSTEMS
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl border-l-2 border-primary/50 pl-4">
            ASP Aertech engineers dependable, mission-critical aerial platforms for defence, 
            industrial operations, emergency response, and intelligent infrastructure. 
            Built for precision. Built to endure.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <a href="#systems" className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all clip-edges font-bold tracking-wide uppercase text-sm group">
              Explore Platforms
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href="#contact" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 text-foreground hover:bg-white/10 border border-white/10 transition-all clip-edges-reverse font-bold tracking-wide uppercase text-sm">
              Request Specs
            </a>
          </div>
        </div>

        <div className="hidden lg:flex relative h-[600px] w-full items-center justify-center">
          {/* Abstract representation of a drone / radar UI */}
          <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-8 border border-primary/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
          <div className="absolute inset-16 border-t border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
          
          <div className="relative z-10 grid grid-cols-2 gap-4">
            <div className="p-6 bg-black/40 border border-white/5 backdrop-blur-md clip-edges flex flex-col gap-4 translate-y-8 hover:border-primary/50 transition-colors">
              <Crosshair className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-display font-bold text-white">Sub-Meter</div>
                <div className="text-sm text-muted-foreground">Targeting Precision</div>
              </div>
            </div>
            
            <div className="p-6 bg-black/40 border border-white/5 backdrop-blur-md clip-edges-reverse flex flex-col gap-4 hover:border-primary/50 transition-colors">
              <Navigation className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-display font-bold text-white">400+ km</div>
                <div className="text-sm text-muted-foreground">Operational Range</div>
              </div>
            </div>
            
            <div className="p-6 bg-black/40 border border-white/5 backdrop-blur-md clip-edges flex flex-col gap-4 translate-x-4 hover:border-primary/50 transition-colors">
              <ShieldCheck className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-display font-bold text-white">AES-256</div>
                <div className="text-sm text-muted-foreground">Encrypted Data Link</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
