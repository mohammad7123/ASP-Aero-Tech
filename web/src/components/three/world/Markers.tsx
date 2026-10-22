"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/lib/theme";
import { glowTexture } from "../materials";
import { FLIGHT_CURVE, WAYPOINT_U } from "./path";
import { accent, blendFor, worldTheme } from "./palette";
import { terrainHeight } from "./Terrain";


/** Additive material with a radial alpha falloff (used for floor glows). */
function useGlowMaterial(color: THREE.Color, opacity: number, light: boolean) {
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: color.clone().multiplyScalar(light ? 1 : 1.4),
        transparent: true,
        opacity,
        depthWrite: false,
        blending: blendFor(light),
        toneMapped: false,
      }),
    [color, opacity, light],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

/* ───────────────────────────── Launch pad ───────────────────────────── */

/** Ground pad under the hovering drone: rings, crosshair and a pool of landing light. */
export function LaunchPad({ lightRef }: { lightRef: React.RefObject<number> }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const poolRef = useRef<THREE.Mesh>(null);
  const light = useTheme() === "light";
  const { cyan: CYAN, signal: SIGNAL } = useMemo(() => accent(light), [light]);
  const pool = useGlowMaterial(useMemo(() => new THREE.Color(light ? "#ffffff" : "#bfefff"), [light]), light ? 0.55 : 0.4, light);
  const glow = useGlowMaterial(CYAN, light ? 0.18 : 0.1, light);

  const lineMat = useMemo(() => new THREE.MeshBasicMaterial({ color: CYAN.clone().multiplyScalar(light ? 1 : 1.3), toneMapped: false, transparent: true, opacity: 0.45 }), [light, CYAN]);
  const signalMat = useMemo(() => new THREE.MeshBasicMaterial({ color: SIGNAL.clone().multiplyScalar(light ? 1 : 1.5), toneMapped: false }), [light, SIGNAL]);
  const dashMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uColor: { value: CYAN.clone().multiplyScalar(light ? 1 : 1.5) } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
          void main() {
            vec2 c = vUv - 0.5;
            float ang = atan(c.y, c.x);
            float dash = step(0.5, fract(ang * 6.0 / 3.14159 + uTime * 0.15));
            gl_FragColor = vec4(uColor, dash * 0.55);
          }
        `,
      }),
    [light, CYAN],
  );
  useEffect(
    () => () => {
      lineMat.dispose();
      signalMat.dispose();
      dashMat.dispose();
    },
    [lineMat, signalMat, dashMat],
  );

  useFrame((_, dt) => {
    dashMat.uniforms.uTime.value += dt;
    if (ringRef.current) ringRef.current.rotation.z += dt * 0.15;
    if (poolRef.current) (poolRef.current.material as THREE.MeshBasicMaterial).opacity = 0.4 * (lightRef.current ?? 1);
  });

  return (
    <group position-y={0.04}>
      <mesh rotation-x={-Math.PI / 2}>
        <circleGeometry args={[7, 64]} />
        <meshBasicMaterial color={worldTheme(light).padDisc} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.01} material={lineMat}>
        <ringGeometry args={[6.46, 6.52, 128]} />
      </mesh>
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position-y={0.012} material={dashMat}>
        <ringGeometry args={[4.66, 4.74, 128]} />
      </mesh>
      {/* crosshair */}
      {[0, Math.PI / 2].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, r]} position-y={0.014} material={lineMat}>
          <planeGeometry args={[11, 0.025]} />
        </mesh>
      ))}
      {/* corner chevrons in signal orange */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 2 + Math.PI / 4]} position={[Math.cos((i * Math.PI) / 2 + Math.PI / 4) * 5.6, 0.016, -Math.sin((i * Math.PI) / 2 + Math.PI / 4) * 5.6]} material={signalMat}>
          <planeGeometry args={[0.7, 0.07]} />
        </mesh>
      ))}
      <mesh ref={poolRef} rotation-x={-Math.PI / 2} position-y={0.02} material={pool}>
        <planeGeometry args={[7, 7]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.018} material={glow}>
        <planeGeometry args={[18, 18]} />
      </mesh>
    </group>
  );
}

/* ───────────────────────────── Waypoint beacons ───────────────────────────── */

function Beacon({ position, phase }: { position: THREE.Vector3; phase: number }) {
  const light = useTheme() === "light";
  const SIGNAL = useMemo(() => accent(light).signal, [light]);
  const ringRef = useRef<THREE.Mesh>(null);
  const gemRef = useRef<THREE.Mesh>(null);
  const beamMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: blendFor(light),
        side: THREE.DoubleSide,
        uniforms: { uColor: { value: SIGNAL.clone().multiplyScalar(light ? 1 : 1.3) }, uTime: { value: phase } },
        vertexShader: `varying vec2 vUv; varying float vDist; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vDist = -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; uniform float uTime; varying vec2 vUv; varying float vDist;
          void main() {
            // max(): interpolated UVs can overshoot 1 by a hair, and pow() of a negative is NaN (bloom smears NaN into black)
            float fade = pow(max(1.0 - vUv.y, 0.0), 1.4) * smoothstep(12.0, 60.0, vDist);
            float pulse = 0.75 + 0.25 * sin(uTime * 2.0 + vUv.y * 12.0);
            gl_FragColor = vec4(uColor, fade * pulse * 0.5);
          }
        `,
      }),
    [phase, light, SIGNAL],
  );
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: SIGNAL.clone().multiplyScalar(light ? 1 : 1.5), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    [light, SIGNAL],
  );
  useEffect(
    () => () => {
      beamMat.dispose();
      ringMat.dispose();
    },
    [beamMat, ringMat],
  );

  useFrame(({ clock }, dt) => {
    beamMat.uniforms.uTime.value += dt;
    const t = (clock.elapsedTime * 0.5 + phase) % 1;
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + t * 5);
      ringMat.opacity = 1 - t;
    }
    if (gemRef.current) gemRef.current.rotation.y += dt * 1.2;
  });

  return (
    <group position={position}>
      <mesh position-y={22} material={beamMat}>
        <cylinderGeometry args={[0.16, 0.16, 44, 12, 1, true]} />
      </mesh>
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position-y={0.3} material={ringMat}>
        <ringGeometry args={[1.0, 1.2, 48]} />
      </mesh>
      <mesh ref={gemRef} position-y={46}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshBasicMaterial color={SIGNAL.clone().multiplyScalar(light ? 1 : 1.6)} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function Waypoints() {
  const points = useMemo(
    () =>
      Object.values(WAYPOINT_U).map((u) => {
        const p = FLIGHT_CURVE.getPointAt(u);
        // offset beacons to the side of the route so the drone doesn't fly through them
        p.x += 14;
        p.y = terrainHeight(p.x, p.z);
        return p;
      }),
    [],
  );
  return (
    <group>
      {points.map((p, i) => (
        <Beacon key={i} position={p} phase={i * 0.33} />
      ))}
    </group>
  );
}

/* ───────────────────────────── Route line ───────────────────────────── */

/** Dashed mission route ahead of the drone; `progressRef` hides what's already flown. */
export function FlightRoute({ progressRef }: { progressRef: React.RefObject<number> }) {
  const light = useTheme() === "light";
  const CYAN = useMemo(() => accent(light).cyan, [light]);
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.TubeGeometry(FLIGHT_CURVE, 900, 0.05, 6, false);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: blendFor(light),
      uniforms: { uProgress: { value: 0 }, uTime: { value: 0 }, uColor: { value: CYAN.clone().multiplyScalar(light ? 1 : 1.6) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uProgress; uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float ahead = vUv.x - uProgress - 0.004;
          if (ahead < 0.0) discard;
          float fade = 1.0 - smoothstep(0.0, 0.3, ahead);
          float dash = step(0.45, fract(vUv.x * 320.0 - uTime * 1.5));
          gl_FragColor = vec4(uColor, fade * (0.25 + 0.75 * dash) * 0.9);
        }
      `,
    });
    return { geometry, material };
  }, [light, CYAN]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
    material.uniforms.uProgress.value = progressRef.current ?? 0;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={3} />;
}
