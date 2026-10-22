import * as THREE from "three";

/**
 * Per-theme colours and blending for the flight world. The night look is
 * built on additive glows; in daylight additive light washes out against the
 * bright sky, so the light theme uses darker inks with normal blending.
 */
export const blendFor = (light: boolean) => (light ? THREE.NormalBlending : THREE.AdditiveBlending);

export const accent = (light: boolean) => ({
  cyan: new THREE.Color(light ? "#0a6c9a" : "#2bd9ff"),
  signal: new THREE.Color(light ? "#e0640a" : "#f47e20"),
  /** HDR-ish multiplier that makes emissive things pop at night. */
  boost: light ? 1 : 1.5,
});

export const WORLD = {
  dark: {
    clear: "#040a15",
    fog: "#0a1d38",
    skyZenith: "#02050c",
    skyHorizon: "#0b2240",
    skyGlow: "#ff8a3c",
    glowStrength: 1,
    hemi: ["#5b7bb0", "#0a0f18", 0.55] as const,
    sun: ["#cfe3ff", 1.4] as const,
    env: 0.55,
    rig: 1,
    terrain: {
      water: "#0b2a42",
      fields: ["#173322", "#1d3b23", "#26381c", "#2c3522", "#1a2e28"],
      grass: "#1a2c25",
      rock: "#2b3446",
      rockHigh: "#46536b",
      snow: "#9fb3cf",
      asphalt: "#111a28",
      pad: "#0d1625",
      sun: "#a9c4ee",
      ambient: "#2a3a58",
      line: "#2bd9ff",
      lineMix: 0,
      /** Strength of contour/grid lines, and how far shading is smoothed from faceted (0) to smooth (1). */
      lineK: 1,
      smooth: 0.3,
    },
    city: { base: "#0e1828", windows: 1 },
    cloud: "#405578",
    dust: "#a8e6ff",
    padDisc: "#09121f",
  },
  // Golden-hour daylight: vivid blue zenith warming to a peach horizon, lush
  // greens with warm sunlit faces and cool shadows, light haze only far out.
  light: {
    clear: "#eaf3fc",
    fog: "#e6eef7",
    skyZenith: "#2f7fd6",
    skyHorizon: "#fde6cf",
    skyGlow: "#ffae5c",
    glowStrength: 1.15,
    hemi: ["#f2f8ff", "#7ea468", 0.95] as const,
    sun: ["#ffe7c2", 2.4] as const,
    env: 0.95,
    rig: 0.22,
    terrain: {
      // natural, slightly desaturated greens and warm earth (not "game map" saturation)
      water: "#3f86b8",
      fields: ["#7d9f57", "#8fab5f", "#a3b26a", "#6f955b", "#98ab66"],
      grass: "#789b5c",
      rock: "#a39581",
      rockHigh: "#cfc6b6",
      snow: "#ffffff",
      asphalt: "#8a94a1",
      pad: "#c9d2dc",
      sun: "#ffe2b8",
      ambient: "#90a3ba",
      line: "#1c5a82",
      lineMix: 1,
      lineK: 0.38,
      smooth: 0.62,
    },
    city: { base: "#c7d1de", windows: 0 },
    cloud: "#ffffff",
    dust: "#d9963f",
    padDisc: "#cdd6e1",
  },
} as const;

export type WorldTheme = (typeof WORLD)["dark"] | (typeof WORLD)["light"];
export const worldTheme = (light: boolean): WorldTheme => (light ? WORLD.light : WORLD.dark);
