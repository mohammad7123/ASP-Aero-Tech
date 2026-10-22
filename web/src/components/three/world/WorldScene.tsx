"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { heroModel } from "@/content/products";
import { anatomyAnchors, anatomyLayer } from "@/lib/anatomy";
import { onBootComplete } from "@/lib/boot";
import { prefersReducedMotion } from "@/lib/device";
import { flight, segmentProgress, type SegmentName } from "@/lib/flight";
import { useTheme } from "@/lib/theme";
import { damp, lerp, remap, smoothstep } from "@/lib/utils";
import { DriveProvider, type DriveRefs } from "../materials";
import { DroneModel } from "../models/DroneModel";
import { Clouds, Dust, useBeamMaterial, type DustHandle } from "./Atmosphere";
import { City } from "./City";
import { FlightRoute, LaunchPad, Waypoints } from "./Markers";
import { frameAt, WAYPOINT_U } from "./path";
import { worldTheme } from "./palette";
import { Sky, Stars } from "./Sky";
import { setTerrainScanCenter, Terrain } from "./Terrain";

/* ───────────────────────────── choreography ───────────────────────────── */

// mobileUp: extra vertical framing on phones (negative = drone sits higher on screen).
type CamKey = { r: number; az: number; el: number; side: number; up: number; fov: number; mobileUp?: number };
const D = Math.PI / 180;

// az: 0 = behind the drone, 90° = its right, 180° = in front. side > 0 puts the drone right of centre.
const HERO: CamKey = { r: 6.4, az: 158 * D, el: 6 * D, side: 2.1, up: 0.25, fov: 38 };
const CLIMB: CamKey = { r: 9, az: 70 * D, el: 12 * D, side: 1.6, up: 0.7, fov: 42 };
const ABOUT: CamKey = { r: 11.5, az: -26 * D, el: 15 * D, side: 3.2, up: 1.2, fov: 46 };
// On phones the anatomy panel docks at the bottom, so the exploded drone is framed in the upper half.
const ANATOMY: CamKey = { r: 5.7, az: 138 * D, el: 14 * D, side: 1.7, up: 0.1, fov: 36, mobileUp: -1.35 };
const CONTROL: CamKey = { r: 15, az: -20 * D, el: 22 * D, side: -4.4, up: 1.6, fov: 48 };
const END: CamKey = { r: 22, az: -4 * D, el: 30 * D, side: -3, up: 2.4, fov: 50 };

let keyCache: { sig: string; keys: [number, CamKey][] } | null = null;

function cameraKeys(seg: Record<SegmentName, [number, number]>): [number, CamKey][] {
  const sig = `${seg.hero[1]}|${seg.about[1]}|${seg.anatomy[1]}|${seg.control[1]}`;
  if (keyCache?.sig === sig) return keyCache.keys;
  const at = (name: SegmentName, t: number) => seg[name][0] + (seg[name][1] - seg[name][0]) * t;
  const keys: [number, CamKey][] = [
    [at("hero", 0), HERO],
    [at("hero", 0.3), HERO],
    [at("hero", 1), CLIMB],
    [at("about", 0.45), ABOUT],
    [at("about", 1), ABOUT],
    [at("anatomy", 0.16), ANATOMY],
    [at("anatomy", 0.86), ANATOMY],
    [at("control", 0.35), CONTROL],
    [at("control", 1), END],
  ];
  keyCache = { sig, keys };
  return keys;
}

const _key: CamKey = { ...HERO };
function sampleCamera(p: number, keys: [number, CamKey][], mobile: boolean, heroHold: number): CamKey {
  let i = 0;
  while (i < keys.length - 2 && p > keys[i + 1][0]) i++;
  const [p0, a] = keys[i];
  const [p1, b] = keys[i + 1];
  const t = smoothstep(remap(p, p0, p1));
  _key.r = lerp(a.r, b.r, t) * (mobile ? 1.3 : 1);
  _key.az = lerp(a.az, b.az, t);
  _key.el = lerp(a.el, b.el, t);
  _key.side = mobile ? 0 : lerp(a.side, b.side, t);
  // phones: the hero copy fills the bottom of the screen, so raise the drone into the gap under the headline
  _key.up = lerp(a.up + (mobile ? (a.mobileUp ?? 0) : 0), b.up + (mobile ? (b.mobileUp ?? 0) : 0), t) + (mobile ? 0.6 - heroHold * 1.0 : 0);
  _key.fov = lerp(a.fov, b.fov, t) + (mobile ? 8 : 0);
  return _key;
}

/** Global scroll progress → position along the flight curve (u). */
function pathU(p: number, seg: Record<SegmentName, [number, number]>) {
  const stops: [number, number][] = [
    [seg.hero[0], 0],
    [seg.hero[1], 0.04],
    [seg.about[1], WAYPOINT_U.anatomy - 0.02],
    [seg.anatomy[1], WAYPOINT_U.anatomy + 0.03],
    [seg.control[1], 1],
  ];
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, u0] = stops[i];
    const [p1, u1] = stops[i + 1];
    if (p <= p1 || i === stops.length - 2) return lerp(u0, u1, remap(p, p0, p1));
  }
  return 1;
}

/** Exploded-view amount: apart by 38% of the anatomy section, back together by 94%. */
function explodeAt(p: number) {
  const q = segmentProgress("anatomy", p);
  return smoothstep(remap(q, 0.12, 0.38)) * (1 - smoothstep(remap(q, 0.72, 0.94)));
}

/* ───────────────────────────── scene ───────────────────────────── */

const UP = new THREE.Vector3(0, 1, 0);

export function WorldScene({ tier }: { tier: "high" | "low" }) {
  const high = tier === "high";
  const light = useTheme() === "light";
  const W = worldTheme(light);
  const { gl, scene, size } = useThree();

  const droneRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Group>(null);
  const rigLightsRef = useRef<THREE.Group>(null);
  const terrainRef = useRef<THREE.Group>(null);
  const dustRef = useRef<DustHandle>(null);
  const beamLevel = useRef(1);
  const routeU = useRef(0);
  const beam = useBeamMaterial();

  const drive = useMemo<DriveRefs>(() => ({ spin: { current: 0.85 }, explode: { current: 0 } }), []);
  const sim = useRef({ p: 0, u: 0, speed: 0, yaw: 0, pitch: 0, roll: 0, prevYaw: 0, ready: false });
  // Hero entrance: -1 = waiting for the intro loader, then seconds since it started; skipped below the hero.
  const intro = useRef({ booted: false, start: -1, done: false });
  useEffect(() => {
    if (prefersReducedMotion()) {
      intro.current.done = true;
      return;
    }
    return onBootComplete(() => {
      intro.current.booted = true;
    });
  }, []);
  const v = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      tan: new THREE.Vector3(),
      right: new THREE.Vector3(),
      camDir: new THREE.Vector3(),
      camRight: new THREE.Vector3(),
      target: new THREE.Vector3(),
      look: new THREE.Vector3(),
      proj: new THREE.Vector3(),
      anchor: new THREE.Vector3(),
    }),
    [],
  );
  const labelEls = useMemo(() => new Map<string, HTMLElement>(), []);

  // Fog and reflection strength follow the theme. The studio environment map
  // itself is theme-neutral and built once, asynchronously, by WorldCanvas's
  // warm-up (three/environment.ts) — rebuilding it here would stall ~1 s.
  useLayoutEffect(() => {
    gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    scene.environmentIntensity = worldTheme(light).env;
    // Daylight fog starts further out and ends later so colours stay saturated.
    scene.fog = new THREE.Fog(worldTheme(light).fog, light ? 140 : 60, light ? (high ? 680 : 520) : high ? 520 : 420);
    return () => {
      scene.fog = null;
    };
  }, [gl, scene, high, light]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const S = sim.current;
    const drone = droneRef.current;
    if (!drone) return;
    const seg = flight.segments;
    const mobile = size.width < 768;

    // 1) Smooth the scroll progress (scroll itself may already be Lenis-smoothed).
    S.p = S.ready ? damp(S.p, flight.progress, 3.4, dt) : flight.progress;
    S.ready = true;
    const p = S.p;

    // 2) Where on the route are we, and how fast are we moving?
    const u = pathU(p, seg);
    S.speed = damp(S.speed, Math.abs(u - S.u) / dt, 5, dt);
    S.u = u;
    routeU.current = u;
    frameAt(u, v.pos, v.tan, v.right);

    const heroT = segmentProgress("hero", p);
    const hoverFactor = Math.max(1 - smoothstep(remap(heroT, 0.15, 0.8)), explodeAt(p) > 0.02 ? 1 : 0.25);
    const t = state.clock.elapsedTime;
    const bob = Math.sin(t * 1.7) * 0.09 * hoverFactor + Math.sin(t * 0.63) * 0.05;

    // Entrance (top of the page only): rise into frame, swing into pose, spool the rotors up, ease the camera in.
    const I = intro.current;
    // Wait for both the intro loader and the world's first frames (flight.ready), so the entrance is actually seen.
    if (!I.done && I.booted && flight.ready) {
      if (I.start < 0) {
        I.start = t;
        if (flight.progress > 0.02) I.done = true;
      }
    }
    const introE = I.done ? 1 : I.start < 0 ? 0 : Math.min(1, (t - I.start) / 2.8);
    if (introE >= 1) I.done = true;
    const rise = 1 - (1 - introE) ** 3; // ease-out cubic
    const away = 1 - rise;

    // The camera frames the resting position (anchor) so the drone visibly climbs into the shot.
    v.anchor.copy(v.pos).addScaledVector(UP, bob);
    // Rises from just above the pad: starting underground put the drone and its ride-along lights inside the terrain.
    drone.position.copy(v.anchor).addScaledVector(UP, -away * 1.3);

    // 3) Attitude: face along the path, pitch into speed, bank into turns, follow the pointer in the hero.
    const yaw = Math.atan2(-v.tan.x, -v.tan.z);
    let dYaw = yaw - S.prevYaw;
    if (dYaw > Math.PI) dYaw -= Math.PI * 2;
    if (dYaw < -Math.PI) dYaw += Math.PI * 2;
    S.prevYaw = yaw;
    const speedN = Math.min(1, S.speed * 30);
    const heroPointer = 1 - smoothstep(remap(heroT, 0.1, 0.6));
    const px = flight.pointer.x;
    const py = flight.pointer.y;
    // In the hero the camera faces the drone, so screen-right is the drone's left:
    // positive yaw/roll turn and tilt the nose towards the pointer as seen on screen.
    S.yaw = damp(S.yaw, yaw + px * 0.25 * heroPointer, 4, dt);
    S.pitch = damp(S.pitch, -speedN * 0.32 + py * 0.14 * heroPointer + Math.sin(t * 0.9) * 0.015, 3, dt);
    // Bank into turns: a right turn (dYaw < 0) lowers the right side (negative roll).
    S.roll = damp(S.roll, (dYaw / dt) * 0.6 + px * 0.22 * heroPointer + Math.sin(t * 1.1) * 0.02, 3, dt);
    drone.rotation.set(S.pitch + away * 0.28, S.yaw + away * 1.5, S.roll - away * 0.18, "YXZ");

    // 4) Exploded view & rotor speed.
    const e = explodeAt(p);
    drive.explode.current = e;
    drive.spin.current = Math.max(0.12, 0.8 + speedN * 0.2 - e * 0.65) * (0.25 + 0.75 * smoothstep(Math.min(1, introE * 2)));

    // 5) Chase camera on an orbit around the drone.
    const k = sampleCamera(p, cameraKeys(seg), mobile, 1 - smoothstep(remap(heroT, 0.25, 0.9)));
    // Entrance: a slight orbit swing; the "push in" is a lens zoom (fov) — pulling the camera back put it inside the hillside.
    const az = k.az + px * 0.07 * heroPointer + away * 0.3;
    const el = k.el + py * 0.045 * heroPointer;
    v.camDir
      .copy(v.tan)
      .multiplyScalar(-Math.cos(az))
      .addScaledVector(v.right, Math.sin(az))
      .multiplyScalar(Math.cos(el))
      .addScaledVector(UP, Math.sin(el));
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(v.anchor).addScaledVector(v.camDir, k.r);
    v.look.copy(v.anchor).sub(cam.position).normalize();
    v.camRight.crossVectors(v.look, UP).normalize();
    v.target.copy(v.anchor).addScaledVector(v.camRight, -k.side).addScaledVector(UP, k.up);
    cam.lookAt(v.target);
    const fov = k.fov + away * 12;
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    // 6) Effects that track the drone.
    beamLevel.current = 1 - smoothstep(remap(heroT, 0.05, 0.6));
    beam.uniforms.uOpacity.value = beamLevel.current;
    if (beamRef.current) {
      beamRef.current.position.copy(drone.position);
      beamRef.current.visible = beamLevel.current > 0.01;
      beamRef.current.scale.y = Math.max(0.2, drone.position.y - 0.05) / 3;
    }
    rigLightsRef.current?.position.copy(drone.position);
    if (dustRef.current) {
      dustRef.current.center.copy(drone.position);
      dustRef.current.setSwirl(0.3 + hoverFactor * 0.9);
    }
    setTerrainScanCenter(terrainRef.current?.children[0] ?? null, drone.position);

    // 7) Exploded-view labels: project each 3D anchor to screen and move its DOM label.
    const layer = anatomyLayer.current;
    if (layer) {
      const o = Math.min(1, Math.max(0, (e - 0.55) / 0.3));
      layer.style.opacity = o.toFixed(3);
      layer.style.visibility = o < 0.01 ? "hidden" : "visible";
      if (o >= 0.01) {
        cam.updateMatrixWorld();
        anatomyAnchors.forEach((anchor, key) => {
          let el = labelEls.get(key);
          if (!el) {
            el = layer.querySelector<HTMLElement>(`[data-part="${key}"]`) ?? undefined;
            if (el) labelEls.set(key, el);
          }
          if (!el) return;
          anchor.updateWorldMatrix(true, false);
          v.proj.setFromMatrixPosition(anchor.matrixWorld).project(cam);
          const x = (v.proj.x * 0.5 + 0.5) * size.width;
          const y = (-v.proj.y * 0.5 + 0.5) * size.height;
          el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          // Left-pointing labels flip to the right when they'd run off the screen edge.
          const flip = x < 190 ? "1" : "";
          if (el.dataset.flip !== flip) el.dataset.flip = flip;
        });
      }
    }
  });

  return (
    <>
      <Sky />
      <Stars count={high ? 1600 : 600} />

      <hemisphereLight args={[W.hemi[0], W.hemi[1], W.hemi[2]]} />
      <directionalLight position={[-30, 60, 40]} intensity={W.sun[1]} color={W.sun[0]} />

      {/* lights that ride along with the drone (world-aligned, not rotating with it) */}
      <group ref={rigLightsRef}>
        <pointLight position={[-3.5, 1.8, 2.5]} intensity={22 * W.rig} distance={16} decay={2} color="#2bd9ff" />
        <pointLight position={[3.5, 1.2, 2.8]} intensity={18 * W.rig} distance={16} decay={2} color="#f47e20" />
        <pointLight position={[0, 3, -5]} intensity={14 * W.rig} distance={18} decay={2} color="#dbe8ff" />
      </group>

      <group ref={terrainRef}>
        <Terrain detail={high ? "high" : "low"} />
      </group>
      <City detail={high ? "high" : "low"} />
      {high && <Clouds count={34} />}
      <Waypoints />
      <FlightRoute progressRef={routeU} />
      <LaunchPad lightRef={beamLevel} />

      <group ref={beamRef}>
        {/* cone: apex at the drone, base on the pad; scaled to the drone's altitude every frame */}
        <mesh material={beam} position-y={-1.5}>
          <cylinderGeometry args={[0.12, 1.5, 3, 40, 1, true]} />
        </mesh>
      </group>

      <Dust ref={dustRef} count={high ? 1400 : 450} />

      <group ref={droneRef}>
        <DriveProvider value={drive}>
          <DroneModel model={heroModel} labels />
        </DriveProvider>
      </group>
    </>
  );
}
