"use client";

import { Grid, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { ModelConfig } from "@/content/products";
import { easeInOutCubic, lerp } from "@/lib/utils";
import { createStudioEnvironment } from "../environment";
import { ClipProvider, createMaterialSet, DriveProvider, glowTexture, MaterialProvider, type DriveRefs } from "../materials";
import { DroneModel } from "../models/DroneModel";

const FLOOR_Y = -1.15;
const SCAN_TOP = 2.4;
const SCAN_BOTTOM = FLOOR_Y - 0.1;

type Props = {
  model: ModelConfig;
  /** Changing the key triggers the scan-line "switch model" transition. */
  modelKey: string;
  tier: "high" | "low";
  active: boolean;
  /** Touch devices get auto-rotate only, so page scrolling isn't hijacked. */
  interactive: boolean;
  /** 0 → assembled, 1 → exploded (multirotors only). */
  explode?: number;
  /** Called once shaders are compiled and the first frames can render. */
  onReady?: () => void;
};

export default function ProductViewer({ model, modelKey, tier, active, interactive, explode = 0, onReady }: Props) {
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => {
    setReady(true);
    onReady?.();
  }, [onReady]);

  return (
    <Canvas
      frameloop={active && ready ? "always" : "never"}
      dpr={[1, tier === "high" ? 2 : 1.5]}
      camera={{ position: [3.9, 1.9, 4.6], fov: 30, near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
        gl.setClearColor(0x000000, 0);
      }}
      aria-hidden
      tabIndex={-1}
    >
      <ViewerWarmup onReady={handleReady} />
      <hemisphereLight args={["#9cc4ff", "#0a0f18", 0.6]} />
      <directionalLight position={[4, 7, 3]} intensity={1.8} color="#e6f0ff" />
      <pointLight position={[-4, 1.5, -3]} intensity={30} distance={14} color="#2bd9ff" />
      <pointLight position={[4, 1, -2.5]} intensity={22} distance={14} color="#f47e20" />

      <SwitchingModel model={model} modelKey={modelKey} explode={explode} />

      <Floor tier={tier} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={interactive}
        enableDamping
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.9}
        minPolarAngle={0.75}
        maxPolarAngle={1.5}
        target={[0, 0.15, 0]}
      />
    </Canvas>
  );
}

/**
 * Builds the studio environment and compiles every program before the first
 * frame without blocking the main thread (see three/environment.ts); the
 * canvas stays on frameloop "never" until then.
 */
function ViewerWarmup({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let cancelled = false;
    let env: THREE.Texture | null = null;
    const run = async () => {
      try {
        const created = await createStudioEnvironment(gl, 128);
        if (cancelled) {
          created.dispose();
          return;
        }
        env = created;
        scene.environment = env;
        scene.environmentIntensity = 0.7;
        await gl.compileAsync(scene, camera);
      } catch {
        /* render anyway; three compiles on demand */
      }
      if (!cancelled) onReady();
    };
    const id = requestAnimationFrame(() => void run());
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      if (env) {
        if (scene.environment === env) scene.environment = null;
        env.dispose();
      }
    };
  }, [gl, scene, camera, onReady]);

  return null;
}

let shadowTex: THREE.CanvasTexture | null = null;
/** Soft radial shadow (static) — far cheaper than per-frame contact shadows. */
function shadowTexture() {
  if (shadowTex) return shadowTex;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.7)");
  g.addColorStop(0.45, "rgba(0,0,0,0.32)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  shadowTex = new THREE.CanvasTexture(canvas);
  return shadowTex;
}

/**
 * Holds the current model and plays a two-phase scan transition on change:
 * a horizontal plane sweeps down clipping the old model away, then sweeps
 * down again revealing the new one, with a glowing scan disc at the cut.
 */
function SwitchingModel({ model, modelKey, explode }: { model: ModelConfig; modelKey: string; explode: number }) {
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), SCAN_TOP), []);
  const planes = useMemo(() => [plane], [plane]);
  const mats = useMemo(() => createMaterialSet({ clippingPlanes: planes }), [planes]);
  const drive = useMemo<DriveRefs>(() => ({ spin: { current: 0.9 }, explode: { current: 0 } }), []);

  const [shown, setShown] = useState({ model, key: modelKey });
  const pending = useRef<{ model: ModelConfig; key: string } | null>(null);
  const phase = useRef<"in" | "out" | "idle">("in");
  const t = useRef(0);
  const scanRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (modelKey === shown.key && !pending.current) return;
    pending.current = { model, key: modelKey };
    if (phase.current === "idle") {
      phase.current = "out";
      t.current = 0;
    }
  }, [model, modelKey, shown.key]);

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );

  const scanMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: new THREE.Color("#2bd9ff").multiplyScalar(1.6),
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  useEffect(() => () => scanMat.dispose(), [scanMat]);

  useFrame((_, dt) => {
    drive.explode.current = lerp(drive.explode.current, explode, 1 - Math.exp(-6 * dt));
    if (phase.current === "idle") {
      plane.normal.set(0, -1, 0);
      plane.constant = 100;
      scanMat.opacity = Math.max(0, scanMat.opacity - dt * 3);
      return;
    }
    const duration = phase.current === "out" ? 0.42 : 0.75;
    t.current = Math.min(1, t.current + dt / duration);
    const h = lerp(SCAN_TOP, SCAN_BOTTOM, easeInOutCubic(t.current));
    if (phase.current === "out") {
      plane.normal.set(0, -1, 0); // keep everything below h
      plane.constant = h;
    } else {
      plane.normal.set(0, 1, 0); // keep everything above h
      plane.constant = -h;
    }
    if (scanRef.current) scanRef.current.position.y = h;
    scanMat.opacity = Math.sin(t.current * Math.PI) * 0.9;

    if (t.current >= 1) {
      if (phase.current === "out" && pending.current) {
        setShown(pending.current);
        pending.current = null;
        phase.current = "in";
        t.current = 0;
      } else if (pending.current && pending.current.key !== shown.key) {
        phase.current = "out";
        t.current = 0;
      } else {
        pending.current = null;
        phase.current = "idle";
      }
    }
  });

  return (
    <>
      <MaterialProvider value={mats}>
        <ClipProvider value={planes}>
          <DriveProvider value={drive}>
            <group key={shown.key}>
              <DroneModel model={shown.model} />
            </group>
          </DriveProvider>
        </ClipProvider>
      </MaterialProvider>
      <mesh ref={scanRef} rotation-x={-Math.PI / 2} material={scanMat}>
        <planeGeometry args={[6, 6]} />
      </mesh>
    </>
  );
}

function Floor({ tier }: { tier: "high" | "low" }) {
  const ring = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: glowTexture(),
        color: new THREE.Color("#2bd9ff").multiplyScalar(0.9),
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => ring.dispose(), [ring]);
  const shadow = useMemo(
    () => new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, opacity: tier === "high" ? 0.6 : 0.45 }),
    [tier],
  );
  useEffect(() => () => shadow.dispose(), [shadow]);

  return (
    <group position-y={FLOOR_Y}>
      <Grid
        args={[12, 12]}
        cellSize={0.25}
        cellThickness={0.6}
        cellColor="#16365e"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#2bd9ff"
        fadeDistance={9}
        fadeStrength={2.2}
        infiniteGrid
        followCamera={false}
      />
      <mesh rotation-x={-Math.PI / 2} position-y={0.005} material={ring}>
        <planeGeometry args={[5.5, 5.5]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.012} material={shadow}>
        <planeGeometry args={[4.4, 4.4]} />
      </mesh>
    </group>
  );
}
