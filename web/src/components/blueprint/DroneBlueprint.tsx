import type { ModelPreset } from "@/content/products";
import { cn } from "@/lib/utils";

/**
 * Top-view technical drawings of each airframe family. Used for product cards,
 * as the placeholder while 3D loads, and as the complete static fallback on
 * low-end devices / reduced motion. Pure SVG — tiny and crisp at any size.
 */
type Props = {
  preset: ModelPreset;
  className?: string;
  /** Spinning props (CSS; disabled automatically for reduced motion). */
  animated?: boolean;
  /** Dimension caption, e.g. "SPAN 2.5 M". */
  dimension?: string;
  /** Leader-line callouts naming each subsystem (static exploded-view stand-in). */
  annotated?: boolean;
  title?: string;
};

const C = { x: 200, y: 150 };
const DEG = Math.PI / 180;

type Multi = { kind: "multi"; arms: number; stretch?: boolean; L: number; propR: number; body: [number, number, number]; ducts?: boolean; spool?: boolean; tether?: boolean; oval?: boolean };
type Wing = { kind: "wing"; variant: "conventional" | "quadplane" | "munition" };

const DRAWINGS: Record<ModelPreset, Multi | Wing> = {
  "hero-quad": { kind: "multi", arms: 4, L: 96, propR: 46, body: [58, 92, 28], oval: true },
  "surveillance-hexa": { kind: "multi", arms: 6, L: 104, propR: 40, body: [62, 66, 14] },
  "tethered-quad": { kind: "multi", arms: 8, L: 104, propR: 30, body: [54, 54, 12], tether: true },
  "fibre-fpv": { kind: "multi", arms: 4, stretch: true, L: 96, propR: 44, body: [28, 76, 6], spool: true },
  "fpv-quad": { kind: "multi", arms: 4, stretch: true, L: 88, propR: 40, body: [26, 70, 6] },
  "mini-quad": { kind: "multi", arms: 4, L: 72, propR: 34, body: [42, 70, 14] },
  "micro-whoop": { kind: "multi", arms: 4, L: 62, propR: 32, body: [34, 44, 8], ducts: true },
  "fixed-wing": { kind: "wing", variant: "conventional" },
  "vtol-quadplane": { kind: "wing", variant: "quadplane" },
  "loitering-munition": { kind: "wing", variant: "munition" },
};

export function DroneBlueprint({ preset, className, animated = false, dimension, annotated = false, title }: Props) {
  const d = DRAWINGS[preset] ?? DRAWINGS["surveillance-hexa"];
  return (
    <svg viewBox="0 0 400 300" className={cn("text-cyan", className)} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title && <title>{title}</title>}
      <defs>
        <pattern id={`bp-grid-${preset}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="currentColor" strokeOpacity="0.07" strokeWidth="0.6" />
        </pattern>
        <radialGradient id={`bp-glow-${preset}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#bp-grid-${preset})`} />
      <circle cx={C.x} cy={C.y} r="140" fill={`url(#bp-glow-${preset})`} />
      {/* centre crosshair */}
      <g stroke="currentColor" strokeOpacity="0.25" strokeWidth="0.6" strokeDasharray="3 4">
        <path d={`M${C.x} 12 V288`} />
        <path d={`M12 ${C.y} H388`} />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round">
        {d.kind === "multi" ? <MultiDrawing d={d} animated={animated} /> : <WingDrawing variant={d.variant} animated={animated} />}
      </g>
      {annotated && d.kind === "multi" && <Callouts d={d} />}
      {dimension && (
        <g className="text-fg-dim" fill="currentColor" stroke="currentColor">
          <path d="M60 282 H340" strokeWidth="0.8" strokeOpacity="0.6" />
          <path d="M60 277 V287 M340 277 V287" strokeWidth="0.8" strokeOpacity="0.6" />
          <text x="200" y="276" textAnchor="middle" stroke="none" style={{ font: "500 9px var(--font-mono)", letterSpacing: "0.18em" }}>
            {dimension.toUpperCase()}
          </text>
        </g>
      )}
      {/* forward indicator */}
      <g className="text-signal" fill="currentColor">
        <path d={`M${C.x} 8 l5 8 h-10 Z`} />
      </g>
    </svg>
  );
}

function armAngles(d: Multi) {
  if (d.stretch && d.arms === 4) return [35, 145, 215, 325];
  const step = 360 / d.arms;
  return Array.from({ length: d.arms }, (_, i) => step / 2 + step * i);
}

/** Angle measured clockwise from "forward" (up the page). */
const polar = (deg: number, r: number) => ({ x: C.x + Math.sin(deg * DEG) * r, y: C.y - Math.cos(deg * DEG) * r });

function MultiDrawing({ d, animated }: { d: Multi; animated: boolean }) {
  const angles = armAngles(d);
  const [w, h, r] = d.body;
  return (
    <>
      {d.tether && (
        <g className="text-signal" stroke="currentColor">
          <path d={`M${C.x} ${C.y} C ${C.x + 40} 210, ${C.x + 90} 230, ${C.x + 130} 258`} strokeDasharray="4 4" />
          <rect x={C.x + 122} y={250} width="34" height="22" rx="3" />
        </g>
      )}
      {d.spool && (
        <g>
          <rect x={C.x - 22} y={C.y + 28} width="44" height="24" rx="4" fill="currentColor" fillOpacity="0.06" />
          <path d={`M${C.x - 14} ${C.y + 28} V${C.y + 52} M${C.x} ${C.y + 28} V${C.y + 52} M${C.x + 14} ${C.y + 28} V${C.y + 52}`} strokeOpacity="0.5" />
          <path d={`M${C.x} ${C.y + 52} C ${C.x + 6} 230, ${C.x - 16} 250, ${C.x + 4} 272`} strokeDasharray="2 4" className="text-cyan-soft" stroke="currentColor" />
        </g>
      )}
      {angles.map((a) => {
        const m = polar(a, d.L);
        const start = polar(a, Math.min(w, h) * 0.35);
        return (
          <g key={a}>
            <path d={`M${start.x} ${start.y} L${m.x} ${m.y}`} strokeWidth="2.2" />
            {d.ducts && <circle cx={m.x} cy={m.y} r={d.propR + 4} strokeWidth="2" />}
            <circle cx={m.x} cy={m.y} r={d.propR} strokeDasharray="3 5" strokeOpacity="0.55" />
            <g className={animated ? "prop-spin" : undefined} style={animated ? { animationDuration: `${0.4 + (a % 7) * 0.03}s` } : undefined}>
              <path d={`M${m.x - d.propR + 3} ${m.y} L${m.x + d.propR - 3} ${m.y}`} strokeWidth="2" strokeOpacity="0.9" />
            </g>
            <circle cx={m.x} cy={m.y} r="7" fill="var(--color-navy-900)" />
            <circle cx={m.x} cy={m.y} r="2.4" className="text-signal" fill="currentColor" stroke="none" />
          </g>
        );
      })}
      {d.oval ? (
        <ellipse cx={C.x} cy={C.y} rx={w / 2} ry={h / 2} fill="var(--color-navy-900)" />
      ) : (
        <rect x={C.x - w / 2} y={C.y - h / 2} width={w} height={h} rx={r} fill="var(--color-navy-900)" />
      )}
      <rect x={C.x - w / 4} y={C.y - h / 5} width={w / 2} height={h / 2.5} rx="3" strokeOpacity="0.5" />
      <circle cx={C.x} cy={C.y - h / 2 + 6} r="3" className="text-signal" fill="currentColor" stroke="none" />
    </>
  );
}

function WingDrawing({ variant, animated }: { variant: Wing["variant"]; animated: boolean }) {
  const spin = animated ? "prop-spin" : undefined;
  if (variant === "munition") {
    return (
      <>
        <g transform={`rotate(28 ${C.x} ${C.y - 6})`}>
          <rect x={C.x - 150} y={C.y - 14} width="300" height="16" rx="3" fill="var(--color-navy-900)" />
        </g>
        <g transform={`rotate(-28 ${C.x} ${C.y - 6})`}>
          <rect x={C.x - 150} y={C.y - 14} width="300" height="16" rx="3" fill="var(--color-navy-900)" />
        </g>
        <path d={`M${C.x - 15} ${C.y + 92} C ${C.x - 16} ${C.y - 40}, ${C.x - 14} ${C.y - 92}, ${C.x} ${C.y - 112} C ${C.x + 14} ${C.y - 92}, ${C.x + 16} ${C.y - 40}, ${C.x + 15} ${C.y + 92} Z`} fill="var(--color-navy-900)" />
        <path d={`M${C.x - 12} ${C.y - 70} C ${C.x - 8} ${C.y - 96}, ${C.x + 8} ${C.y - 96}, ${C.x + 12} ${C.y - 70}`} className="text-signal" stroke="currentColor" />
        <path d={`M${C.x - 15} ${C.y + 80} L${C.x - 44} ${C.y + 98} L${C.x - 15} ${C.y + 92} M${C.x + 15} ${C.y + 80} L${C.x + 44} ${C.y + 98} L${C.x + 15} ${C.y + 92}`} />
        <g className={spin}>
          <path d={`M${C.x - 22} ${C.y + 100} H${C.x + 22}`} strokeWidth="2" />
        </g>
      </>
    );
  }
  const quad = variant === "quadplane";
  const span = quad ? 320 : 300;
  return (
    <>
      {/* wing */}
      <rect x={C.x - span / 2} y={C.y - 34} width={span} height={quad ? 40 : 36} rx="6" fill="var(--color-navy-900)" />
      {[-1, 1].map((s) => (
        <g key={s} strokeOpacity="0.5">
          <path d={`M${C.x + s * (quad ? 96 : 70)} ${C.y - 34} v${quad ? 40 : 36} M${C.x + s * (quad ? 110 : 92)} ${C.y - 34} v${quad ? 40 : 36}`} />
        </g>
      ))}
      {/* fuselage */}
      <path d={`M${C.x - 14} ${C.y + 96} C ${C.x - 18} ${C.y + 10}, ${C.x - 20} ${C.y - 70}, ${C.x} ${C.y - 96} C ${C.x + 20} ${C.y - 70}, ${C.x + 18} ${C.y + 10}, ${C.x + 14} ${C.y + 96} Z`} fill="var(--color-navy-900)" />
      {quad ? (
        <>
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={`M${C.x + s * 80} ${C.y - 96} V${C.y + 112}`} strokeWidth="2.4" />
              {[C.y - 96, C.y + 112].map((y) => (
                <g key={y}>
                  <circle cx={C.x + s * 80} cy={y} r="34" strokeDasharray="3 5" strokeOpacity="0.55" />
                  <g className={spin}>
                    <path d={`M${C.x + s * 80 - 31} ${y} H${C.x + s * 80 + 31}`} strokeWidth="2" />
                  </g>
                  <circle cx={C.x + s * 80} cy={y} r="6" fill="var(--color-navy-900)" />
                  <circle cx={C.x + s * 80} cy={y} r="2.2" className="text-signal" fill="currentColor" stroke="none" />
                </g>
              ))}
            </g>
          ))}
          <rect x={C.x - 84} y={C.y + 58} width="168" height="12" rx="3" fill="var(--color-navy-900)" />
          <g className={spin}>
            <path d={`M${C.x - 20} ${C.y + 100} H${C.x + 20}`} strokeWidth="2" />
          </g>
        </>
      ) : (
        <>
          <rect x={C.x - 52} y={C.y + 74} width="104" height="18" rx="4" fill="var(--color-navy-900)" />
          <path d={`M${C.x} ${C.y + 70} V${C.y + 100}`} strokeWidth="2.4" />
          <g className={spin}>
            <path d={`M${C.x - 30} ${C.y - 102} H${C.x + 30}`} strokeWidth="2" />
          </g>
        </>
      )}
    </>
  );
}

function Callouts({ d }: { d: Multi }) {
  const [w, h] = d.body;
  const motor = polar(armAngles(d)[0], d.L);
  const items: { at: [number, number]; to: [number, number]; label: string; anchor: "start" | "end" }[] = [
    { at: [C.x - w / 2 + 4, C.y - 10], to: [44, 84], label: "Airframe", anchor: "start" },
    { at: [C.x, C.y], to: [44, 150], label: "Flight computer", anchor: "start" },
    { at: [C.x, C.y + h / 3], to: [44, 216], label: "Power system", anchor: "start" },
    { at: [motor.x, motor.y], to: [356, 60], label: "Propulsion", anchor: "end" },
    { at: [C.x, C.y - h / 2 + 6], to: [356, 128], label: "EO/IR payload", anchor: "end" },
    { at: [C.x + 8, C.y + h / 2 - 8], to: [356, 236], label: "Navigation & datalink", anchor: "end" },
  ];
  return (
    <g className="text-fg-muted">
      {items.map((it) => (
        <g key={it.label}>
          <path d={`M${it.at[0]} ${it.at[1]} L${it.to[0]} ${it.to[1]}`} stroke="var(--color-cyan)" strokeOpacity="0.6" strokeWidth="0.8" fill="none" />
          <circle cx={it.at[0]} cy={it.at[1]} r="2.5" fill="var(--color-cyan)" />
          <text
            x={it.to[0] + (it.anchor === "start" ? -2 : 2)}
            y={it.to[1] - 6}
            textAnchor={it.anchor === "start" ? "start" : "end"}
            fill="currentColor"
            style={{ font: "500 9px var(--font-mono)", letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            {it.label}
          </text>
        </g>
      ))}
    </g>
  );
}
