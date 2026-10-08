"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTheme } from "@/lib/theme";
import { fbm, hash2 } from "./noise";
import { worldTheme } from "./palette";
import { CITY_Z, pathXAt } from "./path";

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Terrain height at (x, z). Shared by the mesh, the city and the beacons. */
export function terrainHeight(x: number, z: number) {
  const px = pathXAt(z);
  const ad = Math.abs(x - px);
  const corridor = sstep(16, 72, ad);
  const n = fbm(x * 0.011, z * 0.011, 5) * 0.5 + 0.5;
  const mountains = Math.pow(n, 1.55) * 54 * corridor;
  const rolling = fbm(x * 0.03 + 10, z * 0.03, 3) * 2.2;
  let h = mountains + rolling * (1 - corridor * 0.5);
  const rx = px + Math.sin(z * 0.018) * 7;
  h -= Math.exp(-((x - rx) ** 2) / 18) * 2.6;
  const city = cityMask(x, z);
  h = mix(h, 1, city);
  const pad = 1 - sstep(10, 26, Math.hypot(x, z));
  return mix(h, 0, pad);
}

function cityMask(x: number, z: number) {
  const [z0, z1] = CITY_Z;
  const along = sstep(z0 - 20, z0 + 10, z) * (1 - sstep(z1 - 10, z1 + 20, z));
  return along * (1 - sstep(60, 95, Math.abs(x - pathXAt(z))));
}

const makePalette = (light: boolean) => {
  const t = worldTheme(light).terrain;
  return {
    water: new THREE.Color(t.water),
    fields: t.fields.map((c) => new THREE.Color(c)),
    grass: new THREE.Color(t.grass),
    rock: new THREE.Color(t.rock),
    rockHigh: new THREE.Color(t.rockHigh),
    snow: new THREE.Color(t.snow),
    asphalt: new THREE.Color(t.asphalt),
    pad: new THREE.Color(t.pad),
  };
};

export function Terrain({ detail = "high" }: { detail?: "high" | "low" }) {
  const [segX, segZ] = detail === "high" ? [110, 240] : [64, 140];
  const light = useTheme() === "light";

  const geometry = useMemo(() => {
    const W = 380;
    const D = 900;
    const g = new THREE.PlaneGeometry(W, D, segX, segZ);
    g.rotateX(-Math.PI / 2);
    g.translate(0, 0, -250);
    const PALETTE = makePalette(light);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = terrainHeight(x, z);
      pos.setY(i, h);

      const px = pathXAt(z);
      const ad = Math.abs(x - px);
      const rx = px + Math.sin(z * 0.018) * 7;
      const river = Math.exp(-((x - rx) ** 2) / 18);
      const city = cityMask(x, z);
      const pad = 1 - sstep(10, 26, Math.hypot(x, z));

      if (pad > 0.5) c.copy(PALETTE.pad);
      else if (city > 0.5) c.copy(PALETTE.asphalt);
      else if (river > 0.55 && h < 0.5) c.copy(PALETTE.water);
      else if (ad < 30 && h < 6) c.copy(PALETTE.fields[Math.floor(hash2(Math.floor(x / 9), Math.floor(z / 9)) * PALETTE.fields.length)]);
      else if (h > 36) c.copy(PALETTE.rockHigh).lerp(PALETTE.snow, sstep(36, 48, h));
      else c.copy(PALETTE.grass).lerp(PALETTE.rock, sstep(4, 26, h));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.computeBoundingSphere();
    return g;
  }, [segX, segZ, light]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uSunDir: { value: new THREE.Vector3(-0.35, 0.8, 0.45).normalize() },
            uSunColor: { value: new THREE.Color("#a9c4ee") },
            uAmbient: { value: new THREE.Color("#2a3a58") },
            uLine: { value: new THREE.Color("#2bd9ff") },
            uLineMix: { value: 0 },
            uTime: { value: 0 },
            uScanCenter: { value: new THREE.Vector3() },
            uScanStrength: { value: 0.22 },
          },
        ]),
        vertexShader: /* glsl */ `
          #include <common>
          #include <fog_pars_vertex>
          attribute vec3 aColor;
          varying vec3 vColor;
          varying vec3 vWorld;
          void main() {
            vColor = aColor;
            vec4 world = modelMatrix * vec4(position, 1.0);
            vWorld = world.xyz;
            vec4 mvPosition = viewMatrix * world;
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }
        `,
        fragmentShader: /* glsl */ `
          #include <common>
          #include <fog_pars_fragment>
          uniform vec3 uSunDir; uniform vec3 uSunColor; uniform vec3 uAmbient; uniform vec3 uLine; uniform float uLineMix;
          uniform float uTime; uniform vec3 uScanCenter; uniform float uScanStrength;
          varying vec3 vColor;
          varying vec3 vWorld;
          void main() {
            // faceted low-poly normal from screen-space derivatives
            vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
            float diff = max(dot(n, uSunDir), 0.0);
            vec3 col = vColor * (uAmbient + uSunColor * diff);

            float dist = length(vWorld - cameraPosition);
            float near = 1.0 - smoothstep(50.0, 320.0, dist);

            // topographic contour lines every 3 units
            float h = vWorld.y / 3.0;
            float cl = abs(fract(h - 0.5) - 0.5) / max(fwidth(h), 1e-4);
            float contour = 1.0 - min(cl, 1.0);

            // survey grid every 24 units
            vec2 g = vWorld.xz / 24.0;
            vec2 gw = abs(fract(g - 0.5) - 0.5) / max(fwidth(g), vec2(1e-4));
            float grid = 1.0 - min(min(gw.x, gw.y), 1.0);

            float lk = (contour * 0.2 + grid * 0.07) * near;
            col = mix(col + uLine * lk, mix(col, uLine, min(1.0, lk * 1.6)), uLineMix);

            // radar ring sweeping outward from the drone
            float d = length(vWorld.xz - uScanCenter.xz);
            float r = mod(uTime * 38.0, 220.0);
            float ring = smoothstep(1.6, 0.0, abs(d - r)) * (1.0 - r / 220.0);
            // fade near the camera so the ring never reads as a band at grazing angles
            float rk = ring * uScanStrength * smoothstep(25.0, 70.0, dist);
            col = mix(col + uLine * rk, mix(col, uLine, min(1.0, rk * 1.6)), uLineMix);

            gl_FragColor = vec4(col, 1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
            #include <fog_fragment>
          }
        `,
      }),
    [],
  );

  useEffect(() => {
    const t = worldTheme(light).terrain;
    material.uniforms.uSunColor.value.set(t.sun);
    material.uniforms.uAmbient.value.set(t.ambient);
    material.uniforms.uLine.value.set(t.line);
    material.uniforms.uLineMix.value = t.lineMix;
  }, [light, material]);

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

  return <mesh geometry={geometry} material={material} userData={{ terrain: material }} />;
}

/** Hook-free accessor so the world rig can move the radar ring origin. */
export function setTerrainScanCenter(mesh: THREE.Object3D | null, center: THREE.Vector3) {
  const mat = mesh?.userData?.terrain as THREE.ShaderMaterial | undefined;
  mat?.uniforms.uScanCenter.value.copy(center);
}

