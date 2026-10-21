"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo } from "react";
import * as THREE from "three";
import type { ModelConfig, ModelPreset } from "@/content/products";
import { useClipPlanes, useDrive } from "../materials";
import { FixedWing } from "./FixedWing";
import { Multirotor } from "./Multirotor";
import { PRESETS } from "./presets";

/**
 * Renders a product's 3D model: either a procedural preset or a GLB.
 * While a GLB downloads, the procedural preset stands in.
 */
export function DroneModel({ model, labels = false }: { model: ModelConfig; labels?: boolean }) {
  if (model.kind === "gltf") {
    return (
      <Suspense fallback={<PresetModel preset={model.preset} />}>
        <GltfDrone config={model} />
      </Suspense>
    );
  }
  return <PresetModel preset={model.preset} labels={labels} />;
}

export function PresetModel({ preset, labels = false }: { preset: ModelPreset; labels?: boolean }) {
  const def = PRESETS[preset] ?? PRESETS["surveillance-hexa"];
  return (
    <group scale={def.scale} position-y={def.offsetY ?? 0}>
      {def.kind === "multi" ? <Multirotor spec={{ ...def.spec, labels }} /> : <FixedWing variant={def.variant} />}
    </group>
  );
}

/* ───────────────────────────── GLB support ───────────────────────────── */

/**
 * Draco decoder location. Defaults to Google's CDN (drei's default); set
 * NEXT_PUBLIC_DRACO_PATH=/draco/ after copying
 * node_modules/three/examples/jsm/libs/draco/gltf/* to public/draco/ to self-host.
 */
const DRACO: string | boolean = process.env.NEXT_PUBLIC_DRACO_PATH || true;

/** Exploded-view offsets for nodes named `part_<key>` (see README). */
const PART_OFFSETS: Record<string, [number, number, number]> = {
  canopy: [0, 0.95, 0],
  fc: [0, 0.52, 0],
  battery: [0, 0.2, 0.95],
  gps: [0, 1.55, 0.25],
  gimbal: [0, -0.8, -0.45],
  gear: [0, -0.55, 0],
  motor: [0, 0.25, 0],
  prop: [0, 0.85, 0],
};

type Explodable = { node: THREE.Object3D; base: THREE.Vector3; offset: THREE.Vector3 };

function GltfDrone({ config }: { config: Extract<ModelConfig, { kind: "gltf" }> }) {
  const { scene } = useGLTF(config.url, DRACO);
  const { spin, explode } = useDrive();
  const clipPlanes = useClipPlanes();

  const { root, props, parts } = useMemo(() => {
    const root = scene.clone(true);
    const props: THREE.Object3D[] = [];
    const parts: Explodable[] = [];
    root.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (mesh.isMesh && clipPlanes) {
        const apply = (m: THREE.Material) => {
          const c = m.clone();
          c.clippingPlanes = clipPlanes;
          return c;
        };
        mesh.material = Array.isArray(mesh.material) ? mesh.material.map(apply) : apply(mesh.material);
      }
      const name = node.name.toLowerCase();
      // Any node named prop*, propeller* or rotor* spins about its local Y axis.
      if (/^(prop|propeller|rotor)/.test(name)) props.push(node);
      // Exploded view: glTF extras { "explode": [x, y, z] } or a part_<key> name.
      const extras = node.userData?.explode;
      const key = name.startsWith("part_") ? name.slice(5).replace(/[_\d]+$/, "") : null;
      const offset = Array.isArray(extras) ? extras : key ? PART_OFFSETS[key] : null;
      if (offset) parts.push({ node, base: node.position.clone(), offset: new THREE.Vector3(...(offset as [number, number, number])) });
      if ((node as THREE.Mesh).isMesh) node.castShadow = node.receiveShadow = false;
    });
    return { root, props, parts };
  }, [scene, clipPlanes]);

  useFrame((_, dt) => {
    const step = Math.min(dt, 0.05) * (4 + 70 * spin.current);
    props.forEach((p, i) => (p.rotation.y += i % 2 ? step : -step));
    if (parts.length) {
      const e = explode.current;
      const t = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2;
      parts.forEach(({ node, base, offset }) => node.position.copy(base).addScaledVector(offset, t));
    }
  });

  return <primitive object={root} scale={config.scale ?? 1} position={config.position} rotation={config.rotation} />;
}
