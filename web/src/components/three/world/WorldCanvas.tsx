"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import type * as THREE from "three";
import { flight } from "@/lib/flight";
import { useTheme } from "@/lib/theme";
import { createStudioEnvironment } from "../environment";
import { worldTheme } from "./palette";
import { WorldScene } from "./WorldScene";

/**
 * Fixed, full-viewport canvas behind the home page's flight sections.
 * Loaded with next/dynamic (ssr: false) only on capable devices.
 *
 *  - Starts with frameloop "never" and pre-compiles every shader with
 *    renderer.compileAsync (KHR_parallel_shader_compile) so the first frame
 *    doesn't block the main thread.
 *  - Pauses entirely when the visitor scrolls past the flight sections.
 *  - Steps the pixel ratio down if the frame rate drops (capped at 2).
 */
export default function WorldCanvas({ tier, onReady }: { tier: "high" | "low"; onReady: () => void }) {
  const [frameloop, setFrameloop] = useState<"always" | "never">("never");
  const maxDpr = tier === "high" ? 2 : 1.5;
  const [dpr, setDpr] = useState(maxDpr);
  const compiled = useRef(false);
  const light = useTheme() === "light";

  useEffect(() => {
    const sync = () => {
      if (compiled.current) setFrameloop(flight.active && !document.hidden ? "always" : "never");
    };
    window.addEventListener("flight:active", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.removeEventListener("flight:active", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const handleCompiled = useCallback(() => {
    compiled.current = true;
    setFrameloop(flight.active ? "always" : "never");
  }, []);

  return (
    <Canvas
      frameloop={frameloop}
      dpr={[1, dpr]}
      gl={{ antialias: tier === "high", alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 38, near: 0.1, far: 1200, position: [-2, 3.6, -7] }}
      onCreated={({ gl }) => {
        gl.setClearColor(worldTheme(document.documentElement.dataset.theme !== "dark").clear);
        // Sync shader-status checks block on the GPU; keep them for development only.
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      }}
      aria-hidden
      tabIndex={-1}
    >
      <PerformanceMonitor
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
      />
      <ClearColor color={worldTheme(light).clear} />
      <WorldScene tier={tier} />
      <Warmup onCompiled={handleCompiled} />
      <FirstFrames onReady={onReady} />
    </Canvas>
  );
}

/** Keeps the canvas clear colour in step with the theme. */
function ClearColor({ color }: { color: string }) {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.setClearColor(color);
  }, [gl, color]);
  return null;
}

/**
 * Builds the studio environment and compiles every program before the first
 * frame, both without blocking the main thread (KHR_parallel_shader_compile).
 */
function Warmup({ onCompiled }: { onCompiled: () => void }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    let cancelled = false;
    let done = false;
    let env: THREE.Texture | null = null;
    const finish = () => {
      if (done || cancelled) return;
      done = true;
      onCompiled();
    };
    const run = async () => {
      try {
        const created = await createStudioEnvironment(gl, 128);
        if (cancelled) {
          created.dispose(); // unmounted while building
          return;
        }
        env = created;
        scene.environment = env; // set before compiling so programs include the env map
        await gl.compileAsync(scene, camera);
      } catch {
        /* render anyway; three compiles on demand */
      }
      finish();
    };
    // Give React a tick to mount every child first.
    const id = requestAnimationFrame(() => void run());
    // Safety net only — a cold GPU shader cache can take several seconds.
    const fallback = window.setTimeout(finish, 10000);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
      window.clearTimeout(fallback);
      if (env) {
        if (scene.environment === env) scene.environment = null;
        env.dispose();
      }
    };
  }, [gl, scene, camera, onCompiled]);

  return null;
}

/** Signals readiness after a few rendered frames (lets the boot loader lift). */
function FirstFrames({ onReady }: { onReady: () => void }) {
  const count = useRef(0);
  useFrame(() => {
    count.current += 1;
    if (count.current === 3) onReady();
  });
  return null;
}
