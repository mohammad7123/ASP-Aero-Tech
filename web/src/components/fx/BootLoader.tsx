"use client";

import { Logo } from "@/components/ui/Logo";
import { useEffect, useRef, useState } from "react";
import { boot } from "@/lib/boot";
import { gsap } from "@/lib/gsap";
import { useClientValue } from "@/lib/hooks";

const STEPS = ["Systems check", "GPS lock", "Ready for takeoff"];
const R = 54;
const C = 2 * Math.PI * R;
const MIN_MS = 1400;
const MAX_MS = 3800;

/**
 * First-visit boot sequence. Server-rendered so it paints before any JS;
 * the inline script in the root layout hides it on repeat visits in the same
 * session and for reduced motion. Progress reflects real readiness — fonts,
 * window load and any boot holds (e.g. the 3D world's first frames) — bounded
 * by MIN_MS / MAX_MS so it never feels stuck.
 */
export function BootLoader({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGCircleElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const steps = useRef<(HTMLLIElement | null)[]>([]);
  const [gone, setGone] = useState(false);
  // Decided before paint by the inline script in the root layout (html.boot-skip).
  const skip = useClientValue(
    () => !enabled || document.documentElement.classList.contains("boot-skip") || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    !enabled,
  );

  useEffect(() => {
    if (skip) {
      boot.finish();
      return;
    }
    try {
      sessionStorage.setItem("asp-booted", "1");
    } catch {
      /* storage unavailable (private mode) — the loader simply shows again next time */
    }

    const t0 = performance.now();
    let shown = 0;
    let raf = 0;
    let exiting = false;
    let fontsReady = false;
    let loaded = document.readyState === "complete";
    document.fonts?.ready.then(() => (fontsReady = true)).catch(() => (fontsReady = true));
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad, { once: true });

    const exit = () => {
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(root.current, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.9, ease: "expo.inOut", delay: 0.2 })
        .add(() => boot.finish(), 0.5);
    };

    const tick = () => {
      const elapsed = performance.now() - t0;
      const readiness = (fontsReady ? 0.3 : 0) + (loaded ? 0.3 : 0) + (boot.pending === 0 ? 0.4 : 0);
      let target = Math.min(elapsed / MIN_MS, 0.12 + readiness * 0.88);
      if (elapsed > MAX_MS) target = 1;
      shown += (target - shown) * 0.09;
      if (target === 1 && shown > 0.994) shown = 1;

      if (ring.current) ring.current.style.strokeDashoffset = String(C * (1 - shown));
      if (pct.current) pct.current.textContent = String(Math.round(shown * 100)).padStart(3, "0");
      const active = shown >= 1 ? 3 : shown > 0.66 ? 2 : shown > 0.33 ? 1 : 0;
      steps.current.forEach((el, i) => {
        if (el) el.dataset.state = i < active ? "done" : i === active ? "active" : "pending";
      });

      if (shown >= 1 && !exiting) {
        exiting = true;
        exit();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
  }, [skip]);

  if (gone || skip) return null;

  return (
    <div
      ref={root}
      className="boot-loader fixed inset-0 z-[120] flex items-center justify-center overflow-hidden bg-void"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      aria-hidden
    >
      <div className="grid-bg grid-fade absolute inset-0" />
      <div className="scanlines absolute inset-0 opacity-60" />

      <div className="relative flex flex-col items-center">
        <div className="relative size-[168px]">
          <svg viewBox="0 0 140 140" className="absolute inset-0 size-full -rotate-90">
            <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-line)" strokeWidth="2" />
            <circle
              ref={ring}
              cx="70"
              cy="70"
              r={R}
              fill="none"
              stroke="var(--color-cyan)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C}
              style={{ filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--color-cyan) 80%, transparent))" }}
            />
          </svg>
          <svg viewBox="0 0 140 140" className="animate-spin-slow absolute inset-0 size-full">
            <circle cx="70" cy="70" r="66" fill="none" stroke="color-mix(in srgb, var(--color-signal) 55%, transparent)" strokeWidth="1" strokeDasharray="2 10" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl tabular-nums text-fg">
              <span ref={pct}>000</span>
              <span className="text-base text-cyan">%</span>
            </span>
            <span className="label-mono mt-1 text-fg-dim">Boot</span>
          </div>
        </div>

        <ul className="mt-8 w-64 space-y-2">
          {STEPS.map((s, i) => (
            <li
              key={s}
              ref={(el) => {
                steps.current[i] = el;
              }}
              data-state={i === 0 ? "active" : "pending"}
              className="group flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-fg-dim transition-colors data-[state=active]:text-cyan data-[state=done]:text-fg-muted"
            >
              <span>
                {s}
                <span className="group-data-[state=active]:animate-blink">…</span>
              </span>
              <span className="text-go opacity-0 transition-opacity group-data-[state=done]:opacity-100">OK</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-6 left-6 hidden items-center gap-3 sm:flex">
        <Logo alt="" width={120} height={41} priority className="h-8 w-auto opacity-90" />
        <span className="label-mono text-fg-dim">Advance System Platform</span>
      </div>
      <span className="label-mono absolute bottom-6 right-6 hidden text-fg-dim sm:block">21.1458° N · 79.0882° E</span>
    </div>
  );
}
