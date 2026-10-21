"use client";

import { Html, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { GlobePin } from "@/content/highlights";
import { glowTexture } from "../materials";

/** Lat/lng (degrees) → point on a sphere of radius r. */
export function latLngToVec3(lat: number, lng: number, r = 1) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const FOCUS = { lat: 22, lng: 80 };

type Props = {
  pins: GlobePin[];
  arcs: Array<[string, string]>;
  activeId: string | null;
  onActive: (id: string | null) => void;
  active: boolean;
  interactive: boolean;
};

export default function GlobeCanvas({ pins, arcs, activeId, onActive, active, interactive }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.3], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
      }}
      aria-hidden
      tabIndex={-1}
    >
      <Globe pins={pins} arcs={arcs} activeId={activeId} onActive={onActive} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={interactive}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.45}
        minPolarAngle={0.9}
        maxPolarAngle={2.2}
        minAzimuthAngle={-1.1}
        maxAzimuthAngle={1.1}
      />
    </Canvas>
  );
}

/** Rasterises Natural Earth land polygons (public domain, via world-atlas) into an equirectangular mask. */
async function buildLandMask(): Promise<THREE.CanvasTexture> {
  const [{ feature }, topo] = await Promise.all([import("topojson-client"), import("world-atlas/land-110m.json")]);
  const topology = (topo as { default?: unknown }).default ?? topo;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const land = feature(topology as any, (topology as any).objects.land) as unknown as GeoJSON.FeatureCollection;
  const W = 1024;
  const H = 512;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#fff";
  const project = ([lng, lat]: number[]) => [((lng + 180) / 360) * W, ((90 - lat) / 180) * H] as const;
  const drawPolygon = (rings: number[][][]) => {
    ctx.beginPath();
    rings.forEach((ring) =>
      ring.forEach((pt, i) => {
        const [x, y] = project(pt);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }),
    );
    ctx.fill("evenodd");
  };
  for (const f of land.features) {
    const g = f.geometry;
    if (g.type === "Polygon") drawPolygon(g.coordinates);
    else if (g.type === "MultiPolygon") g.coordinates.forEach(drawPolygon);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return tex;
}

function Globe({ pins, arcs, activeId, onActive }: Omit<Props, "active" | "interactive">) {
  const group = useRef<THREE.Group>(null);
  const [mask, setMask] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let alive = true;
    let tex: THREE.CanvasTexture | null = null;
    buildLandMask()
      .then((t) => {
        tex = t;
        if (alive) setMask(t);
        else t.dispose();
      })
      .catch(() => undefined);
    return () => {
      alive = false;
      tex?.dispose();
    };
  }, []);

  // Orient the globe so India faces the camera, north up.
  const base = useMemo(() => {
    const v = latLngToVec3(FOCUS.lat, FOCUS.lng);
    const yaw = -Math.atan2(v.x, v.z);
    const after = v.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
    return { yaw, pitch: Math.atan2(after.y, after.z) };
  }, []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    g.rotation.set(base.pitch, base.yaw + Math.sin(clock.elapsedTime * 0.12) * 0.22, 0);
  });

  return (
    <group ref={group}>
      <DotSphere mask={mask} />
      <Atmosphere />
      {pins.map((pin) => (
        <Pin key={pin.id} pin={pin} active={pin.id === activeId} onActive={onActive} />
      ))}
      {arcs.map(([a, b], i) => {
        const pa = pins.find((p) => p.id === a);
        const pb = pins.find((p) => p.id === b);
        return pa && pb ? <Arc key={`${a}-${b}`} from={pa} to={pb} delay={i * 0.37} /> : null;
      })}
    </group>
  );
}

function DotSphere({ mask }: { mask: THREE.Texture | null }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uMask: { value: null },
          uHasMask: { value: 0 },
          uDot: { value: new THREE.Color("#58d6ff") },
          uFocus: { value: new THREE.Color("#ffb070") },
          uOcean: { value: new THREE.Color("#061630") },
          uRim: { value: new THREE.Color("#2bd9ff") },
          uFocusLatLng: { value: new THREE.Vector2(FOCUS.lat, FOCUS.lng) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vPos; varying vec3 vN; varying vec3 vV;
          void main() {
            vPos = normalize(position);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vN = normalize(normalMatrix * normal);
            vV = normalize(-mv.xyz);
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMask; uniform float uHasMask;
          uniform vec3 uDot; uniform vec3 uFocus; uniform vec3 uOcean; uniform vec3 uRim; uniform vec2 uFocusLatLng;
          varying vec3 vPos; varying vec3 vN; varying vec3 vV;
          const float PI = 3.141592653589793;
          float gcDeg(vec2 a, vec2 b) {
            vec2 ra = radians(a); vec2 rb = radians(b);
            float c = sin(ra.x) * sin(rb.x) + cos(ra.x) * cos(rb.x) * cos(ra.y - rb.y);
            return degrees(acos(clamp(c, -1.0, 1.0)));
          }
          void main() {
            float lat = degrees(asin(clamp(vPos.y, -1.0, 1.0)));
            float lng = degrees(atan(vPos.z, -vPos.x)) - 180.0;
            if (lng < -180.0) lng += 360.0;

            // dot lattice with near-constant spacing (columns shrink towards the poles)
            // (named "pitch", not "step": that would shadow GLSL's built-in step())
            float pitch = 1.6;
            float row = floor((lat + 90.0) / pitch);
            float latC = (row + 0.5) * pitch - 90.0;
            float cols = max(1.0, floor(360.0 * cos(radians(latC)) / pitch));
            float col = floor((lng + 180.0) / 360.0 * cols);
            float lngC = (col + 0.5) * 360.0 / cols - 180.0;
            vec2 d = vec2((lng - lngC) * cos(radians(latC)), lat - latC) / pitch;
            float dotMask = 1.0 - smoothstep(0.24, 0.34, length(d));

            float land = uHasMask > 0.5 ? step(0.5, texture2D(uMask, vec2((lngC + 180.0) / 360.0, (latC + 90.0) / 180.0)).r) : 0.0;
            float focus = 1.0 - smoothstep(4.0, 22.0, gcDeg(vec2(latC, lngC), uFocusLatLng));

            float facing = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0);
            float rim = pow(1.0 - facing, 3.0);

            vec3 col3 = uOcean * (0.55 + 0.45 * facing);
            vec3 dotCol = mix(uDot, uFocus, focus * 0.85);
            col3 = mix(col3, dotCol * (0.6 + 0.6 * focus), dotMask * land * (0.55 + 0.45 * facing));
            col3 += uDot * dotMask * (1.0 - land) * 0.05;
            col3 += uRim * rim * 0.65;
            gl_FragColor = vec4(col3, 0.96);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );

  useEffect(() => {
    material.uniforms.uMask.value = mask;
    material.uniforms.uHasMask.value = mask ? 1 : 0;
  }, [mask, material]);
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[1, 96, 64]} />
    </mesh>
  );
}

function Atmosphere() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: new THREE.Color("#2bd9ff") } },
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
        // Back faces: -dot(n, v) is ~0.5 at the globe's edge and 0 at the halo's outer edge, so the glow fades outward.
        fragmentShader: `uniform vec3 uColor; varying vec3 vN; varying vec3 vV; void main(){ float i = pow(clamp(-dot(normalize(vN), normalize(vV)), 0.0, 1.0), 1.6) * 1.3; gl_FragColor = vec4(uColor, clamp(i, 0.0, 1.0)); }`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material} scale={1.18}>
      <sphereGeometry args={[1, 64, 32]} />
    </mesh>
  );
}

function Pin({ pin, active, onActive }: { pin: GlobePin; active: boolean; onActive: (id: string | null) => void }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const { position, quaternion } = useMemo(() => {
    const p = latLngToVec3(pin.lat, pin.lng, 1.002);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize());
    return { position: p, quaternion: q };
  }, [pin.lat, pin.lng]);
  const color = pin.kind === "site" ? "#3ddc84" : active ? "#ffb070" : "#f47e20";

  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(1.5), transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide }),
    [color],
  );
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: glowTexture(), color: new THREE.Color(color), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }),
    [color],
  );
  useEffect(
    () => () => {
      ringMat.dispose();
      glowMat.dispose();
    },
    [ringMat, glowMat],
  );

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime * 0.6 + pin.lat * 0.01) % 1;
    if (ringRef.current) {
      ringRef.current.scale.setScalar(1 + t * (active ? 3.2 : 2.2));
      ringMat.opacity = (1 - t) * 0.9;
    }
  });

  return (
    <group position={position} quaternion={quaternion}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onActive(pin.id);
        }}
        onPointerOut={() => onActive(null)}
      >
        <sphereGeometry args={[active ? 0.022 : 0.016, 16, 12]} />
        <meshBasicMaterial color={new THREE.Color(color).multiplyScalar(1.6)} toneMapped={false} />
      </mesh>
      <mesh position-z={0.04} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.002, 0.002, 0.08, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.7} />
      </mesh>
      <mesh ref={ringRef} material={ringMat}>
        <ringGeometry args={[0.022, 0.028, 32]} />
      </mesh>
      <sprite material={glowMat} scale={active ? 0.16 : 0.1} position-z={0.01} />
      {active && (
        <Html position={[0, 0, 0.09]} center zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass-solid whitespace-nowrap rounded-lg px-3 py-2 text-left">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-signal">{pin.label}</div>
            <div className="mt-0.5 text-xs text-fg-muted">{pin.detail}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Arc({ from, to, delay }: { from: GlobePin; to: GlobePin; delay: number }) {
  const { geometry, material } = useMemo(() => {
    const a = latLngToVec3(from.lat, from.lng, 1.004);
    const b = latLngToVec3(to.lat, to.lng, 1.004);
    const dist = a.distanceTo(b);
    const mid = a.clone().add(b).normalize().multiplyScalar(1.004 + 0.06 + dist * 0.35);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    const geometry = new THREE.TubeGeometry(curve, 64, 0.0028, 6, false);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: delay }, uColor: { value: new THREE.Color("#2bd9ff").multiplyScalar(1.4) } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: /* glsl */ `
        uniform float uTime; uniform vec3 uColor; varying vec2 vUv;
        void main() {
          float head = fract(uTime * 0.35);
          float trail = smoothstep(head - 0.28, head, vUv.x) * step(vUv.x, head);
          float base = 0.12;
          gl_FragColor = vec4(uColor, base + trail * 0.88);
        }
      `,
    });
    return { geometry, material };
  }, [from, to, delay]);

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
  return <mesh geometry={geometry} material={material} />;
}
