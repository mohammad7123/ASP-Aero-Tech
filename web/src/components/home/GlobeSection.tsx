"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useTier } from "@/components/providers/DeviceTier";
import { globeArcs, globePins } from "@/content/highlights";
import { useFinePointer } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { useViewportPresence } from "./ProductShowcase";

const GlobeCanvas = dynamic(() => import("@/components/three/globe/GlobeCanvas"), { ssr: false });

/**
 * "Built in India" globe: a dot-matrix Earth with pins for the operating
 * environments the portfolio is engineered for, and animated flight arcs.
 * The list doubles as the accessible (and static-tier) version.
 */
export function GlobeSection() {
  const tier = useTier();
  const [active, setActive] = useState<string | null>(null);
  const fine = useFinePointer();
  const { ref, near, visible } = useViewportPresence("300px 0px");
  const webgl = tier === "high" || tier === "low";

  return (
    <section className="relative overflow-hidden bg-void py-24 sm:py-32" aria-labelledby="globe-title">
      <div className="container-x grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow" data-animate>
            Built in India · ready for its terrain
          </p>
          <h2 id="globe-title" className="mt-5 text-3xl font-semibold leading-[1.05] sm:text-4xl lg:text-5xl" data-animate>
            One fleet. Every Indian operating environment.
          </h2>
          <p className="mt-5 leading-relaxed text-fg-muted sm:text-lg" data-animate>
            From high-altitude passes to the coastal cyclone belt, ASP platforms are rated to 15,500 ft and configured around the terrain, weather and mission they will meet.
          </p>
          <ul className="mt-8 grid gap-2 sm:grid-cols-2">
            {globePins.map((pin) => (
              <li key={pin.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(pin.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(pin.id)}
                  onBlur={() => setActive(null)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    active === pin.id ? "border-signal/60 bg-signal/[0.08]" : "border-line hover:border-line-strong",
                  )}
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", pin.kind === "site" ? "bg-go" : "bg-signal")} />
                  <span>
                    <span className="block text-sm font-medium text-fg">{pin.label}</span>
                    <span className="block text-xs text-fg-dim">{pin.detail}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="label-mono mt-5 text-fg-dim">Pins mark representative operating environments.</p>
        </div>

        <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[640px]" data-cursor={webgl && fine ? "Drag" : undefined}>
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(43,217,255,0.16),transparent_65%)]" aria-hidden />
          {webgl && near ? (
            <GlobeCanvas pins={globePins} arcs={globeArcs} activeId={active} onActive={setActive} active={visible} interactive={fine} />
          ) : (
            <StaticRadar active={active} />
          )}
        </div>
      </div>
    </section>
  );
}

/** Non-WebGL stand-in: a radar scope with the same pins in relative positions (no map outlines). */
function StaticRadar({ active }: { active: string | null }) {
  const bounds = { latMin: 8, latMax: 37, lngMin: 68, lngMax: 97 };
  return (
    <div className="absolute inset-[6%] rounded-full border border-line-strong" aria-hidden>
      {[0.25, 0.5, 0.75].map((r) => (
        <div key={r} className="absolute rounded-full border border-line" style={{ inset: `${r * 50}%` }} />
      ))}
      <div className="absolute left-1/2 top-0 h-full w-px bg-line" />
      <div className="absolute left-0 top-1/2 h-px w-full bg-line" />
      <div className="animate-radar absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,var(--hud-sweep),transparent_25%)]" />
      {globePins.map((p) => {
        const x = 12 + ((p.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin)) * 76;
        const y = 12 + ((bounds.latMax - p.lat) / (bounds.latMax - bounds.latMin)) * 76;
        return (
          <span key={p.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
            <span className={cn("block rounded-full bg-signal shadow-[0_0_12px_var(--color-signal)] transition-all", active === p.id ? "size-3.5" : "size-2")} />
          </span>
        );
      })}
    </div>
  );
}
