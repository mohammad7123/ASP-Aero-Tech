"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useTheme } from "@/lib/theme";
import { glowTexture } from "../materials";
import { hash2 } from "./noise";
import { CITY_Z, pathXAt } from "./path";
import { blendFor, worldTheme } from "./palette";
import { terrainHeight } from "./Terrain";

/** Building transforms laid out on a street grid that follows the flight path. */
function buildCity(detail: "high" | "low") {
  const [z0, z1] = CITY_Z;
  const keep = detail === "high" ? 0.78 : 0.4;
  const transforms: number[] = [];
  const rands: number[] = [];
  const lights: number[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();

  for (let z = z0; z <= z1; z += 7.5) {
    const px = pathXAt(z);
    for (let x = px - 84; x <= px + 84; x += 7.5) {
      if (hash2(x * 0.37, z * 0.19) > keep) continue;
      const core = 1 - Math.min(1, Math.abs(x - px) / 88);
      const along = 1 - Math.abs((z - (z0 + z1) / 2) / ((z1 - z0) / 2));
      const height = 2.5 + Math.pow(hash2(x, z), 3) * 22 * core * (0.4 + 0.6 * along);
      const y = terrainHeight(x, z) - 0.2;
      m.compose(p.set(x, y, z), q, s.set(2.6 + hash2(z, x) * 3.4, height, 2.6 + hash2(x + 3, z - 7) * 3.4));
      transforms.push(...m.elements);
      rands.push(hash2(x * 1.3, z * 2.1));
      if (height > 14) lights.push(x, y + height + 0.4, z);
    }
  }
  return {
    count: rands.length,
    transforms: new Float32Array(transforms),
    rands: new Float32Array(rands),
    lights: new Float32Array(lights),
  };
}

function cityMaterial(light: boolean) {
  const t = worldTheme(light).city;
  return new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uBase: { value: new THREE.Color(t.base) },
        uWindows: { value: t.windows },
        uWarm: { value: new THREE.Color("#ffb46b") },
        uCool: { value: new THREE.Color("#7fe6ff") },
        uSunDir: { value: new THREE.Vector3(-0.35, 0.8, 0.45).normalize() },
      },
    ]),
    vertexShader: /* glsl */ `
      #include <common>
      #include <fog_pars_vertex>
      attribute float aRand;
      varying vec3 vWorld; varying vec3 vNormalW; varying float vRand;
      void main() {
        vRand = aRand;
        vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        vec4 mvPosition = viewMatrix * world;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }
    `,
    fragmentShader: /* glsl */ `
      #include <common>
      #include <fog_pars_fragment>
      uniform vec3 uBase; uniform vec3 uWarm; uniform vec3 uCool; uniform vec3 uSunDir; uniform float uWindows;
      varying vec3 vWorld; varying vec3 vNormalW; varying float vRand;
      float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      void main() {
        vec3 n = normalize(vNormalW);
        float diff = max(dot(n, uSunDir), 0.0);
        vec3 col = uBase * (0.45 + 0.55 * diff);
        if (n.y < 0.5) {
          // lit windows on a floor/column grid, randomised per building
          vec2 uv = abs(n.x) > 0.5 ? vWorld.zy : vWorld.xy;
          vec2 cell = floor(uv / vec2(0.7, 0.95));
          vec2 f = fract(uv / vec2(0.7, 0.95));
          float win = step(0.22, f.x) * step(f.x, 0.78) * step(0.28, f.y) * step(f.y, 0.74);
          float on = step(0.68, h21(cell + vRand * 37.0));
          vec3 wc = mix(uWarm, uCool, step(0.72, h21(cell * 1.7 + vRand * 5.0)));
          col += wc * win * on * step(1.6, vWorld.y) * 1.15 * uWindows;
        } else {
          col = uBase * 0.7;
        }
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }
    `,
  });
}

export function City({ detail = "high" }: { detail?: "high" | "low" }) {
  const light = useTheme() === "light";
  const data = useMemo(() => buildCity(detail), [detail]);

  const mesh = useMemo(() => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    geometry.setAttribute("aRand", new THREE.InstancedBufferAttribute(data.rands, 1));
    const im = new THREE.InstancedMesh(geometry, cityMaterial(light), data.count);
    (im.instanceMatrix.array as Float32Array).set(data.transforms);
    im.instanceMatrix.needsUpdate = true;
    im.computeBoundingSphere();
    return im;
  }, [data, light]);

  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
      mesh.dispose();
    },
    [mesh],
  );

  return (
    <group>
      <primitive object={mesh} />
      {data.lights.length > 0 && <AviationLights positions={data.lights} light={light} />}
    </group>
  );
}

/** Blinking red obstruction lights on the tallest towers. */
function AviationLights({ positions, light }: { positions: Float32Array; light: boolean }) {
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: new THREE.Color("#ff3b3b").multiplyScalar(2),
      map: glowTexture(),
      size: 4,
      sizeAttenuation: true,
      transparent: true,
      depthWrite: false,
      blending: blendFor(light),
      toneMapped: false,
    });
    return { geometry, material };
  }, [positions, light]);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame(({ clock }) => {
    material.opacity = Math.sin(clock.elapsedTime * 3.2) > 0.2 ? 1 : 0.15;
  });

  return <points geometry={geometry} material={material} />;
}
