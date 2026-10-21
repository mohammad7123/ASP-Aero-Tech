"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useId, useMemo, useRef, type ReactNode } from "react";
import * as THREE from "three";
import { hashString } from "@/lib/random";
import { G } from "./geometry";
import { useDrive, useMats } from "./materials";

/* Every dimension below is in model units; a typical multirotor spans ~2.5. */

/** Propeller with a motion-blur disc. `dir` sets rotation direction (±1). */
export function Propeller({ radius = 0.45, blades = 2, dir = 1, bladeWidth = 1 }: { radius?: number; blades?: number; dir?: 1 | -1; bladeWidth?: number }) {
  const mats = useMats();
  const { spin } = useDrive();
  const ref = useRef<THREE.Group>(null);
  const blurRef = useRef<THREE.Mesh>(null);
  // Stable per-instance phase so props don't spin in lockstep.
  const id = useId();
  const phase = hashString(id) * Math.PI * 2;

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = spin.current;
    g.rotation.y = (g.rotation.y + dir * Math.min(dt, 0.05) * (4 + 70 * s)) % (Math.PI * 2);
    if (blurRef.current) blurRef.current.visible = s > 0.15;
  });

  return (
    <group>
      <group ref={ref} rotation-y={phase}>
        <mesh geometry={G.cyl(radius * 0.09, radius * 0.11, radius * 0.07, 16)} material={mats.metal} />
        {Array.from({ length: blades }, (_, i) => (
          <group key={i} rotation-y={(i / blades) * Math.PI * 2}>
            <mesh geometry={G.blade(radius, bladeWidth)} material={mats.prop} rotation-x={dir * 0.16} />
          </group>
        ))}
      </group>
      <mesh ref={blurRef} geometry={G.circle(radius, 40)} material={mats.propBlur} rotation-x={-Math.PI / 2} position-y={0.004} />
    </group>
  );
}

/** Brushless outrunner: stator base, bell, accent cap. */
export function Motor({ size = 1, accent = true }: { size?: number; accent?: boolean }) {
  const mats = useMats();
  const s = size;
  return (
    <group>
      <mesh geometry={G.cyl(0.085 * s, 0.095 * s, 0.05 * s, 24)} material={mats.motor} position-y={0.025 * s} />
      <mesh geometry={G.cyl(0.09 * s, 0.09 * s, 0.1 * s, 28)} material={mats.metal} position-y={0.1 * s} />
      <mesh geometry={G.cyl(0.092 * s, 0.092 * s, 0.022 * s, 28)} material={accent ? mats.accent : mats.motor} position-y={0.15 * s} />
      <mesh geometry={G.cyl(0.012 * s, 0.012 * s, 0.05 * s, 8)} material={mats.metal} position-y={0.18 * s} />
    </group>
  );
}

/** Emissive LED with an additive halo sprite (fake bloom, no post-processing). */
export function Led({
  color = "cyan",
  size = 0.025,
  halo = 0.22,
  blink = 0,
  phase = 0,
  position,
}: {
  color?: "cyan" | "red" | "green" | "white" | "orange";
  size?: number;
  halo?: number;
  /** Blink frequency in Hz (0 = steady). */
  blink?: number;
  phase?: number;
  position?: [number, number, number];
}) {
  const mats = useMats();
  const spriteRef = useRef<THREE.Sprite>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const material = {
    cyan: mats.ledCyan,
    red: mats.ledRed,
    green: mats.ledGreen,
    white: mats.ledWhite,
    orange: mats.ledOrange,
  }[color];
  const haloColor = { cyan: "#2bd9ff", red: "#ff4040", green: "#3ddc84", white: "#ffffff", orange: "#ff8a2a" }[color];
  const haloMat = useMemo(() => {
    const m = mats.halo.clone();
    m.color = new THREE.Color(haloColor);
    m.opacity = 0.85;
    // Material.clone() deep-copies clipping planes; share the live array instead
    // so halos follow the viewer's animated scan plane.
    m.clippingPlanes = mats.halo.clippingPlanes;
    return m;
  }, [mats.halo, haloColor]);
  useEffect(() => () => haloMat.dispose(), [haloMat]);

  useFrame(({ clock }) => {
    if (!blink) return;
    const on = Math.sin((clock.elapsedTime + phase) * Math.PI * 2 * blink) > 0.6;
    if (spriteRef.current) spriteRef.current.visible = on;
    if (meshRef.current) meshRef.current.visible = on;
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} geometry={G.sphere(size, 12, 8)} material={material} />
      {halo > 0 && <sprite ref={spriteRef} material={haloMat} scale={halo} />}
    </group>
  );
}

/** Stabilised EO/IR gimbal hanging below the airframe. */
export function Gimbal({ size = 1 }: { size?: number }) {
  const mats = useMats();
  const s = size;
  return (
    <group>
      <mesh geometry={G.cyl(0.06 * s, 0.07 * s, 0.05 * s, 20)} material={mats.motor} position-y={-0.025 * s} />
      <mesh geometry={G.rbox(0.26 * s, 0.05 * s, 0.07 * s, 0.015 * s)} material={mats.graphite} position-y={-0.07 * s} />
      <mesh geometry={G.rbox(0.035 * s, 0.17 * s, 0.07 * s, 0.012 * s)} material={mats.graphite} position={[-0.115 * s, -0.16 * s, 0]} />
      <mesh geometry={G.rbox(0.035 * s, 0.17 * s, 0.07 * s, 0.012 * s)} material={mats.graphite} position={[0.115 * s, -0.16 * s, 0]} />
      <group position-y={-0.2 * s}>
        <mesh geometry={G.sphere(0.1 * s, 28, 18)} material={mats.black} />
        <mesh geometry={G.cyl(0.055 * s, 0.06 * s, 0.05 * s, 24)} material={mats.motor} rotation-x={Math.PI / 2} position-z={-0.09 * s} />
        <mesh geometry={G.cyl(0.045 * s, 0.045 * s, 0.012 * s, 24)} material={mats.lens} rotation-x={Math.PI / 2} position-z={-0.118 * s} />
        <mesh geometry={G.torus(0.05 * s, 0.006 * s, 6, 28)} material={mats.accent} position-z={-0.114 * s} />
        {/* secondary IR window */}
        <mesh geometry={G.cyl(0.024 * s, 0.024 * s, 0.02 * s, 16)} material={mats.lens} rotation-x={Math.PI / 2} position={[0.055 * s, 0.03 * s, -0.085 * s]} />
      </group>
    </group>
  );
}

/** Forward-facing FPV camera in a protective cage (front = −Z). */
export function FpvCamera({ size = 1, tilt = 0.35 }: { size?: number; tilt?: number }) {
  const mats = useMats();
  const s = size;
  return (
    <group rotation-x={tilt}>
      <mesh geometry={G.rbox(0.14 * s, 0.13 * s, 0.13 * s, 0.02 * s)} material={mats.black} />
      <mesh geometry={G.cyl(0.05 * s, 0.055 * s, 0.07 * s, 20)} material={mats.motor} rotation-x={Math.PI / 2} position-z={-0.09 * s} />
      <mesh geometry={G.cyl(0.04 * s, 0.04 * s, 0.012 * s, 20)} material={mats.lens} rotation-x={Math.PI / 2} position-z={-0.128 * s} />
    </group>
  );
}

/** GNSS puck on a mast with an orange heading arrow. */
export function GpsMast({ height = 0.28, size = 1 }: { height?: number; size?: number }) {
  const mats = useMats();
  const s = size;
  return (
    <group>
      <mesh geometry={G.cyl(0.012 * s, 0.014 * s, height, 10)} material={mats.carbon} position-y={height / 2} />
      <group position-y={height + 0.02 * s}>
        <mesh geometry={G.cyl(0.1 * s, 0.11 * s, 0.045 * s, 32)} material={mats.white} />
        <mesh geometry={G.cone(0.03 * s, 0.06 * s, 3)} material={mats.accent} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.026 * s, -0.02 * s]} scale={[1, 1, 0.15]} />
      </group>
    </group>
  );
}

/** Whip antenna used for datalinks. */
export function Antenna({ length = 0.3, tilt = 0.35 }: { length?: number; tilt?: number }) {
  const mats = useMats();
  return (
    <group rotation-x={tilt}>
      <mesh geometry={G.cyl(0.008, 0.012, length, 8)} material={mats.black} position-y={length / 2} />
      <mesh geometry={G.cyl(0.018, 0.018, 0.06, 10)} material={mats.black} position-y={length} />
    </group>
  );
}

/** Pair of landing skids. `width` is the distance between skids (X), `length` along Z. */
export function Skids({ width = 0.7, length = 0.8, height = 0.32 }: { width?: number; length?: number; height?: number }) {
  const mats = useMats();
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position-x={(side * width) / 2}>
          {[-1, 1].map((end) => (
            <mesh
              key={end}
              geometry={G.cyl(0.014, 0.014, height * 1.08, 8)}
              material={mats.carbon}
              position={[-side * 0.06, -height / 2, (end * length) / 4]}
              rotation-z={side * 0.32}
            />
          ))}
          <mesh geometry={G.cyl(0.018, 0.018, length, 10)} material={mats.carbon} rotation-x={Math.PI / 2} position-y={-height} />
          {[-1, 1].map((end) => (
            <mesh key={end} geometry={G.sphere(0.024, 10, 8)} material={mats.rubber} position={[0, -height, (end * length) / 2]} />
          ))}
        </group>
      ))}
    </group>
  );
}

/** Ring prop guard for ducted micro drones. */
export function Duct({ radius = 0.2 }: { radius?: number }) {
  const mats = useMats();
  return (
    <group>
      <mesh geometry={G.cyl(radius * 1.08, radius * 1.08, radius * 0.38, 40, true)} material={mats.black} position-y={0.02} />
      <mesh geometry={G.torus(radius * 1.08, radius * 0.05, 8, 40)} material={mats.black} rotation-x={Math.PI / 2} position-y={radius * 0.2} />
      <mesh geometry={G.torus(radius * 1.08, radius * 0.04, 8, 40)} material={mats.black} rotation-x={Math.PI / 2} position-y={-radius * 0.16} />
      {[0, 1, 2].map((i) => (
        <mesh key={i} geometry={G.box(radius * 2.1, 0.012, 0.02)} material={mats.black} rotation-y={(i * Math.PI) / 3} position-y={-radius * 0.16} />
      ))}
    </group>
  );
}

/** Fibre-optic spool canister with a trailing fibre line. */
export function FiberSpool({ length = 0.7, radius = 0.17 }: { length?: number; radius?: number }) {
  const mats = useMats();
  const fiber = useMemo(
    () => [
      new THREE.Vector3(0, 0, length / 2 + 0.06),
      new THREE.Vector3(0, -0.12, length / 2 + 0.5),
      new THREE.Vector3(0.05, -0.5, length / 2 + 1.1),
      new THREE.Vector3(0.12, -1.05, length / 2 + 1.6),
    ],
    [length],
  );
  return (
    <group>
      <mesh geometry={G.cyl(radius, radius, length, 32)} material={mats.spool} rotation-x={Math.PI / 2} />
      {[-0.32, -0.1, 0.12, 0.34].map((z) => (
        <mesh key={z} geometry={G.torus(radius * 1.01, 0.012, 6, 32)} material={mats.black} position-z={z * length} />
      ))}
      <mesh geometry={G.cyl(radius * 1.04, radius * 1.04, 0.05, 32)} material={mats.olive} rotation-x={Math.PI / 2} position-z={length / 2} />
      <mesh geometry={G.cyl(radius * 1.04, radius * 1.04, 0.05, 32)} material={mats.olive} rotation-x={Math.PI / 2} position-z={-length / 2} />
      <mesh geometry={G.cyl(0.03, 0.04, 0.09, 12)} material={mats.metal} rotation-x={Math.PI / 2} position-z={length / 2 + 0.06} />
      <mesh geometry={G.tube(`fiber:${length}`, fiber, 0.006, 48)} material={mats.fiber} />
    </group>
  );
}

/** Tether cable from the aircraft down to a rugged ground power unit. */
export function Tether({ drop = 2.4 }: { drop?: number }) {
  const mats = useMats();
  const points = useMemo(
    () => [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.05, -drop * 0.35, 0.15),
      new THREE.Vector3(0.35, -drop * 0.75, 0.45),
      new THREE.Vector3(0.85, -drop, 0.55),
    ],
    [drop],
  );
  return (
    <group>
      <mesh geometry={G.tube(`tether:${drop}`, points, 0.012, 64)} material={mats.tether} />
      <group position={[1.15, -drop - 0.18, 0.55]}>
        <mesh geometry={G.rbox(0.75, 0.42, 0.5, 0.05)} material={mats.olive} />
        <mesh geometry={G.rbox(0.77, 0.06, 0.52, 0.02)} material={mats.black} position-y={0.12} />
        <mesh geometry={G.box(0.2, 0.08, 0.01)} material={mats.black} position={[0.12, 0.02, 0.255]} />
        <Led color="green" position={[0.26, 0.05, 0.26]} size={0.015} halo={0.12} blink={0.5} />
        {[-0.28, 0.28].map((x) =>
          [-0.2, 0.2].map((z) => <mesh key={`${x}${z}`} geometry={G.cyl(0.07, 0.07, 0.05, 16)} material={mats.rubber} rotation-z={Math.PI / 2} position={[x, -0.22, z]} />),
        )}
      </group>
    </group>
  );
}

/** Group whose position eases between `base` and `base + offset * amount` — used by exploded views. */
export function ExplodePart({
  offset,
  delay = 0,
  children,
}: {
  offset: [number, number, number];
  delay?: number;
  children: ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const { explode } = useDrive();
  const target = useMemo(() => new THREE.Vector3(...offset), [offset]);

  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const e = Math.min(1, Math.max(0, (explode.current - delay) / (1 - delay || 1)));
    const t = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
    g.position.set(target.x * t, target.y * t, target.z * t);
  });

  return <group ref={ref}>{children}</group>;
}
