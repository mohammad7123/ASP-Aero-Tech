/**
 * Shared, mutable state that links DOM scroll (GSAP ScrollTrigger) to the
 * React Three Fiber scene without React re-renders. ScrollTrigger writes,
 * `useFrame` reads every frame and applies its own damping.
 */
export type SegmentName = "hero" | "about" | "anatomy" | "control";

export const flight = {
  /** 0 → 1 across the whole #flight wrapper (hero + journey sections). */
  progress: 0,
  /** Start/end of each section in `progress` units, measured on refresh. */
  segments: {
    hero: [0, 0.14],
    about: [0.14, 0.36],
    anatomy: [0.36, 0.78],
    control: [0.78, 1],
  } as Record<SegmentName, [number, number]>,
  /** False once the visitor has scrolled past the journey; the scene pauses. */
  active: true,
  /** Pointer position normalised to −1…1 (desktop parallax). */
  pointer: { x: 0, y: 0 },
  /** True once the WebGL world has rendered its first frames. */
  ready: false,
};

/** Publishes world readiness (the hero swaps its SVG placeholder for the 3D drone). */
export function setWorldReady(ready: boolean) {
  if (flight.ready === ready) return;
  flight.ready = ready;
  window.dispatchEvent(new Event("flight:ready"));
}

export function subscribeWorldReady(onChange: () => void) {
  window.addEventListener("flight:ready", onChange);
  return () => window.removeEventListener("flight:ready", onChange);
}

/** Local 0 → 1 progress inside a segment for a given global progress. */
export function segmentProgress(name: SegmentName, p: number) {
  const [a, b] = flight.segments[name];
  return Math.min(1, Math.max(0, (p - a) / (b - a || 1)));
}
