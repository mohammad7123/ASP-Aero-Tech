/**
 * "Software + Electronics + Aerospace Engineering + AI + Communication +
 * Mission Intelligence" as an orbit diagram around the ASP core.
 * Pure SVG/CSS: rotating dashed rings, flowing connector lines.
 */
export function IntegrationOrbit({ disciplines }: { disciplines: string[] }) {
  const n = disciplines.length;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]" role="img" aria-label={`Integration of ${disciplines.join(", ")}`}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full text-cyan" aria-hidden>
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeOpacity="0.18" />
        <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeDasharray="2 14" className="spin-slow" />
        <circle cx="200" cy="200" r="96" fill="none" stroke="var(--color-signal)" strokeOpacity="0.35" strokeDasharray="1 9" className="spin-slow" style={{ animationDirection: "reverse", animationDuration: "18s" }} />
        {disciplines.map((_, i) => {
          const a = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <line
              key={i}
              x1="200"
              y1="200"
              x2={200 + Math.cos(a) * 150}
              y2={200 + Math.sin(a) * 150}
              stroke="currentColor"
              strokeOpacity="0.45"
              strokeDasharray="3 7"
              className="dash-flow"
              style={{ animationDelay: `${i * -0.8}s` }}
            />
          );
        })}
        <circle cx="200" cy="200" r="54" fill="var(--color-navy-900)" stroke="currentColor" strokeOpacity="0.6" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-3xl font-bold tracking-tight text-fg">ASP</p>
          <p className="label-mono text-[9px] text-fg-dim">Advance System Platform</p>
        </div>
      </div>
      {disciplines.map((d, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        return (
          <span
            key={d}
            className="glass-solid absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg"
            style={{ left: `${50 + Math.cos(a) * 37.5}%`, top: `${50 + Math.sin(a) * 37.5}%` }}
          >
            {d}
          </span>
        );
      })}
    </div>
  );
}
