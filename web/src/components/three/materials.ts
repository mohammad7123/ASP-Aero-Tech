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

/* ───────────────────────────── material sets ───────────────────────────── */

export function createMaterialSet(opts: { clippingPlanes?: THREE.Plane[] } = {}) {
  const clip = opts.clippingPlanes?.length ? { clippingPlanes: opts.clippingPlanes, clipShadows: true } : {};
  const std = (p: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial({ ...p, ...clip });
  const basic = (p: THREE.MeshBasicMaterialParameters) => new THREE.MeshBasicMaterial({ ...p, ...clip });
  const led = (hex: string, k = 2.2) => basic({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: false });

  return {
    shell: std({ color: "#d9e0ea", roughness: 0.3, metalness: 0.12, envMapIntensity: 1.1 }),
    shellDark: std({ color: "#2b333e", roughness: 0.42, metalness: 0.3 }),
    navy: std({ color: "#1d2c44", roughness: 0.38, metalness: 0.25 }),
    carbon: std({ color: "#161c24", roughness: 0.62, metalness: 0.25, envMapIntensity: 0.5 }),
    metal: std({ color: "#a3afbe", roughness: 0.22, metalness: 0.95 }),
    motor: std({ color: "#1d232b", roughness: 0.32, metalness: 0.8 }),
    accent: std({ color: "#f47e20", roughness: 0.38, metalness: 0.25 }),
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
    propBlur: basic({ color: "#cfd8e3", transparent: true, opacity: 0.07, depthWrite: false, side: THREE.DoubleSide }),
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
