"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";
import { useTheme } from "@/lib/theme";
import { worldTheme } from "./palette";

/**
 * Night sky dome: deep navy zenith, a saffron dawn glow ahead (−Z, the
 * direction of flight), faint horizon haze. Follows the camera and renders at
 * the far plane so it always sits behind the scene.
 */
export function Sky() {
  const ref = useRef<THREE.Mesh>(null);
  const light = useTheme() === "light";
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uZenith: { value: new THREE.Color("#02050c") },
          uHorizon: { value: new THREE.Color("#0b2240") },
          uGlow: { value: new THREE.Color("#ff8a3c") },
          uGlowK: { value: 1 },
          uGlowDir: { value: new THREE.Vector3(0.15, 0.02, -1).normalize() },
          // Daylight sun: up and to the right behind the hero drone (roughly where the key light comes from).
          uSunDir: { value: new THREE.Vector3(-0.5, 0.36, 0.79).normalize() },
          uSunK: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            gl_Position = p.xyww;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uZenith; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uGlowDir; uniform float uGlowK;
          uniform vec3 uSunDir; uniform float uSunK;
          varying vec3 vDir;
          void main() {
            float h = clamp(vDir.y, -0.2, 1.0);
            vec3 col = mix(uHorizon, uZenith, smoothstep(-0.02, 0.55, h));
            float g = max(dot(normalize(vDir), uGlowDir), 0.0);
            float band = exp(-abs(vDir.y - 0.01) * 14.0);
            col += uGlow * (pow(g, 10.0) * 0.55 + pow(g, 3.0) * 0.12) * band * uGlowK;
            col += uHorizon * band * 0.35;
            // sun: an HDR disc (> 1, so bloom turns it into glare) inside a warm halo
            float s = max(dot(normalize(vDir), uSunDir), 0.0);
            col += vec3(1.0, 0.93, 0.8) * (smoothstep(0.99935, 0.99965, s) * 7.0 + pow(s, 900.0) * 1.6 + pow(s, 48.0) * 0.28) * uSunK;
            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );
  useEffect(() => {
    const t = worldTheme(light);
    material.uniforms.uZenith.value.set(t.skyZenith);
    material.uniforms.uHorizon.value.set(t.skyHorizon);
    material.uniforms.uGlow.value.set(t.skyGlow);
    material.uniforms.uGlowK.value = t.glowStrength;
    material.uniforms.uSunK.value = light ? 1 : 0;
  }, [light, material]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(({ camera }) => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={material} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[500, 32, 16]} />
    </mesh>
  );
}

/** Twinkling stars on the upper hemisphere, centred on the camera. */
export function Stars({ count = 1600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const light = useTheme() === "light";
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(7);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = rand() * Math.PI * 2;
      const y = 0.08 + rand() * 0.92;
      const r = Math.sqrt(1 - y * y);
      pos.set([Math.cos(theta) * r * 450, y * 450, Math.sin(theta) * r * 450], i * 3);
      seed[i] = rand();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTime; uniform float uPixelRatio; varying float vA;
        void main() {
          vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_Position = p.xyww;
          float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 2.2) + aSeed * 40.0);
          vA = tw * (0.35 + aSeed * 0.65);
          gl_PointSize = (0.8 + aSeed * aSeed * 2.4) * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(vec3(0.82, 0.9, 1.0), smoothstep(0.5, 0.0, d) * vA);
        }
      `,
    });
    return { geometry, material };
  }, [count]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ camera, gl }, dt) => {
    material.uniforms.uTime.value += dt;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
    ref.current?.position.copy(camera.position);
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={-9} visible={!light} />;
}
