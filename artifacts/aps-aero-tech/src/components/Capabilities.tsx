import { ShieldAlert, Factory, ActivitySquare, RadioTower } from 'lucide-react';

const capabilities = [
  {
    title: "Defence & Security",
    description: "Tactical overwatch, border surveillance, and rapid threat assessment systems engineered for harsh environments.",
    icon: ShieldAlert,
    metrics: "MIL-STD-810G Compliant"
  },
  {
    title: "Industrial Inspection",
    description: "High-resolution thermal and optical payloads for energy grids, pipelines, and heavy infrastructure.",
    icon: Factory,
    metrics: "Sub-millimeter Crack Detection"
  },
  {
    title: "Emergency Response",
    description: "Rapid deployment platforms for disaster management, search and rescue, and situational awareness.",
    icon: ActivitySquare,
    metrics: "< 3 Min Deployment"
  },
  {
    title: "Intelligent Infrastructure",
    description: "Automated mapping and monitoring for smart cities, construction, and large-scale agriculture.",
    icon: RadioTower,
    metrics: "RTK/PPK Integrated"
  }
];

export function Capabilities() {
  return (
    <section id="capabilities" className="py-24 bg-card relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-4 mb-16">
          <h2 className="text-primary font-mono text-sm tracking-widest uppercase">Operational Domains</h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-foreground">MISSION READY <br/>CAPABILITIES</h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            return (
              <div key={idx} className="group p-6 bg-background border border-white/5 hover:border-primary/50 transition-colors duration-300 flex flex-col justify-between min-h-[300px] clip-edges">
                <div>
                  <Icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="text-xl font-display font-bold text-white mb-3">{cap.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
                </div>
                <div className="mt-8 pt-4 border-t border-white/5">
                  <span className="text-xs font-mono text-primary">{cap.metrics}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
