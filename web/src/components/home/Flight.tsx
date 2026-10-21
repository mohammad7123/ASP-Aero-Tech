"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { DroneBlueprint } from "@/components/blueprint/DroneBlueprint";
import { useTier } from "@/components/providers/DeviceTier";
import { anatomyParts } from "@/content/highlights";
import { anatomyLayer } from "@/lib/anatomy";
import { flight, setWorldReady, subscribeWorldReady, type SegmentName } from "@/lib/flight";
import { ScrollTrigger } from "@/lib/gsap";
import { clamp, cn } from "@/lib/utils";

const WorldCanvas = dynamic(() => import("@/components/three/world/WorldCanvas"), { ssr: false });

/**
 * Wraps the hero + journey sections. Measures each [data-flight-segment]
 * child, publishes scroll progress to the 3D scene, and tells the scene to
 * pause once the visitor has scrolled past.
 */
export function FlightExperience({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    flight.progress = 0;
    flight.active = true;

    const measure = () => {
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.querySelectorAll<HTMLElement>("[data-flight-segment]").forEach((seg) => {
        const name = seg.dataset.flightSegment as SegmentName;
        const start = seg.getBoundingClientRect().top + window.scrollY - top;
        flight.segments[name] = [clamp(start / total), clamp((start + seg.offsetHeight) / total)];
      });
    };

    const progress = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        flight.progress = self.progress;
      },
      onRefresh: (self) => {
        measure();
        flight.progress = self.progress;
      },
    });

    // Pause the scene once the flight wrapper has completely left the viewport.
    const activity = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        flight.active = self.isActive;
        window.dispatchEvent(new Event("flight:active"));
      },
    });

    const onPointer = (e: PointerEvent) => {
      flight.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      flight.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    measure();

    return () => {
      progress.kill();
      activity.kill();
      window.removeEventListener("pointermove", onPointer);
      flight.active = false;
      window.dispatchEvent(new Event("flight:active"));
    };
  }, []);

  return (
    <div id="flight" ref={ref} className="relative">
      {children}
    </div>
  );
}

/**
 * Fixed backdrop behind the flight sections: the WebGL world on capable
 * devices, a lightweight CSS backdrop otherwise. The canvas fades in once its
 * shaders are compiled and the first frames have rendered.
 */
export function WorldStage() {
  const tier = useTier();
  const [ready, setReady] = useState(false);

  // The world mounts in the deferred window (after load/idle or first
  // interaction — see DeviceTierProvider), so the intro never waits for it;
  // the hero's blueprint stands in until the first frames render.
  useEffect(() => () => setWorldReady(false), []);

  const onReady = useCallback(() => {
    setReady(true);
    setWorldReady(true);
  }, []);

  const webgl = tier === "high" || tier === "low";

  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,var(--stage-1)_0%,var(--stage-2)_45%,var(--stage-3)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_120%,var(--stage-glow),transparent_55%)]" />
      <div className="grid-bg grid-fade absolute inset-0 opacity-60" />
      {webgl && (
        <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
          <WorldCanvas tier={tier} onReady={onReady} />
          <AnatomyLabels />
        </div>
      )}
    </div>
  );
}

const LABEL_SIDE: Record<string, "left" | "right"> = { canopy: "left", fc: "right", battery: "left", motors: "right", gimbal: "left", gps: "right" };

/** DOM labels for the exploded view; positioned every frame by the 3D scene (lib/anatomy.ts). */
function AnatomyLabels() {
  return (
    <div
      ref={(el) => {
        anatomyLayer.current = el;
      }}
      className="absolute inset-0 overflow-hidden"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      {anatomyParts.map((p) => {
        const left = LABEL_SIDE[p.key] === "left";
        return (
          <div key={p.key} data-part={p.key} className="group absolute left-0 top-0 will-change-transform">
            {/* data-flip (set by the scene when there's no room on the left) points the label right instead */}
            <div
              className={cn(
                "flex -translate-y-1/2 items-center gap-2 whitespace-nowrap",
                left && "-translate-x-full flex-row-reverse group-data-[flip=1]:translate-x-0 group-data-[flip=1]:flex-row",
              )}
            >
              <span className="block size-2 rounded-full bg-cyan shadow-[0_0_12px_2px_rgba(43,217,255,0.8)]" />
              <span className={cn("block h-px w-10 from-cyan to-cyan/20", left ? "bg-gradient-to-l" : "bg-gradient-to-r")} />
              <span className="glass-solid rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg">{p.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Renders children only for the static (non-WebGL) tier — e.g. SVG fallbacks. */
export function StaticOnly({ children, className }: { children: ReactNode; className?: string }) {
  const tier = useTier();
  if (tier !== "static") return null;
  return <div className={className}>{children}</div>;
}

/**
 * Hero visual while the 3D world is unavailable: the blueprint quad. It is in
 * the server HTML (so the hero is never empty), stays for the static tier, and
 * cross-fades out once the WebGL drone has rendered (shader compilation can
 * take a few seconds on a cold GPU cache).
 */
export function HeroFallbackVisual() {
  const tier = useTier();
  const worldReady = useSyncExternalStore(subscribeWorldReady, () => flight.ready, () => false);
  const hide = tier !== "static" && tier !== "pending" && worldReady;
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] items-center justify-center transition-[opacity,transform] duration-500 lg:flex",
        hide ? "scale-95 opacity-0" : "opacity-100",
      )}
      aria-hidden={hide || undefined}
    >
      <div className={cn("w-full max-w-[640px]", !hide && "animate-float")}>
        <DroneBlueprint preset="hero-quad" animated={!hide} title="ASP Aero Tech quadcopter schematic" />
      </div>
    </div>
  );
}
