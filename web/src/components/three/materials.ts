"use client";

import * as THREE from "three";
import { createContext, useContext } from "react";

/* ───────────────────────────── procedural textures ───────────────────────────── */

let camoTex: THREE.CanvasTexture | null = null;
/** Digital camouflage, generated once on a 2D canvas (no network fetch). */
export function camoTexture() {
  if (camoTex) return camoTex;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const palette = ["#3f4a33", "#59613f", "#2c3326", "#6f6a4b", "#232a20"];
  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, size, size);
  const cell = 8;
  // seeded PRNG so the pattern is stable between renders
  let seed = 7;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 900; i++) {
    const w = (1 + Math.floor(rand() * 4)) * cell;
    const h = (1 + Math.floor(rand() * 3)) * cell;
    const x = Math.floor((rand() * size) / cell) * cell;
    const y = Math.floor((rand() * size) / cell) * cell;
    ctx.fillStyle = palette[1 + Math.floor(rand() * (palette.length - 1))];
    ctx.fillRect(x, y, w, h);
    ctx.fillRect(x - size, y, w, h);
    ctx.fillRect(x, y - size, w, h);
  }
  camoTex = new THREE.CanvasTexture(canvas);
  camoTex.colorSpace = THREE.SRGBColorSpace;
  camoTex.wrapS = camoTex.wrapT = THREE.RepeatWrapping;
  camoTex.magFilter = THREE.NearestFilter;
  camoTex.repeat.set(1.5, 1.5);
  return camoTex;
}

let glowTex: THREE.CanvasTexture | null = null;
/** Soft radial falloff used for LED halos, particles and light glows. */
export function glowTexture() {
  if (glowTex) return glowTex;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.55)");
  g.addColorStop(0.5, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowTex = new THREE.CanvasTexture(canvas);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

let cloudTex: THREE.CanvasTexture | null = null;
/** Billowy cloud puff built from overlapping radial blobs. */
export function cloudTexture() {
  if (cloudTex) return cloudTex;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  let seed = 11;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 22; i++) {
    const r = 30 + rand() * 60;
    const x = size / 2 + (rand() - 0.5) * 120;
    const y = size / 2 + (rand() - 0.5) * 60;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  cloudTex = new THREE.CanvasTexture(canvas);
  cloudTex.colorSpace = THREE.SRGBColorSpace;
  return cloudTex;
}

let carbonTex: THREE.CanvasTexture | null = null;
/** 2×2 twill carbon-fibre weave (light/dark tows), tiled along arms and plates. */
export function carbonTexture() {
  if (carbonTex) return carbonTex;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cell = size / 8;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      // twill: the over/under pattern shifts one tow per row
      const over = (x + y) % 4 < 2;
      const g = over ? ctx.createLinearGradient(x * cell, 0, (x + 1) * cell, 0) : ctx.createLinearGradient(0, y * cell, 0, (y + 1) * cell);
      g.addColorStop(0, over ? "#1b2027" : "#0d1014");
      g.addColorStop(0.5, over ? "#3a424d" : "#232930");
      g.addColorStop(1, over ? "#1b2027" : "#0d1014");
      ctx.fillStyle = g;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  carbonTex = new THREE.CanvasTexture(canvas);
  carbonTex.colorSpace = THREE.SRGBColorSpace;
  carbonTex.wrapS = carbonTex.wrapT = THREE.RepeatWrapping;
  carbonTex.repeat.set(3, 1);
  carbonTex.anisotropy = 4;
  return carbonTex;
}

let brushedTex: THREE.CanvasTexture | null = null;
/** Fine lathe-turned streaks for machined metal (motor bells). Used as a roughness map. */
export function brushedTexture() {
  if (brushedTex) return brushedTex;
  const w = 256;
  const h = 32;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  let seed = 23;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  ctx.fillStyle = "#7a7a7a";
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const v = 90 + Math.floor(rand() * 90);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, w, 1);
  }
  brushedTex = new THREE.CanvasTexture(canvas);
  brushedTex.wrapS = brushedTex.wrapT = THREE.RepeatWrapping;
  return brushedTex;
}

let blurTex: THREE.CanvasTexture | null = null;
/**
 * Spinning-rotor disc as a camera sees it: a faint translucent disc, two
 * swept blade "ghosts" and a brighter tip ring. Rotated with the hub.
 */
export function propBlurTexture() {
  if (blurTex) return blurTex;
  const size = 256;
  const c = size / 2;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // base disc, clear near the hub
  const disc = ctx.createRadialGradient(c, c, c * 0.12, c, c, c);
  disc.addColorStop(0, "rgba(255,255,255,0)");
  disc.addColorStop(0.3, "rgba(255,255,255,0.10)");
  disc.addColorStop(0.9, "rgba(255,255,255,0.16)");
  disc.addColorStop(0.97, "rgba(255,255,255,0.42)");
  disc.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = disc;
  ctx.fillRect(0, 0, size, size);
  // blade ghosts: sharp leading edge, long trailing smear
  if (typeof ctx.createConicGradient === "function") {
    for (const start of [0, Math.PI]) {
      const g = ctx.createConicGradient(start, c, c);
      g.addColorStop(0, "rgba(255,255,255,0.32)");
      g.addColorStop(0.16, "rgba(255,255,255,0.05)");
      g.addColorStop(0.5, "rgba(255,255,255,0)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.beginPath();
      ctx.arc(c, c, c * 0.96, 0, Math.PI * 2);
      ctx.arc(c, c, c * 0.14, 0, Math.PI * 2, true);
      ctx.clip();
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      ctx.restore();
    }
  }
  blurTex = new THREE.CanvasTexture(canvas);
  blurTex.colorSpace = THREE.SRGBColorSpace;
  return blurTex;
}

/* ───────────────────────────── material sets ───────────────────────────── */

export function createMaterialSet(opts: { clippingPlanes?: THREE.Plane[] } = {}) {
  const clip = opts.clippingPlanes?.length ? { clippingPlanes: opts.clippingPlanes, clipShadows: true } : {};
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ ...p, ...clip });
  // Clear-coated paint/composite: a glossy lacquer over the base (crisp studio highlights).
  const coat = (p: THREE.MeshPhysicalMaterialParameters) => new THREE.MeshPhysicalMaterial({ clearcoat: 1, clearcoatRoughness: 0.14, ...p, ...clip });
  const basic = (p: THREE.MeshBasicMaterialParameters) => new THREE.MeshBasicMaterial({ ...p, ...clip });
  // HDR emissive (> 1) so the bloom pass picks LEDs and light strips up; also reads as "lit" without it.
  const led = (hex: string, k = 2.2) => basic({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

  return {
    shell: coat({ color: "#d9e0ea", roughness: 0.32, metalness: 0.1, envMapIntensity: 1.1 }),
    shellDark: coat({ color: "#2b333e", roughness: 0.42, metalness: 0.3 }),
    /** Hero airframe: graphite composite with a lacquer coat. */
    tactical: coat({ color: "#3b434e", roughness: 0.42, metalness: 0.35, clearcoatRoughness: 0.1, envMapIntensity: 1.25 }),
    navy: std({ color: "#1d2c44", roughness: 0.38, metalness: 0.25 }),
    carbon: coat({ map: carbonTexture(), color: "#ffffff", roughness: 0.5, metalness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.18, envMapIntensity: 0.8 }),
    metal: std({ color: "#b4bfcc", roughness: 0.24, metalness: 0.95, roughnessMap: brushedTexture() }),
    motor: std({ color: "#20262e", roughness: 0.3, metalness: 0.85, roughnessMap: brushedTexture() }),
    accent: coat({ color: "#f47e20", roughness: 0.32, metalness: 0.15, clearcoatRoughness: 0.08 }),
    olive: std({ color: "#4f5836", roughness: 0.66, metalness: 0.08 }),
    graphite: std({ color: "#3b424c", roughness: 0.42, metalness: 0.35 }),
    white: std({ color: "#eef2f6", roughness: 0.4, metalness: 0.05 }),
    black: std({ color: "#0c0e11", roughness: 0.35, metalness: 0.5 }),
    lens: std({ color: "#05080c", roughness: 0.03, metalness: 1, envMapIntensity: 2 }),
    pcb: std({ color: "#0d4031", roughness: 0.55, metalness: 0.25 }),
    chip: std({ color: "#0b0d10", roughness: 0.38, metalness: 0.5 }),
    battery: std({ color: "#222932", roughness: 0.5, metalness: 0.3 }),
    rubber: std({ color: "#0e1013", roughness: 0.9, metalness: 0 }),
    camo: std({ map: camoTexture(), roughness: 0.62, metalness: 0.1 }),
    tether: std({ color: "#ffb547", roughness: 0.55, emissive: new THREE.Color("#4a2a00") }),
    spool: std({ color: "#101318", roughness: 0.75, metalness: 0.15 }),
    fiber: basic({ color: "#7ee8ff", transparent: true, opacity: 0.75 }),
    prop: std({ color: "#1b2027", roughness: 0.45, metalness: 0.2 }),
    propBlur: basic({ map: propBlurTexture(), color: "#dfe7f0", transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }),
    ledCyan: led("#2bd9ff"),
    ledRed: led("#ff3b3b"),
    ledGreen: led("#3ddc84", 2),
    ledWhite: led("#ffffff", 1.6),
    ledOrange: led("#ff8a2a"),
    halo: new THREE.SpriteMaterial({ map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, ...clip }),
  };
}

export type MaterialSet = ReturnType<typeof createMaterialSet>;

let defaultSet: MaterialSet | null = null;
export const getDefaultMaterials = () => (defaultSet ??= createMaterialSet());

const MaterialContext = createContext<MaterialSet | null>(null);
export const MaterialProvider = MaterialContext.Provider;
export const useMats = () => useContext(MaterialContext) ?? getDefaultMaterials();

/** Clipping planes for loaded GLB models (the product viewer's scan transition). */
const ClipContext = createContext<THREE.Plane[] | null>(null);
export const ClipProvider = ClipContext.Provider;
export const useClipPlanes = () => useContext(ClipContext);

/** Shared mutable values a model reads every frame (no React re-renders). */
export type DriveRefs = {
  /** 0 = idle props, 1 = hover/cruise spin. */
  spin: { current: number };
  /** 0 = assembled, 1 = fully exploded (only models that support it). */
  explode: { current: number };
};

const DriveContext = createContext<DriveRefs>({ spin: { current: 1 }, explode: { current: 0 } });
export const DriveProvider = DriveContext.Provider;
export const useDrive = () => useContext(DriveContext);
