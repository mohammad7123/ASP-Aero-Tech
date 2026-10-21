"use client";

import { useFrame } from "@react-three/fiber";
import { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/random";
import { useTheme } from "@/lib/theme";
import { cloudTexture } from "../materials";
import { FLIGHT_CURVE } from "./path";
import { blendFor, worldTheme } from "./palette";

/* ───────────────────────────── Dust ───────────────────────────── */

export type DustHandle = { center: THREE.Vector3; setSwirl: (v: number) => void };

/**
 * Airborne dust that wraps inside a box centred on the drone, so the field is
 * effectively infinite and streams past as the drone flies. All motion runs
 * in the vertex shader — zero per-particle CPU work.
 */
export const Dust = forwardRef<DustHandle, { count?: number; box?: [number, number, number]; size?: number }>(function Dust(
  { count = 1400, box = [36, 18, 36], size = 0.09 },
  ref,
) {
  const light = useTheme() === "light";
  const { geometry, material } = useMemo(() => {
    const rand = mulberry32(42);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(rand() - 0.5) * box[0], (rand() - 0.5) * box[1], (rand() - 0.5) * box[2]], i * 3);
      seed[i] = rand();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: blendFor(light),
      uniforms: {
        uTime: { value: 0 },
        uCenter: { value: new THREE.Vector3() },
        uBox: { value: new THREE.Vector3(...box) },
        uSize: { value: size },
        uPixelRatio: { value: 1 },
        uSwirl: { value: 1 },
        uColor: { value: new THREE.Color(worldTheme(light).dust) },
      },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform vec3 uCenter; uniform vec3 uBox; uniform float uSize;
        uniform float uPixelRatio; uniform float uSwirl;
        attribute float aSeed;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.x += sin(uTime * 0.3 + aSeed * 6.283) * 0.8;
          p.y += cos(uTime * 0.23 + aSeed * 12.0) * 0.5 + uTime * 0.05 * (aSeed - 0.5);
          // rotor downwash: slow swirl around the vertical axis
          float a = uTime * (0.25 + aSeed * 0.5) * uSwirl;
          p.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * p.xz;
          vec3 rel = mod(p - uCenter + uBox * 0.5, uBox) - uBox * 0.5;
          vec3 world = uCenter + rel;
          vec4 mv = viewMatrix * vec4(world, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = uSize * uPixelRatio * (320.0 / max(-mv.z, 0.1)) * (0.5 + aSeed);
          vec3 e = abs(rel) / (uBox * 0.5);
          float edge = 1.0 - smoothstep(0.65, 1.0, max(max(e.x, e.y), e.z));
          vAlpha = edge * (0.25 + 0.75 * fract(aSeed * 7.13 + uTime * 0.07));
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(uColor, smoothstep(0.5, 0.0, d) * vAlpha * 0.55);
        }
      `,
    });
    return { geometry, material };
  }, [count, box, size, light]);

  useImperativeHandle(
    ref,
    () => ({
      center: material.uniforms.uCenter.value as THREE.Vector3,
      setSwirl: (v: number) => (material.uniforms.uSwirl.value = v),
    }),
    [material],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ gl }, dt) => {
    material.uniforms.uTime.value += dt;
    material.uniforms.uPixelRatio.value = gl.getPixelRatio();
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
});

/* ───────────────────────────── Volumetric beam ───────────────────────────── */

/** Soft cone of light (fresnel-faded, noise-animated) — the drone's landing light. */
export function useBeamMaterial() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: new THREE.Color("#bfefff") } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          void main() {
            vUv = uv;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform float uOpacity; uniform vec3 uColor;
          varying vec2 vUv; varying vec3 vN; varying vec3 vV;
          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          void main() {
            float facing = abs(dot(normalize(vN), normalize(vV)));
            float edge = pow(facing, 1.6);
            float along = mix(0.18, 1.0, pow(vUv.y, 0.8));
            float n = noise(vec2(vUv.x * 18.0, vUv.y * 5.0 - uTime * 0.6));
            float a = edge * along * (0.55 + 0.45 * n) * uOpacity * 0.32;
            gl_FragColor = vec4(uColor, a);
          }
        `,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
  });
  return material;
}

/* ───────────────────────────── Clouds ───────────────────────────── */

/** Moonlit cloud puffs scattered along the route, rendered as instanced billboards. */
export function Clouds({ count = 34 }: { count?: number }) {
  const light = useTheme() === "light";
  const { geometry, material } = useMemo(() => {
    const base = new THREE.PlaneGeometry(1, 1);
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.index = base.index;
    geometry.setAttribute("position", base.attributes.position);
    geometry.setAttribute("uv", base.attributes.uv);
    const offsets = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const opacities = new Float32Array(count);
    const rots = new Float32Array(count);
    const p = new THREE.Vector3();
    let seed = 3;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      FLIGHT_CURVE.getPointAt(0.06 + rand() * 0.94, p);
      const side = rand() > 0.5 ? 1 : -1;
      offsets.set([p.x + side * (6 + rand() * 60), p.y + (rand() - 0.35) * 16, p.z + (rand() - 0.5) * 30], i * 3);
      scales[i] = 22 + rand() * 38;
      opacities[i] = (light ? 0.38 : 0.22) + rand() * 0.3;
      rots[i] = rand() * Math.PI * 2;
    }
    geometry.setAttribute("aOffset", new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.setAttribute("aScale", new THREE.InstancedBufferAttribute(scales, 1));
    geometry.setAttribute("aOpacity", new THREE.InstancedBufferAttribute(opacities, 1));
    geometry.setAttribute("aRot", new THREE.InstancedBufferAttribute(rots, 1));
    geometry.instanceCount = count;

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        { uMap: { value: null }, uColor: { value: new THREE.Color(worldTheme(light).cloud) }, uTime: { value: 0 } },
      ]),
      vertexShader: /* glsl */ `
        #include <common>
        #include <fog_pars_vertex>
        attribute vec3 aOffset; attribute float aScale; attribute float aOpacity; attribute float aRot;
        uniform float uTime;
        varying vec2 vUv; varying float vOpacity;
        void main() {
          vUv = uv;
          vec3 right = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]);
          vec3 up = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
          float c = cos(aRot); float s = sin(aRot);
          vec2 q = mat2(c, -s, s, c) * position.xy * aScale;
          vec3 world = aOffset + vec3(sin(uTime * 0.05 + aRot) * 3.0, 0.0, 0.0) + right * q.x + up * q.y * 0.5;
          vec4 mvPosition = viewMatrix * vec4(world, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          // fade out when the camera flies through a puff
          vOpacity = aOpacity * smoothstep(8.0, 30.0, -mvPosition.z);
          #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */ `
        #include <common>
        #include <fog_pars_fragment>
        uniform sampler2D uMap; uniform vec3 uColor;
        varying vec2 vUv; varying float vOpacity;
        void main() {
          float a = texture2D(uMap, vUv).a * vOpacity;
          gl_FragColor = vec4(uColor, a);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
          #include <fog_fragment>
        }
      `,
    });
    material.uniforms.uMap.value = cloudTexture();
    return { geometry, material };
  }, [count, light]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}
