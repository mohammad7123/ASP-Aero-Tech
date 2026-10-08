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
    },
    city: { base: "#0e1828", windows: 1 },
    cloud: "#405578",
    dust: "#a8e6ff",
    padDisc: "#09121f",
  },
  light: {
    clear: "#e3effa",
    fog: "#d7e8f7",
    skyZenith: "#6aa5de",
    skyHorizon: "#e6f1fb",
    skyGlow: "#ffd7a0",
    glowStrength: 0.55,
    hemi: ["#ffffff", "#8fa57d", 1.05] as const,
    sun: ["#fff1da", 2.1] as const,
    env: 0.95,
    rig: 0.22,
    terrain: {
      water: "#6fb0d8",
      fields: ["#86b45c", "#93bd63", "#a7c06a", "#9dbb73", "#78ad6a"],
      grass: "#86ad6b",
      rock: "#a89c88",
      rockHigh: "#c9c2b6",
      snow: "#ffffff",
      asphalt: "#8a94a1",
      pad: "#c4ccd6",
      sun: "#fff0d6",
      ambient: "#b4c0d1",
      line: "#1c5a82",
      lineMix: 1,
    },
    city: { base: "#c7d1de", windows: 0 },
    cloud: "#ffffff",
    dust: "#6f93b8",
    padDisc: "#cdd6e1",
  },
} as const;

export type WorldTheme = (typeof WORLD)["dark"] | (typeof WORLD)["light"];
export const worldTheme = (light: boolean): WorldTheme => (light ? WORLD.light : WORLD.dark);
