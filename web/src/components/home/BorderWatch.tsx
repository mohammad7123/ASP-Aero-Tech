"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { borderPath, borderSectors, indiaPath, MAP, neighbourPath } from "@/content/indiaMap";
import { useReducedMotion } from "@/lib/hooks";
import { clamp, cn, easeInOutCubic, lerp } from "@/lib/utils";
import { useViewportPresence } from "./ProductShowcase";

/* ───────────── projection helpers (same Mercator the paths were built with) ───────────── */

const KX = MAP.width / (MAP.lng[1] - MAP.lng[0]);
const KY = (KX * 180) / Math.PI;
const merc = (lat: number) => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
const Y_TOP = merc(MAP.latTop);
const proj = (lng: number, lat: number): [number, number] => [(lng - MAP.lng[0]) * KX, (Y_TOP - merc(lat)) * KY];
const unproj = (x: number, y: number): [number, number] => [MAP.lng[0] + x / KX, ((2 * Math.atan(Math.exp(Y_TOP - y / KY)) - Math.PI / 2) * 180) / Math.PI];

const GRATICULE = (() => {
  const lines: string[] = [];
  for (let lng = 70; lng <= 95; lng += 5) lines.push(`M${proj(lng, MAP.latTop)[0].toFixed(1)} 0V${MAP.height}`);
  for (let lat = 10; lat <= 35; lat += 5) lines.push(`M0 ${proj(70, lat)[1].toFixed(1)}H${MAP.width}`);
  return lines.join("");
})();

const MAP_LABELS: Array<{ t: string; lng: number; lat: number; size?: number; strong?: boolean }> = [
  { t: "INDIA", lng: 79.2, lat: 22.6, size: 26, strong: true },
  { t: "PAKISTAN", lng: 70.2, lat: 29.4 },
  { t: "CHINA", lng: 85, lat: 34.6 },
  { t: "NEPAL", lng: 84.2, lat: 28.7, size: 8 },
  { t: "MYANMAR", lng: 95.6, lat: 21.4, size: 8 },
  { t: "ARABIAN SEA", lng: 69.9, lat: 17 },
  { t: "BAY OF BENGAL", lng: 87.6, lat: 14.5 },
  { t: "INDIAN OCEAN", lng: 80.5, lat: 6.6 },
];

const DEG = 180 / Math.PI;
const bearing = (dx: number, dy: number) => (Math.atan2(dx, -dy) * DEG + 360) % 360;
const shortestTurn = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180;

type Mode = "hold" | "transit";

/**
 * "Western frontier" map: a drone patrols the India–Pakistan border (the
 * International Border and the Line of Control) from the Rann of Kutch to
 * Siachen, pausing at seven terrain sectors. Tap a sector to send it there.
 *
 * The animation runs in one rAF loop that writes straight to the DOM (no
 * per-frame React renders), pauses off-screen, and is replaced by a static
 * map for prefers-reduced-motion.
 */
export function BorderWatch() {
  const sectors = borderSectors;
  const reduced = useReducedMotion();
  const { ref: frameRef, visible } = useViewportPresence("200px 0px");

  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("hold");

  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const droneRef = useRef<SVGGElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const latRef = useRef<HTMLSpanElement>(null);
  const lngRef = useRef<HTMLSpanElement>(null);
  const hdgRef = useRef<HTMLSpanElement>(null);
  const chipsRef = useRef<HTMLDivElement>(null);

  const run = useRef(false);
  const geo = useRef({ total: 0, lens: [] as number[] });
  const st = useRef({
    pos: 0,
    from: 0,
    to: 0,
    t0: 0,
    dur: 1,
    phase: "dwell" as "move" | "dwell",
    dwellUntil: 0,
    idx: 0,
    dir: 1,
    manual: false,
    heading: 90,
    hud: 0,
  });

  /** Moves the drone to `len` along the border and refreshes everything that follows it. */
  const place = useCallback((len: number, now: number, snapHeading = false) => {
    const path = pathRef.current;
    const drone = droneRef.current;
    if (!path || !drone) return;
    const { total } = geo.current;
    const p = path.getPointAtLength(len);
    const a = path.getPointAtLength(Math.max(0, len - 2));
    const b = path.getPointAtLength(Math.min(total, len + 2));
    const target = bearing(b.x - a.x, b.y - a.y);
    const S = st.current;
    S.heading = snapHeading ? target : S.heading + shortestTurn(S.heading, target) * 0.12;
    drone.setAttribute("transform", `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`);
    bodyRef.current?.setAttribute("transform", `rotate(${(S.heading - 90).toFixed(1)})`);
    trailRef.current?.setAttribute("stroke-dasharray", `${(len / total).toFixed(4)} 2`);
    if (now - S.hud > 110) {
      S.hud = now;
      const [lng, lat] = unproj(p.x, p.y);
      if (latRef.current) latRef.current.textContent = `${lat.toFixed(3)}° N`;
      if (lngRef.current) lngRef.current.textContent = `${lng.toFixed(3)}° E`;
      if (hdgRef.current) hdgRef.current.textContent = `${String(((Math.round(S.heading) % 360) + 360) % 360).padStart(3, "0")}°`;
    }
  }, []);

  const startMove = useCallback((to: number) => {
    const S = st.current;
    const target = geo.current.lens[to] ?? 0;
    S.from = S.pos;
    S.to = target;
    S.dur = clamp(Math.abs(target - S.pos) / 0.055, 1100, 3800);
    S.t0 = performance.now();
    S.idx = to;
    S.phase = "move";
    setActive(to);
    setMode("transit");
  }, []);

  /** Where each sector sits along the border (arc length), so the drone can fly between them. */
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const lens = sectors.map((s) => {
      let best = 0;
      let bd = Infinity;
      for (let i = 0; i <= 900; i++) {
        const l = (total * i) / 900;
        const p = path.getPointAtLength(l);
        const d = (p.x - s.x) ** 2 + (p.y - s.y) ** 2;
        if (d < bd) {
          bd = d;
          best = l;
        }
      }
      return best;
    });
    geo.current = { total, lens };
    st.current.pos = lens[0];
    place(lens[0], 0, true);
  }, [sectors, place]);

  useEffect(() => {
    const sync = () => {
      run.current = visible && !reduced && !document.hidden;
    };
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [visible, reduced]);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const { lens } = geo.current;
      if (!run.current || !lens.length) return;
      const S = st.current;
      if (S.phase === "move") {
        const k = clamp((now - S.t0) / S.dur);
        S.pos = lerp(S.from, S.to, easeInOutCubic(k));
        if (k >= 1) {
          S.phase = "dwell";
          S.dwellUntil = now + (S.manual ? 7000 : 2600);
          setMode("hold");
        }
      } else if (now >= S.dwellUntil) {
        S.manual = false;
        let n = S.idx + S.dir;
        if (n >= lens.length || n < 0) {
          S.dir *= -1;
          n = S.idx + S.dir;
        }
        startMove(n);
      }
      place(S.pos, now);
    };
    st.current.dwellUntil = performance.now() + 1600;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced, place, startMove]);

  const select = (i: number) => {
    const S = st.current;
    if (reduced || !geo.current.lens.length) {
      const len = geo.current.lens[i] ?? 0;
      S.pos = len;
      S.idx = i;
      place(len, S.hud + 1000, true); // reduced motion: refresh the read-out immediately
      setActive(i);
      return;
    }
    S.manual = true;
    S.dir = i >= sectors.length - 1 ? -1 : i <= 0 ? 1 : S.dir;
    startMove(i);
  };

  // Keep the active chip centred in the mobile row (scrolls the row only, never the page).
  useEffect(() => {
    const row = chipsRef.current;
    const el = row?.children[active] as HTMLElement | undefined;
    if (!row || !el) return;
    row.scrollTo({ left: el.offsetLeft - (row.clientWidth - el.clientWidth) / 2, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const sector = sectors[active];

  return (
    <section className="relative overflow-hidden bg-void py-20 sm:py-28" aria-labelledby="border-title">
      <div className="container-x grid grid-cols-[minmax(0,1fr)] items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-x-14 lg:gap-y-8">
        <div className="lg:col-start-1 lg:row-start-1">
          <p className="eyebrow" data-animate>
            Western frontier · illustrative patrol
          </p>
          <h2 id="border-title" className="mt-5 text-3xl font-semibold leading-[1.05] sm:text-4xl lg:text-5xl" data-animate>
            Eyes on every kilometre of the Pakistan border.
          </h2>
          <p className="mt-5 leading-relaxed text-fg-muted sm:text-lg" data-animate>
            From the marshes of Kutch to the Karakoram, the western border crosses desert, farmland, forest ridge and glacier. ASP platforms are rated to 15,500 ft and configured for the long-endurance surveillance each stretch demands.
          </p>
        </div>

        {/* map */}
        <div ref={frameRef} className="mx-auto w-full max-w-[560px] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-[600px]">
          <div className="hud-corners relative overflow-hidden rounded-3xl border border-line" style={{ background: "var(--map-sea)" }}>
            <svg viewBox={`0 0 ${MAP.width} ${MAP.height}`} className="block h-auto w-full touch-pan-y select-none" role="img" aria-label="Map of India with the Pakistan border highlighted and a drone patrolling it from the Rann of Kutch to Siachen">
              <defs>
                <path id="bw-india" d={indiaPath} fillRule="evenodd" clipRule="evenodd" />
                <clipPath id="bw-india-clip">
                  <use href="#bw-india" />
                </clipPath>
                <pattern id="bw-dots" width="7" height="7" patternUnits="userSpaceOnUse">
                  <circle cx="3.5" cy="3.5" r="0.9" style={{ fill: "var(--map-dot)" }} />
                </pattern>
                <linearGradient id="bw-cone" x1="1" y1="0" x2="0" y2="0">
                  <stop offset="0" stopColor="var(--color-signal)" stopOpacity="0.5" />
                  <stop offset="1" stopColor="var(--color-signal)" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path d={GRATICULE} fill="none" strokeWidth="0.6" style={{ stroke: "var(--map-grid)" }} />
              <path d={neighbourPath} fillRule="evenodd" strokeWidth="0.7" style={{ fill: "var(--map-neighbour)", stroke: "var(--color-line-strong)" }} />
              <use href="#bw-india" style={{ fill: "var(--map-land)", filter: "drop-shadow(0 6px 10px var(--map-shadow))" }} />
              <rect width={MAP.width} height={MAP.height} fill="url(#bw-dots)" clipPath="url(#bw-india-clip)" />
              <use href="#bw-india" fill="none" strokeWidth="1" strokeLinejoin="round" style={{ stroke: "var(--map-land-edge)" }} />

              {MAP_LABELS.map((l) => {
                const [x, y] = proj(l.lng, l.lat);
                return (
                  <text key={l.t} x={x} y={y} textAnchor="middle" fontSize={l.size ?? 9} letterSpacing={l.strong ? 8 : 2.5} className="font-mono" style={{ fill: "var(--color-fg-dim)", opacity: l.strong ? 0.35 : 0.8 }}>
                    {l.t}
                  </text>
                );
              })}

              {/* the border: a soft corridor, the dashed line, and the part already flown */}
              <path d={borderPath} fill="none" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: "var(--color-signal)", opacity: 0.13 }} />
              <path ref={pathRef} d={borderPath} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 5" style={{ stroke: "var(--color-signal)" }} />
              <path ref={trailRef} d={borderPath} pathLength={1} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0 2" style={{ stroke: "var(--color-signal)" }} />

              {sectors.map((s, i) => (
                <g key={s.id} transform={`translate(${s.x} ${s.y})`} onClick={() => select(i)} className="cursor-pointer" data-cursor="Inspect">
                  <circle r="22" fill="transparent" />
                  {i === active && (
                    <circle r="9" fill="none" strokeWidth="1.5" className="animate-pulse-ring" style={{ stroke: "var(--color-signal)", transformBox: "fill-box", transformOrigin: "center" }} />
                  )}
                  <circle r={i === active ? 6 : 4.2} strokeWidth="2" style={{ fill: i === active ? "var(--color-signal)" : "var(--color-ink)", stroke: "var(--color-signal)", transition: "r .3s" }} />
                  {i === active && (
                    <text x="14" y="4.5" fontSize="12" fontWeight="600" className="max-sm:hidden" style={{ fill: "var(--color-fg)", stroke: "var(--color-ink)", strokeWidth: 3.5, paintOrder: "stroke" }}>
                      {s.name.split(" · ")[0]}
                    </text>
                  )}
                </g>
              ))}

              {/* the drone: scan cone toward the border, then the airframe */}
              <g ref={droneRef} transform={`translate(${sectors[0].x} ${sectors[0].y})`} style={{ pointerEvents: "none" }}>
                <g style={{ transformOrigin: "0px 0px", animation: reduced ? undefined : "scan-sweep 3.4s ease-in-out infinite alternate" }}>
                  <path d="M0 0L-92 -34Q-104 0 -92 34Z" fill="url(#bw-cone)" />
                </g>
                <g ref={bodyRef}>
                  <path d="M-9.5 -9.5L9.5 9.5M9.5 -9.5L-9.5 9.5" strokeWidth="2.2" strokeLinecap="round" style={{ stroke: "var(--color-fg)" }} />
                  {[
                    [-9.5, -9.5],
                    [9.5, -9.5],
                    [-9.5, 9.5],
                    [9.5, 9.5],
                  ].map(([x, y]) => (
                    <g key={`${x}${y}`} transform={`translate(${x} ${y})`}>
                      <circle r="5.2" style={{ fill: "var(--color-cyan)", opacity: 0.22 }} />
                      <path d="M-5.2 0H5.2" strokeWidth="1.2" strokeLinecap="round" className="prop-spin" style={{ stroke: "var(--color-cyan)" }} />
                    </g>
                  ))}
                  <circle r="4.4" style={{ fill: "var(--color-fg)" }} />
                  <circle r="2.1" style={{ fill: "var(--color-signal)" }} />
                  <path d="M4.4 0L9 0" strokeWidth="1.6" strokeLinecap="round" style={{ stroke: "var(--color-signal)" }} />
                </g>
              </g>
            </svg>

            {/* live read-out */}
            <div className="glass-solid pointer-events-none absolute bottom-3 left-3 rounded-xl px-3 py-2 sm:bottom-4 sm:left-4">
              <div className="label-mono flex items-center gap-2 text-[10px] text-signal">
                <span className={cn("size-1.5 rounded-full", mode === "transit" ? "animate-blink bg-signal" : "bg-go")} />
                {mode === "transit" ? "En route" : "On station"}
              </div>
              <dl className="mt-1.5 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 font-mono text-[10px] tracking-[0.08em] text-fg-muted tabular">
                <dt className="text-fg-dim">LAT</dt>
                <dd><span ref={latRef}>--</span></dd>
                <dt className="text-fg-dim">LNG</dt>
                <dd><span ref={lngRef}>--</span></dd>
                <dt className="text-fg-dim">HDG</dt>
                <dd><span ref={hdgRef}>---°</span></dd>
              </dl>
            </div>
            <div className="glass-solid pointer-events-none absolute bottom-3 right-3 flex items-center gap-2 rounded-full px-3 py-1.5 sm:bottom-4 sm:right-4">
              <svg width="22" height="6" aria-hidden>
                <path d="M0 3H22" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 5" style={{ stroke: "var(--color-signal)" }} />
              </svg>
              <span className="label-mono text-[10px] text-fg-muted">IB &amp; LoC</span>
            </div>
          </div>

          {/* mobile: sector chips + the active sector */}
          <div className="mt-4 lg:hidden">
            <div ref={chipsRef} className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden" data-lenis-prevent role="tablist" aria-label="Border sectors">
              {sectors.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  onClick={() => select(i)}
                  className={cn(
                    "flex min-h-11 shrink-0 snap-center items-center gap-2 rounded-full border px-4 text-sm transition-colors",
                    i === active ? "border-signal bg-signal/10 text-fg" : "border-line-strong bg-ink/60 text-fg-muted",
                  )}
                >
                  <span className="label-mono text-[10px] text-signal">{String(i + 1).padStart(2, "0")}</span>
                  {s.name.split(" · ")[0]}
                </button>
              ))}
            </div>
            <div className="glass mt-2 rounded-2xl p-4" aria-live="polite">
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-lg font-medium text-fg">{sector.name}</p>
                <span className="chip shrink-0">{sector.terrain}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{sector.detail}</p>
            </div>
          </div>
        </div>

        {/* desktop: sector list */}
        <div className="hidden lg:col-start-1 lg:row-start-2 lg:block">
          <ul className="grid gap-2 sm:grid-cols-2">
            {sectors.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => select(i)}
                  aria-pressed={i === active}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors",
                    i === active ? "border-signal/60 bg-signal/[0.08]" : "border-line hover:border-line-strong",
                  )}
                >
                  <span className="label-mono mt-0.5 text-[10px] text-signal">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-sm font-medium text-fg">{s.name}</span>
                    <span className="mt-0.5 block text-xs leading-snug text-fg-dim">{s.terrain}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="label-mono mt-5 text-fg-dim">Illustrative route · sectors show terrain along the border, not deployments.</p>
        </div>
        <p className="label-mono text-fg-dim lg:hidden">Illustrative route · sectors show terrain along the border, not deployments.</p>
      </div>
    </section>
  );
}
