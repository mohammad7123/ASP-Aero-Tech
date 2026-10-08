import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Memoised geometry factories. Drone models reuse the same primitives many
 * times (motors, arms, legs), so caching keeps GPU uploads and memory low.
 */
const cache = new Map<string, THREE.BufferGeometry>();
function memo<T extends THREE.BufferGeometry>(key: string, make: () => T): T {
  let g = cache.get(key) as T | undefined;
  if (!g) {
    g = make();
    cache.set(key, g);
  }
  return g;
}

const k = (...n: number[]) => n.map((v) => v.toFixed(3)).join(":");

export const G = {
  box: (w: number, h: number, d: number) => memo(`box:${k(w, h, d)}`, () => new THREE.BoxGeometry(w, h, d)),
  rbox: (w: number, h: number, d: number, r = 0.03, s = 3) =>
    memo(`rbox:${k(w, h, d, r, s)}`, () => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2, h / 2, d / 2))),
  cyl: (rt: number, rb: number, h: number, seg = 24, open = false) =>
    memo(`cyl:${k(rt, rb, h, seg)}:${open}`, () => new THREE.CylinderGeometry(rt, rb, h, seg, 1, open)),
  sphere: (r: number, ws = 32, hs = 16, phiLen = Math.PI * 2, thetaLen = Math.PI) =>
    memo(`sph:${k(r, ws, hs, phiLen, thetaLen)}`, () => new THREE.SphereGeometry(r, ws, hs, 0, phiLen, 0, thetaLen)),
  torus: (R: number, r: number, rs = 10, ts = 40, arc = Math.PI * 2) =>
    memo(`tor:${k(R, r, rs, ts, arc)}`, () => new THREE.TorusGeometry(R, r, rs, ts, arc)),
  circle: (r: number, seg = 48) => memo(`cir:${k(r, seg)}`, () => new THREE.CircleGeometry(r, seg)),
  ring: (ri: number, ro: number, seg = 64) => memo(`ring:${k(ri, ro, seg)}`, () => new THREE.RingGeometry(ri, ro, seg)),
  cone: (r: number, h: number, seg = 24) => memo(`cone:${k(r, h, seg)}`, () => new THREE.ConeGeometry(r, h, seg)),
  /** Revolved profile around the local Y axis, then laid along −Z (nose forward). */
  fuselage: (key: string, profile: [number, number][], seg = 40) =>
    memo(`fus:${key}`, () => {
      const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
      g.rotateX(-Math.PI / 2);
      return g;
    }),
  blade: (radius: number, width = 1) => memo(`blade:${k(radius, width)}`, () => bladeGeometry(radius, width)),
  wing: (span: number, chord: number, thickness = 0.12) => memo(`wing:${k(span, chord, thickness)}`, () => wingGeometry(span, chord, thickness)),
  /** Thin tube following a list of points (tethers, fibre lines, cables). */
  tube: (key: string, points: THREE.Vector3[], radius: number, segments = 64) =>
    memo(`tube:${key}`, () => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), segments, radius, 6, false)),
};

/** A single propeller blade lying flat in the XZ plane, root at the origin, tip at +X. */
function bladeGeometry(R: number, width: number) {
  const w = width;
  const s = new THREE.Shape();
  s.moveTo(0.05 * R, -0.05 * R * w);
  s.bezierCurveTo(0.3 * R, -0.13 * R * w, 0.7 * R, -0.1 * R * w, 0.97 * R, -0.03 * R * w);
  s.quadraticCurveTo(1.02 * R, 0, 0.97 * R, 0.03 * R * w);
  s.bezierCurveTo(0.7 * R, 0.06 * R * w, 0.3 * R, 0.08 * R * w, 0.05 * R, 0.04 * R * w);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.014 * R, bevelEnabled: false, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -0.007 * R, 0);
  return g;
}

/**
 * Straight wing with a NACA-00xx style section. Span runs along X (centred),
 * chord along +Z (leading edge at z = −0.3·chord, i.e. quarter-chord ≈ origin).
 */
function wingGeometry(span: number, chord: number, t: number) {
  const pts: THREE.Vector2[] = [];
  const n = 18;
  const thick = (x: number) => 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
  for (let i = 0; i <= n; i++) {
    const x = 1 - i / n;
    pts.push(new THREE.Vector2(x * chord, thick(x) * chord));
  }
  for (let i = 1; i < n; i++) {
    const x = i / n;
    pts.push(new THREE.Vector2(x * chord, -thick(x) * chord));
  }
  const shape = new THREE.Shape(pts);
  const g = new THREE.ExtrudeGeometry(shape, { depth: span, bevelEnabled: false, steps: 1 });
  g.rotateY(-Math.PI / 2);
  g.translate(span / 2, 0, -0.3 * chord);
  return g;
}
