import * as THREE from "three";

/**
 * The scripted flight path. Forward is −Z. The drone starts hovering over the
 * launch pad at the origin, climbs out over farmland, holds near the anatomy
 * waypoint, then crosses the city towards the dawn horizon.
 */
export const FLIGHT_CURVE = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(0, 3.0, 0),
    new THREE.Vector3(0, 6.5, -28),
    new THREE.Vector3(7, 13, -90),
    new THREE.Vector3(-6, 16, -165),
    new THREE.Vector3(-3, 15, -235),
    new THREE.Vector3(9, 18, -320),
    new THREE.Vector3(3, 23, -420),
    new THREE.Vector3(-5, 25, -510),
    new THREE.Vector3(0, 30, -610),
  ],
  false,
  "centripetal",
);

/** Path-parameter (u, arc-length based) of each waypoint beacon. */
export const WAYPOINT_U = { about: 0.17, anatomy: 0.33, control: 0.72 } as const;

/** City footprint along −Z. */
export const CITY_Z: [number, number] = [-560, -440];

const SAMPLES = 400;
const samples = Array.from({ length: SAMPLES + 1 }, (_, i) => FLIGHT_CURVE.getPointAt(i / SAMPLES));

/** X coordinate of the path at a given Z (path is monotonic in Z). */
export function pathXAt(z: number) {
  if (z >= samples[0].z) return samples[0].x;
  if (z <= samples[SAMPLES].z) return samples[SAMPLES].x;
  let lo = 0;
  let hi = SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].z > z) lo = mid;
    else hi = mid;
  }
  const a = samples[lo];
  const b = samples[hi];
  const t = (z - a.z) / (b.z - a.z || 1);
  return a.x + (b.x - a.x) * t;
}

const _t = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

/** Position + orthonormal frame (tangent, right, up) at u. Writes into the provided vectors. */
export function frameAt(u: number, pos: THREE.Vector3, tangent: THREE.Vector3, right: THREE.Vector3) {
  const uu = Math.min(1, Math.max(0, u));
  FLIGHT_CURVE.getPointAt(uu, pos);
  FLIGHT_CURVE.getTangentAt(Math.min(0.999, Math.max(0.001, uu)), _t);
  tangent.copy(_t).normalize();
  right.crossVectors(tangent, UP).normalize();
  return { pos, tangent, right };
}
