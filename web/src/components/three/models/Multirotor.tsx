"use client";

import * as THREE from "three";
import type { AnatomyKey } from "@/content/highlights";
import { anatomyAnchors } from "@/lib/anatomy";
import { G } from "../geometry";
import { useMats, type MaterialSet } from "../materials";
import { Antenna, Duct, ExplodePart, FiberSpool, FpvCamera, Gimbal, GpsMast, Led, Motor, Propeller, Skids, Tether } from "../parts";

export type MultirotorSpec = {
  arms: 4 | 6 | 8;
  /** Distance from centre to motor axis. */
  armLength: number;
  armRadius?: number;
  armStyle?: "tube" | "flat";
  layout?: "x" | "stretch";
  body: "canopy" | "box" | "fpv" | "compact" | "whoop";
  bodyMat: keyof Pick<MaterialSet, "shell" | "tactical" | "camo" | "carbon" | "graphite" | "black" | "olive">;
  propRadius: number;
  propBlades?: number;
  motorSize?: number;
  ducts?: boolean;
  payload?: "gimbal" | "gimbal-sm" | "fpv" | "none";
  gps?: boolean;
  gear?: "skids" | "legs" | "fold-legs" | "none";
  battery?: "internal" | "top";
  spool?: boolean;
  tether?: boolean;
  antenna?: boolean;
  /** Orange accent sleeves near the motors. */
  accentArms?: boolean;
  /** Render anatomy labels (exploded view). */
  labels?: boolean;
};

const DEG = Math.PI / 180;

function armAngles(spec: MultirotorSpec): number[] {
  if (spec.layout === "stretch" && spec.arms === 4) return [35, 145, 215, 325].map((a) => a * DEG);
  const step = 360 / spec.arms;
  return Array.from({ length: spec.arms }, (_, i) => (step / 2 + step * i) * DEG);
}

/** Exploded-view offsets (model space). Forward is −Z, up is +Y. */
const EXPLODE = {
  canopy: [0, 0.8, 0] as [number, number, number],
  fc: [0, 0.52, 0] as [number, number, number],
  battery: [0, 0.2, 0.95] as [number, number, number],
  gps: [0, 1.12, 0.3] as [number, number, number],
  gimbal: [0, -0.7, -0.4] as [number, number, number],
  gear: [0, -0.55, 0] as [number, number, number],
};

export function Multirotor({ spec }: { spec: MultirotorSpec }) {
  const mats = useMats();
  const angles = armAngles(spec);
  const motorSize = spec.motorSize ?? 1;
  const armR = spec.armRadius ?? 0.04;
  const bodyMat = mats[spec.bodyMat];
  const body = BODY[spec.body];
  const motorTop = 0.2 * motorSize;

  return (
    <group>
      {/* ── Frame & arms ───────────────────────────── */}
      {angles.map((theta, i) => {
        const front = Math.cos(theta) > 0; // arm points forward (−Z)
        const start = body.armStart;
        const len = spec.armLength - start;
        const dir = (i % 2 === 0 ? 1 : -1) as 1 | -1;
        return (
          <group key={i} rotation-y={Math.PI / 2 - theta} position-y={body.armY}>
            {spec.armStyle === "flat" ? (
              <mesh geometry={G.rbox(len, armR * 1.6, armR * 2.4, armR * 0.5)} material={mats.graphite} position-x={start + len / 2} />
            ) : (
              <mesh geometry={G.cyl(armR, armR * 1.1, len, 14)} material={mats.carbon} rotation-z={Math.PI / 2} position-x={start + len / 2} />
            )}
            {spec.accentArms && (
              <mesh geometry={G.cyl(armR * 1.35, armR * 1.35, 0.09, 14)} material={mats.accent} rotation-z={Math.PI / 2} position-x={spec.armLength - 0.16 * motorSize} />
            )}
            {/* motor mount plate */}
            <mesh geometry={G.cyl(0.1 * motorSize, 0.1 * motorSize, 0.025, 20)} material={mats.carbon} position-x={spec.armLength} />
            {/* nav light under each motor: cyan forward, red aft */}
            <Led
              color={front ? "cyan" : "red"}
              position={[spec.armLength, -0.035, 0]}
              size={0.02 * motorSize}
              halo={0.2 * motorSize}
              blink={front ? 0 : 1.1}
              phase={i * 0.13}
            />
            {spec.gear === "fold-legs" && (
              <mesh geometry={G.rbox(0.05, 0.22, 0.05, 0.015)} material={mats.graphite} position={[spec.armLength - 0.02, -0.12, 0]} />
            )}
            <ExplodePart offset={[0.55, 0.25, 0]} delay={0.1}>
              <group position-x={spec.armLength}>
                <Motor size={motorSize} accent={spec.accentArms !== false} />
                {spec.labels && i === 0 && <AnatomyLabel part="motors" offset={[0, 0.25, 0]} side="right" />}
              </group>
            </ExplodePart>
            <ExplodePart offset={[0.55, 0.85, 0]} delay={0.15}>
              <group position={[spec.armLength, motorTop + 0.02, 0]}>
                <Propeller radius={spec.propRadius} dir={dir} blades={spec.propBlades ?? 2} bladeWidth={spec.ducts ? 1.5 : 1} />
                {spec.ducts && <Duct radius={spec.propRadius} />}
              </group>
            </ExplodePart>
          </group>
        );
      })}

      {/* ── Body ───────────────────────────── */}
      {spec.body === "canopy" && <CanopyBody mats={mats} bodyMat={bodyMat} labels={spec.labels} />}
      {spec.body === "box" && <BoxBody mats={mats} bodyMat={bodyMat} />}
      {spec.body === "fpv" && <FpvBody mats={mats} />}
      {spec.body === "compact" && <CompactBody mats={mats} bodyMat={bodyMat} />}
      {spec.body === "whoop" && <WhoopBody mats={mats} />}

      {/* ── Battery ───────────────────────────── */}
      {spec.battery === "top" && (
        <group position-y={body.top + 0.06}>
          <mesh geometry={G.rbox(body.width * 0.75, 0.1, body.length * 0.62, 0.02)} material={mats.battery} />
          <mesh geometry={G.box(body.width * 0.78, 0.03, 0.05)} material={mats.accent} position-y={0.0} />
        </group>
      )}

      {/* ── Payload ───────────────────────────── */}
      {(spec.payload === "gimbal" || spec.payload === "gimbal-sm") && (
        <ExplodePart offset={EXPLODE.gimbal} delay={0.05}>
          <group position={[0, body.bottom, -body.length * 0.22]}>
            <Gimbal size={spec.payload === "gimbal" ? 1.25 : 0.85} />
            {spec.labels && <AnatomyLabel part="gimbal" offset={[0, -0.3, -0.1]} side="left" />}
          </group>
        </ExplodePart>
      )}
      {spec.payload === "fpv" && (
        <group position={[0, body.mid, -body.length / 2 - 0.02]}>
          <FpvCamera size={spec.body === "whoop" ? 0.6 : 1} />
        </group>
      )}

      {/* ── Navigation ───────────────────────────── */}
      {spec.gps && (
        <ExplodePart offset={EXPLODE.gps} delay={0.2}>
          <group position={[0, body.top, body.length * 0.22]}>
            <GpsMast height={0.26} />
            <group position={[0.16, 0, 0.12]}>
              <Antenna length={0.28} tilt={0.4} />
            </group>
            <group position={[-0.16, 0, 0.12]}>
              <Antenna length={0.28} tilt={0.4} />
            </group>
            {spec.labels && <AnatomyLabel part="gps" offset={[0, 0.42, 0]} side="right" />}
          </group>
        </ExplodePart>
      )}
      {spec.antenna && (
        <group position={[0, body.top + 0.05, body.length * 0.4]}>
          <Antenna length={0.42} tilt={0.55} />
        </group>
      )}

      {/* ── Landing gear ───────────────────────────── */}
      {spec.gear === "skids" && (
        <ExplodePart offset={EXPLODE.gear} delay={0}>
          <group position-y={body.bottom}>
            <Skids width={body.width * 1.25} length={body.length * 1.05} height={0.34} />
          </group>
        </ExplodePart>
      )}
      {spec.gear === "legs" &&
        angles.map((theta, i) => (
          <group key={`leg-${i}`} rotation-y={Math.PI / 2 - theta} position-y={body.armY}>
            <mesh geometry={G.cyl(0.016, 0.014, 0.62, 8)} material={mats.carbon} position={[0.42, -0.3, 0]} rotation-z={-0.38} />
            <mesh geometry={G.sphere(0.03, 10, 8)} material={mats.rubber} position={[0.53, -0.6, 0]} />
          </group>
        ))}

      {/* ── Mission add-ons ───────────────────────────── */}
      {spec.spool && (
        <group position={[0, body.bottom - 0.2, 0.02]}>
          <FiberSpool length={0.62} radius={0.15} />
        </group>
      )}
      {spec.tether && (
        <group position={[0, body.bottom - 0.02, 0]}>
          <Tether drop={2.2} />
        </group>
      )}
    </group>
  );
}

/* ───────────────────────────── bodies ───────────────────────────── */

/** Reference dimensions per body type, used to place payloads and add-ons. */
const BODY = {
  canopy: { width: 0.66, length: 1.02, top: 0.25, bottom: -0.06, mid: 0.08, armY: 0.02, armStart: 0.2 },
  box: { width: 0.56, length: 0.6, top: 0.18, bottom: -0.1, mid: 0.04, armY: 0.04, armStart: 0.22 },
  fpv: { width: 0.2, length: 0.5, top: 0.12, bottom: -0.03, mid: 0.05, armY: 0, armStart: 0.06 },
  compact: { width: 0.3, length: 0.52, top: 0.1, bottom: -0.09, mid: 0.0, armY: 0.02, armStart: 0.12 },
  whoop: { width: 0.18, length: 0.24, top: 0.05, bottom: -0.03, mid: 0.02, armY: 0, armStart: 0.06 },
} as const;

/**
 * Canopy airframe: a low aerodynamic pod split at the waist. Profile is
 * [radius, position along the body]; +position is the nose (forward, −Z).
 */
const POD: [number, number][] = [
  [0, -0.5],
  [0.09, -0.49],
  [0.17, -0.44],
  [0.24, -0.34],
  [0.29, -0.18],
  [0.31, 0],
  [0.3, 0.14],
  [0.26, 0.29],
  [0.19, 0.41],
  [0.1, 0.49],
  [0, 0.52],
];
const WAIST_Y = 0.06;
const HULL_SCALE: [number, number, number] = [1.05, 0.42, 1];
const CANOPY_SCALE: [number, number, number] = [1, 0.72, 0.97];
const VISOR: [number, number][] = [
  [0, -0.1],
  [0.1, -0.08],
  [0.15, 0],
  [0.13, 0.09],
  [0.07, 0.15],
  [0, 0.17],
];

/** Radius of the pod at a position along it (linear between profile points). */
function podRadius(y: number) {
  for (let i = 0; i < POD.length - 1; i++) {
    const [r0, y0] = POD[i];
    const [r1, y1] = POD[i + 1];
    if (y >= y0 && y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0 || 1);
  }
  return 0;
}

// Signature light: a loop hugging the hull outline at the waist.
const WAIST_LOOP = (() => {
  const right: THREE.Vector3[] = [];
  for (let i = 1; i < POD.length - 1; i++) {
    const [r, y] = POD[i];
    right.push(new THREE.Vector3(r * HULL_SCALE[0] + 0.004, WAIST_Y, -y));
  }
  const left = right.map((p) => new THREE.Vector3(-p.x, p.y, p.z)).reverse();
  return [new THREE.Vector3(0, WAIST_Y, 0.5), ...right, new THREE.Vector3(0, WAIST_Y, -0.52), ...left];
})();

// Twin racing stripes following the canopy crown.
const stripe = (x: number) =>
  Array.from({ length: 9 }, (_, i) => {
    const y = -0.3 + i * 0.07; // along the body, tail → nose
    const r = podRadius(y) * CANOPY_SCALE[0];
    const h = Math.sqrt(Math.max(0, r * r - x * x)) / r; // height fraction across the crown
    return new THREE.Vector3(x, WAIST_Y + podRadius(y) * CANOPY_SCALE[1] * h + 0.004, -y * CANOPY_SCALE[2]);
  });
const STRIPE_L = stripe(-0.045);
const STRIPE_R = stripe(0.045);

function CanopyBody({ mats, bodyMat, labels }: { mats: MaterialSet; bodyMat: MaterialSet[keyof MaterialSet]; labels?: boolean }) {
  return (
    <group>
      {/* lower hull + internal deck (stay put — part of the airframe) */}
      <mesh geometry={G.hull("pod", POD, "lower")} material={bodyMat} scale={HULL_SCALE} position-y={WAIST_Y} />
      <mesh geometry={G.rbox(0.4, 0.04, 0.6, 0.02)} material={mats.carbon} position-y={0.0} />
      {/* side intakes */}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={G.rbox(0.03, 0.045, 0.16, 0.012)} material={mats.black} position={[side * 0.3, WAIST_Y - 0.02, 0.12]} />
      ))}
      {/* waist signature light + nose / tail lights */}
      <mesh geometry={G.tube("waist-loop", WAIST_LOOP, 0.009, 160, true)} material={mats.ledCyan} />
      <Led color="white" position={[0, WAIST_Y - 0.03, -0.5]} size={0.016} halo={0.16} />
      <Led color="red" position={[0, WAIST_Y + 0.01, 0.5]} size={0.016} halo={0.18} blink={1.2} />

      {/* flight computer */}
      <ExplodePart offset={EXPLODE.fc} delay={0.08}>
        <group position-y={0.06}>
          <mesh geometry={G.box(0.36, 0.022, 0.36)} material={mats.pcb} />
          <mesh geometry={G.box(0.11, 0.025, 0.11)} material={mats.chip} position={[0, 0.02, -0.02]} />
          <mesh geometry={G.box(0.06, 0.02, 0.08)} material={mats.chip} position={[0.11, 0.018, 0.1]} />
          <mesh geometry={G.box(0.07, 0.02, 0.05)} material={mats.chip} position={[-0.11, 0.018, 0.11]} />
          <mesh geometry={G.box(0.05, 0.03, 0.05)} material={mats.metal} position={[-0.12, 0.022, -0.12]} />
          <Led color="green" position={[0.13, 0.025, -0.13]} size={0.012} halo={0.1} blink={1.6} />
          {labels && <AnatomyLabel part="fc" offset={[0.22, 0.05, 0]} side="right" />}
        </group>
      </ExplodePart>

      {/* power system */}
      <ExplodePart offset={EXPLODE.battery} delay={0.12}>
        <group position={[0, 0.13, 0.12]}>
          <mesh geometry={G.rbox(0.3, 0.12, 0.5, 0.025)} material={mats.battery} />
          <mesh geometry={G.box(0.305, 0.04, 0.08)} material={mats.accent} position-z={0.12} />
          <mesh geometry={G.box(0.12, 0.02, 0.04)} material={mats.ledCyan} position={[0, 0.062, -0.18]} />
          {labels && <AnatomyLabel part="battery" offset={[0, 0.05, 0.3]} side="left" />}
        </group>
      </ExplodePart>

      {/* canopy shell: sculpted upper pod, dark glass sensor visor, saffron racing stripes */}
      <ExplodePart offset={EXPLODE.canopy} delay={0.02}>
        <group>
          <mesh geometry={G.hull("pod", POD, "upper")} material={bodyMat} scale={CANOPY_SCALE} position-y={WAIST_Y} />
          <mesh geometry={G.hull("visor", VISOR, "upper")} material={mats.lens} scale={[1.02, 0.85, 1]} position={[0, WAIST_Y + 0.012, -0.4]} />
          <mesh geometry={G.tube("stripe-l", STRIPE_L, 0.007, 48)} material={mats.accent} />
          <mesh geometry={G.tube("stripe-r", STRIPE_R, 0.007, 48)} material={mats.accent} />
          {labels && <AnatomyLabel part="canopy" offset={[-0.2, 0.32, 0]} side="left" />}
        </group>
      </ExplodePart>
    </group>
  );
}

function BoxBody({ mats, bodyMat }: { mats: MaterialSet; bodyMat: MaterialSet[keyof MaterialSet] }) {
  return (
    <group>
      <mesh geometry={G.rbox(0.56, 0.2, 0.6, 0.05)} material={bodyMat} position-y={0.04} />
      <mesh geometry={G.rbox(0.42, 0.06, 0.46, 0.03)} material={mats.graphite} position-y={0.16} />
      <mesh geometry={G.rbox(0.6, 0.03, 0.64, 0.015)} material={mats.carbon} position-y={-0.07} />
      <Led color="cyan" position={[0, 0.06, -0.31]} size={0.02} halo={0.18} />
      <Led color="orange" position={[0, 0.06, 0.31]} size={0.02} halo={0.18} blink={0.8} />
    </group>
  );
}

function FpvBody({ mats }: { mats: MaterialSet }) {
  return (
    <group>
      <mesh geometry={G.rbox(0.22, 0.03, 0.56, 0.01)} material={mats.carbon} />
      <mesh geometry={G.rbox(0.18, 0.025, 0.42, 0.01)} material={mats.carbon} position-y={0.1} />
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => <mesh key={`${x}${z}`} geometry={G.cyl(0.008, 0.008, 0.1, 8)} material={mats.metal} position={[x * 0.07, 0.05, z * 0.17]} />),
      )}
      <mesh geometry={G.box(0.12, 0.05, 0.14)} material={mats.pcb} position={[0, 0.045, 0.02]} />
      <Led color="orange" position={[0, 0.03, 0.29]} size={0.015} halo={0.14} blink={2} />
    </group>
  );
}

function CompactBody({ mats, bodyMat }: { mats: MaterialSet; bodyMat: MaterialSet[keyof MaterialSet] }) {
  return (
    <group>
      <mesh geometry={G.rbox(0.3, 0.16, 0.52, 0.05)} material={bodyMat} />
      <mesh geometry={G.rbox(0.24, 0.05, 0.36, 0.025)} material={mats.graphite} position={[0, 0.09, 0.02]} />
      <mesh geometry={G.cyl(0.03, 0.03, 0.02, 16)} material={mats.lens} rotation-x={Math.PI / 2} position={[0.08, 0.02, -0.26]} />
      <mesh geometry={G.cyl(0.03, 0.03, 0.02, 16)} material={mats.lens} rotation-x={Math.PI / 2} position={[-0.08, 0.02, -0.26]} />
      <group position={[0, -0.1, -0.2]}>
        <Gimbal size={0.55} />
      </group>
    </group>
  );
}

function WhoopBody({ mats }: { mats: MaterialSet }) {
  return (
    <group>
      <mesh geometry={G.rbox(0.18, 0.04, 0.24, 0.015)} material={mats.black} />
      <mesh geometry={G.rbox(0.12, 0.05, 0.14, 0.015)} material={mats.graphite} position-y={0.045} />
      <Led color="cyan" position={[0, 0.02, -0.12]} size={0.01} halo={0.08} />
    </group>
  );
}

/* ───────────────────────────── anatomy anchors ───────────────────────────── */

/**
 * Invisible anchor for an exploded-view label. The world scene projects it to
 * screen space each frame and positions the matching DOM label (see
 * lib/anatomy.ts and WorldStage) — no per-label React roots or DOM in the canvas.
 */
function AnatomyLabel({ part, offset }: { part: AnatomyKey; offset: [number, number, number]; side?: "left" | "right" }) {
  return (
    <group
      position={offset}
      ref={(obj) => {
        if (obj) anatomyAnchors.set(part, obj);
        else anatomyAnchors.delete(part);
      }}
    />
  );
}
