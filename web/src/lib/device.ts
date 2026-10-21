/**
 * Graphics tier detection (client only).
 *
 *  high   — full scene: volumetrics, dense particles, labels, DPR up to 2
 *  low    — phones / modest GPUs: simplified scene, DPR 1–1.5
 *  static — no WebGL: SVG/CSS fallback. Used for prefers-reduced-motion,
 *           Save-Data, missing WebGL, software renderers (SwiftShader,
 *           llvmpipe, Microsoft Basic Render) and very low-memory devices.
 *
 * The WebGL part of the decision is deferred until after load (see
 * DeviceTierProvider), so detection never blocks hydration.
 *
 * Override for testing with ?gfx=high|low|static.
 */
export type Tier = "high" | "low" | "static";

type NavigatorExtras = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

let cached: { tier: Tier; reason: string } | null = null;

/**
 * Cheap checks only (no WebGL) — safe to run during hydration. A capable
 * result is provisional until `probeWebGL()` confirms hardware rendering.
 */
export function detectTier(): { tier: Tier; reason: string } {
  if (cached) return cached;
  cached = computeTier();
  return cached;
}

function computeTier(): { tier: Tier; reason: string } {
  if (typeof window === "undefined") return { tier: "static", reason: "server" };

  const override = new URLSearchParams(window.location.search).get("gfx");
  if (override === "high" || override === "low" || override === "static") return { tier: override, reason: "override" };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return { tier: "static", reason: "reduced-motion" };

  const nav = navigator as NavigatorExtras;
  if (nav.connection?.saveData) return { tier: "static", reason: "save-data" };
  if (nav.connection?.effectiveType && /(^|-)2g$/.test(nav.connection.effectiveType)) return { tier: "static", reason: "slow-network" };

  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return { tier: "static", reason: "low-end-device" };

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.innerWidth < 768;
  if (coarse || narrow || memory <= 4 || cores <= 4) return { tier: "low", reason: coarse ? "touch-device" : "modest-device" };

  return { tier: "high", reason: "capable" };
}

let probe: boolean | null = null;

/**
 * True when WebGL is available on real hardware. Creating a throwaway context
 * costs ~65–250 ms, so it runs once, lazily, in the deferred window (see
 * useHeavyReady) rather than during hydration. Software renderers
 * (SwiftShader, llvmpipe, Microsoft Basic Render) count as unavailable.
 */
export function probeWebGL(): boolean {
  if (probe !== null) return probe;
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("gfx") === "high") return (probe = true);
  const renderer = readRenderer();
  probe = renderer !== null && !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  return probe;
}

function readRenderer(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") || canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return null;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return null;
  }
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
