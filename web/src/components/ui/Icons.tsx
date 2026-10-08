import { Building2, Factory, Globe2, LifeBuoy, ShieldCheck, Sprout, type LucideIcon } from "lucide-react";
import type { IndustryIcon } from "@/content/industries";
import type { ServiceIcon as ServiceIconKey } from "@/content/services";

/**
 * Looping service icons — plain SVG animated with CSS (see globals.css:
 * .prop-spin, .dash-flow, .node-seq, .spin-slow). Zero JS, respects
 * prefers-reduced-motion automatically.
 */
export function ServiceIcon({ name, className = "size-14" }: { name: ServiceIconKey; className?: string }) {
  const stroke = { stroke: "currentColor", fill: "none", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 56 56" className={className} aria-hidden>
      {name === "design" && (
        <g {...stroke}>
          <path d="M18 18 L38 38 M38 18 L18 38" />
          <rect x="23" y="23" width="10" height="10" rx="2" className="text-signal" stroke="currentColor" />
          {[
            [14, 14],
            [42, 14],
            [14, 42],
            [42, 42],
          ].map(([x, y]) => (
            <g key={`${x}${y}`}>
              <circle cx={x} cy={y} r="7" strokeDasharray="2 3" opacity="0.6" />
              <path d={`M${x - 6} ${y} H${x + 6}`} className="prop-spin" />
            </g>
          ))}
          <path d="M6 50 H50" strokeDasharray="3 3" className="dash-flow" opacity="0.7" />
        </g>
      )}
      {name === "avionics" && (
        <g {...stroke}>
          <rect x="19" y="19" width="18" height="18" rx="2" />
          <rect x="24" y="24" width="8" height="8" rx="1" className="text-signal" stroke="currentColor" />
          {[22, 28, 34].map((v) => (
            <g key={v}>
              <path d={`M${v} 19 V12`} />
              <path d={`M${v} 37 V44`} />
              <path d={`M19 ${v} H12`} />
              <path d={`M37 ${v} H44`} />
            </g>
          ))}
          <path d="M28 12 V5 H48" strokeDasharray="4 10" className="dash-flow" />
          <path d="M28 44 V51 H8" strokeDasharray="4 10" className="dash-flow" />
          <circle cx="48" cy="5" r="1.6" fill="currentColor" />
          <circle cx="8" cy="51" r="1.6" fill="currentColor" />
        </g>
      )}
      {name === "payload" && (
        <g {...stroke}>
          <path d="M18 10 H38 M22 10 V16 M34 10 V16" />
          <circle cx="28" cy="22" r="8" />
          <circle cx="28" cy="22" r="3" className="text-signal" stroke="currentColor" />
          <g className="origin-[28px_22px] animate-[scan-sweep_3.2s_ease-in-out_infinite_alternate]">
            <path d="M28 30 L16 50 H40 Z" fill="currentColor" opacity="0.12" stroke="none" />
            <path d="M28 30 L16 50 M28 30 L40 50" opacity="0.6" />
          </g>
        </g>
      )}
      {name === "testing" && (
        <g {...stroke}>
          <path id="flight-curve" d="M6 44 C 16 44, 18 14, 30 18 S 44 36, 50 10" strokeDasharray="2 4" opacity="0.6" />
          <circle r="2.6" fill="currentColor" className="text-signal" style={{ offsetPath: "path('M6 44 C 16 44, 18 14, 30 18 S 44 36, 50 10')", animation: "slide-pulse 3.4s ease-in-out infinite" }} />
          <path d="M8 50 H48" opacity="0.4" />
          <path d="M40 46 l3 3 l6 -7" className="text-go" stroke="currentColor" strokeWidth="1.8" />
        </g>
      )}
      {name === "autonomy" && (
        <g {...stroke}>
          <path d="M10 44 L20 20 L36 30 L46 10" strokeDasharray="3 4" className="dash-flow" opacity="0.8" />
          {[
            [10, 44],
            [20, 20],
            [36, 30],
            [46, 10],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3.6" className="node-seq" style={{ animationDelay: `${i * 0.6}s` }} stroke="currentColor" />
          ))}
          <path d="M46 10 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0" opacity="0.3" />
        </g>
      )}
      {name === "support" && (
        <g {...stroke}>
          <g className="spin-slow">
            <path d="M28 8 A20 20 0 0 1 47 22" />
            <path d="M45 18 L47 22 L43 23" />
            <path d="M48 34 A20 20 0 0 1 22 47" />
            <path d="M26 48 L22 47 L24 43" />
            <path d="M12 40 A20 20 0 0 1 14 14" />
            <path d="M11 17 L14 14 L17 16" />
          </g>
          <path d="M22 32 L32 22 M30 20 a4 4 0 1 1 6 6 l-2 -2 l-2 0 l0 -2 Z" className="text-signal" stroke="currentColor" />
        </g>
      )}
    </svg>
  );
}

export const industryIcons: Record<IndustryIcon, LucideIcon> = {
  defence: ShieldCheck,
  infrastructure: Building2,
  energy: Factory,
  agriculture: Sprout,
  emergency: LifeBuoy,
  mapping: Globe2,
};
