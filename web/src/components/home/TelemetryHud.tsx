"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/device";
import { fmt, LOG_LINES, sampleTelemetry } from "@/lib/telemetry";
import { cn } from "@/lib/utils";

/**
 * Decorative "mission control" dashboard. All values are simulated and
 * written straight to the DOM through refs ~10× per second — no React
 * re-renders — and the loop pauses whenever the panel is off-screen.
 */
export function TelemetryHud({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (k: string) => el.querySelector<HTMLElement>(`[data-t="${k}"]`);
    const refs = {
      alt: q("alt"),
      spd: q("spd"),
      hdg: q("hdg"),
      vs: q("vs"),
      bat: q("bat"),
      batBar: q("batBar"),
      volts: q("volts"),
      sats: q("sats"),
      lat: q("lat"),
      lng: q("lng"),
      rssi: q("rssi"),
      clock: q("clock"),
      horizon: q("horizon"),
      tape: q("tape"),
      log: q("log"),
    };
    const bars = Array.from(el.querySelectorAll<HTMLElement>("[data-bar]"));
    const t0 = performance.now() - 754_000; // mission already 12+ minutes in
    let raf = 0;
    let last = 0;
    let logIndex = 0;
    let lastLog = 0;
    let visible = false;

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      const s = sampleTelemetry(t);
      if (refs.alt) refs.alt.textContent = s.alt.toFixed(1);
      if (refs.spd) refs.spd.textContent = s.spd.toFixed(0);
      if (refs.hdg) refs.hdg.textContent = String(Math.round(s.hdg)).padStart(3, "0");
      if (refs.vs) refs.vs.textContent = `${s.vs >= 0 ? "+" : "−"}${Math.abs(s.vs).toFixed(1)}`;
      if (refs.bat) refs.bat.textContent = s.bat.toFixed(0);
      if (refs.batBar) refs.batBar.style.transform = `scaleX(${(s.bat / 100).toFixed(3)})`;
      if (refs.volts) refs.volts.textContent = s.volts.toFixed(1);
      if (refs.sats) refs.sats.textContent = `${s.sats}`;
      if (refs.lat) refs.lat.textContent = fmt.coord(s.lat, "N", "S");
      if (refs.lng) refs.lng.textContent = fmt.coord(s.lng, "E", "W");
      if (refs.rssi) refs.rssi.textContent = s.rssi.toFixed(0);
      if (refs.clock) refs.clock.textContent = `T+${fmt.clock(t)}`;
      if (refs.horizon) refs.horizon.style.transform = `rotate(${(-s.roll).toFixed(2)}deg) translateY(${(s.pitch * 2.2).toFixed(2)}px)`;
      if (refs.tape) refs.tape.style.transform = `translateX(${(-(s.hdg % 30) * 4).toFixed(1)}px)`;
      bars.forEach((b, i) => (b.style.opacity = i < s.bars ? "1" : "0.18"));
      if (refs.log && now - lastLog > 2400) {
        lastLog = now;
        logIndex = (logIndex + 1) % LOG_LINES.length;
        const line = document.createElement("li");
        line.textContent = `› ${LOG_LINES[logIndex]}`;
        refs.log.prepend(line);
        while (refs.log.children.length > 3) refs.log.lastElementChild?.remove();
      }
    };

    const loop = (now: number) => {
      if (now - last > 100) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };

    draw(performance.now());
    if (prefersReducedMotion()) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && visible) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className={cn("glass-strong hud-corners rounded-2xl p-4 font-mono text-[11px] text-fg-muted sm:p-5", className)}>
      <p className="sr-only">Decorative, simulated telemetry display.</p>
      <div aria-hidden>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <span className="label-mono text-cyan">Mission control · live feed</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-alert">
              <span className="animate-blink size-1.5 rounded-full bg-alert" /> REC
            </span>
            <span data-t="clock" className="tabular text-fg">T+12:34</span>
          </span>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 py-4">
          {/* artificial horizon */}
          <div className="relative size-32 overflow-hidden rounded-full border border-line-strong sm:size-36">
            <div data-t="horizon" className="absolute -inset-1/2 will-change-transform">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0b3d6e] to-[#1c6aa8]" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-[#5a3a1c] to-[#2e1d0e]" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-fg/80" />
              {[-20, -10, 10, 20].map((p) => (
                <div key={p} className="absolute left-1/2 h-px -translate-x-1/2 bg-fg/50" style={{ top: `calc(50% + ${p * 2.2}px)`, width: Math.abs(p) === 10 ? 28 : 44 }} />
              ))}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <svg viewBox="0 0 60 20" className="w-16 text-signal" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 10 H22 L26 14 L30 10 L34 14 L38 10 H58" />
              </svg>
            </div>
          </div>
          <dl className="grid grid-cols-2 content-center gap-x-4 gap-y-3">
            {[
              ["ALT", "alt", "m AGL"],
              ["SPD", "spd", "km/h"],
              ["HDG", "hdg", "°"],
              ["V/S", "vs", "m/s"],
            ].map(([k, key, unit]) => (
              <div key={key}>
                <dt className="text-[10px] tracking-[0.2em] text-fg-dim">{k}</dt>
                <dd className="mt-0.5 text-lg text-fg">
                  <span data-t={key} className="tabular">
                    0
                  </span>
                  <span className="ml-1 text-[10px] text-fg-dim">{unit}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* heading tape */}
        <div className="relative h-8 overflow-hidden border-y border-line mask-fade-x">
          <div data-t="tape" className="absolute inset-y-0 left-[-120px] flex items-end will-change-transform">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex w-[120px] items-end justify-between">
                {Array.from({ length: 6 }, (_, j) => (
                  <span key={j} className={cn("w-px bg-fg/40", j === 0 ? "h-4" : "h-2")} />
                ))}
              </div>
            ))}
          </div>
          <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-signal" />
        </div>

        <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] text-fg-dim">BATTERY</p>
            <p className="mt-1 text-fg">
              <span data-t="bat" className="tabular">
                92
              </span>
              % · <span data-t="volts">22.7</span> V
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/10">
              <div data-t="batBar" className="h-full origin-left rounded-full bg-gradient-to-r from-go to-cyan" />
            </div>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] text-fg-dim">DATALINK</p>
            <div className="mt-1 flex items-end gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span key={i} data-bar className="w-1.5 rounded-sm bg-cyan" style={{ height: 6 + i * 4 }} />
              ))}
              <span className="ml-2 text-fg">
                <span data-t="rssi">-61</span> dBm
              </span>
            </div>
            <p className="mt-1 text-go">Encrypted</p>
          </div>
          <div>
            <p className="text-[10px] tracking-[0.2em] text-fg-dim">GNSS · <span data-t="sats">17</span> SAT</p>
            <p className="mt-1 text-fg" data-t="lat">
              21.14580° N
            </p>
            <p className="text-fg" data-t="lng">
              79.08820° E
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[auto_1fr] items-center gap-4 border-t border-line pt-4">
          <div className="relative size-20 rounded-full border border-line-strong">
            <div className="absolute inset-2 rounded-full border border-line" />
            <div className="absolute inset-5 rounded-full border border-line" />
            <div className="animate-radar absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,var(--hud-sweep),transparent_28%)]" />
            <span className="absolute left-[62%] top-[30%] size-1.5 animate-pulse rounded-full bg-signal" />
            <span className="absolute left-[30%] top-[58%] size-1 animate-pulse rounded-full bg-cyan" />
          </div>
          <ol data-t="log" className="space-y-1 text-fg-muted [&>li:first-child]:text-cyan">
            <li>› Datalink encrypted · OK</li>
            <li>› Gimbal stabilised · OK</li>
            <li>› WP-03 acquired</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/** Compact telemetry ticker for the hero. */
export function HeroTelemetry({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const q = (k: string) => el.querySelector<HTMLElement>(`[data-t="${k}"]`);
    const r = { alt: q("alt"), spd: q("spd"), hdg: q("hdg"), sats: q("sats"), coords: q("coords") };
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    const draw = (now: number) => {
      const s = sampleTelemetry((now - t0) / 1000);
      if (r.alt) r.alt.textContent = (s.alt / 40).toFixed(1); // hovering over the pad
      if (r.spd) r.spd.textContent = (s.spd / 30).toFixed(1);
      if (r.hdg) r.hdg.textContent = String(Math.round(s.hdg)).padStart(3, "0");
      if (r.sats) r.sats.textContent = String(s.sats);
      if (r.coords) r.coords.textContent = `${fmt.coord(s.lat, "N", "S")} · ${fmt.coord(s.lng, "E", "W")}`;
    };
    const loop = (now: number) => {
      if (now - last > 120) {
        last = now;
        draw(now);
      }
      raf = requestAnimationFrame(loop);
    };
    draw(performance.now());
    if (!prefersReducedMotion()) raf = requestAnimationFrame(loop);
    const onScroll = () => {
      // stop updating once the hero is out of view, resume when it's back
      if (window.scrollY > window.innerHeight * 1.2) {
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else if (!raf && !prefersReducedMotion()) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const cell = "flex flex-col gap-1 px-4 first:pl-0";
  return (
    <div ref={root} className={cn("label-mono flex flex-wrap items-center divide-x divide-line text-fg-dim", className)} aria-hidden>
      <div className={cell}>
        ALT <span className="text-sm text-fg"><span data-t="alt" className="tabular">3.0</span> m</span>
      </div>
      <div className={cell}>
        GS <span className="text-sm text-fg"><span data-t="spd" className="tabular">1.8</span> m/s</span>
      </div>
      <div className={cell}>
        HDG <span className="text-sm text-fg"><span data-t="hdg" className="tabular">273</span>°</span>
      </div>
      <div className={cn(cell, "hidden sm:flex")}>
        GNSS <span className="text-sm text-fg"><span data-t="sats">17</span> sat · 3D fix</span>
      </div>
      <div className={cn(cell, "hidden xl:flex")}>
        POS <span data-t="coords" className="text-sm text-fg">21.14580° N · 79.08820° E</span>
      </div>
    </div>
  );
}
