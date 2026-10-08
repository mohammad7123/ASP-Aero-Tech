"use client";

import { G } from "../geometry";
import { useMats, type MaterialSet } from "../materials";
import { Gimbal, Led, Motor, Propeller } from "../parts";

export type FixedWingVariant = "conventional" | "quadplane" | "munition";

/** Fixed-wing family. Forward is −Z, up is +Y, span along X. */
export function FixedWing({ variant }: { variant: FixedWingVariant }) {
  const mats = useMats();
  if (variant === "quadplane") return <Quadplane mats={mats} />;
  if (variant === "munition") return <Munition mats={mats} />;
  return <Conventional mats={mats} />;
}

/** Spinning propeller whose disc faces forward (rotates about Z). */
function AxialProp({ radius, z, dir = 1 }: { radius: number; z: number; dir?: 1 | -1 }) {
  return (
    <group position-z={z} rotation-x={Math.PI / 2}>
      <Propeller radius={radius} dir={dir} />
    </group>
  );
}

/** White band wrapped around a wing at spanwise position `x`. */
function WingBand({ x, chord, width, mats, y = 0, z = 0 }: { x: number; chord: number; width: number; mats: MaterialSet; y?: number; z?: number }) {
  return <mesh geometry={G.wing(width, chord * 1.03, 0.13)} material={mats.white} position={[x, y, z - chord * 0.009]} />;
}

function Wheel({ position, size = 1, mats }: { position: [number, number, number]; size?: number; mats: MaterialSet }) {
  return (
    <group position={position}>
      <mesh geometry={G.cyl(0.075 * size, 0.075 * size, 0.045 * size, 20)} material={mats.rubber} rotation-z={Math.PI / 2} />
      <mesh geometry={G.cyl(0.035 * size, 0.035 * size, 0.05 * size, 12)} material={mats.metal} rotation-z={Math.PI / 2} />
    </group>
  );
}

/* ───────────────────────── Fixed Wing Drone (tractor, high wing) ───────────────────────── */

function Conventional({ mats }: { mats: MaterialSet }) {
  const chord = 0.32;
  return (
    <group>
      <mesh
        geometry={G.fuselage("conv", [
          [0.0, -0.8],
          [0.035, -0.76],
          [0.06, -0.55],
          [0.1, -0.2],
          [0.13, 0.12],
          [0.135, 0.4],
          [0.12, 0.6],
          [0.09, 0.7],
          [0.0, 0.74],
        ])}
        material={mats.navy}
      />
      {/* fuselage stripe */}
      <mesh geometry={G.cyl(0.118, 0.105, 0.07, 32)} material={mats.white} rotation-x={Math.PI / 2} position-z={0.22} />
      {/* canopy / sensor window */}
      <mesh geometry={G.sphere(1, 24, 12, Math.PI * 2, Math.PI / 2)} material={mats.lens} scale={[0.09, 0.06, 0.18]} position={[0, 0.11, -0.38]} />

      {/* high wing */}
      <group position={[0, 0.13, -0.12]}>
        <mesh geometry={G.wing(2.6, chord)} material={mats.navy} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <WingBand x={s * 0.62} chord={chord} width={0.16} mats={mats} />
            <WingBand x={s * 0.9} chord={chord} width={0.16} mats={mats} />
          </group>
        ))}
        <Led color="red" position={[-1.3, 0, 0.02]} size={0.018} halo={0.18} />
        <Led color="green" position={[1.3, 0, 0.02]} size={0.018} halo={0.18} />
      </group>

      {/* tail */}
      <group position={[0, 0.03, 0.66]}>
        <mesh geometry={G.wing(0.9, 0.2, 0.1)} material={mats.navy} />
        <group rotation-z={Math.PI / 2} position-y={0.18}>
          <mesh geometry={G.wing(0.36, 0.22, 0.1)} material={mats.navy} />
        </group>
        <mesh geometry={G.box(0.022, 0.06, 0.2)} material={mats.white} position={[0, 0.28, 0.02]} />
        <Led color="white" position={[0, 0.37, 0.04]} size={0.014} halo={0.16} blink={1.2} />
      </group>

      {/* tractor motor + prop */}
      <group position-z={-0.74}>
        <mesh geometry={G.cyl(0.07, 0.085, 0.08, 20)} material={mats.motor} rotation-x={Math.PI / 2} />
        <mesh geometry={G.cone(0.05, 0.1, 20)} material={mats.metal} rotation-x={-Math.PI / 2} position-z={-0.09} />
      </group>
      <AxialProp radius={0.36} z={-0.82} />

      {/* EO/IR ball */}
      <group position={[0, -0.12, -0.2]}>
        <Gimbal size={0.6} />
      </group>

      {/* tricycle landing gear */}
      <mesh geometry={G.cyl(0.012, 0.012, 0.22, 8)} material={mats.carbon} position={[0, -0.2, -0.55]} />
      <Wheel position={[0, -0.32, -0.55]} size={0.8} mats={mats} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh geometry={G.cyl(0.012, 0.012, 0.36, 8)} material={mats.carbon} position={[s * 0.16, -0.21, 0.02]} rotation-z={s * -0.75} />
          <Wheel position={[s * 0.3, -0.33, 0.02]} mats={mats} />
        </group>
      ))}
    </group>
  );
}

/* ───────────────────────── VTOL Drone (quadplane, H-tail booms) ───────────────────────── */

function Quadplane({ mats }: { mats: MaterialSet }) {
  const chord = 0.38;
  const boomX = 0.66;
  return (
    <group>
      <mesh
        geometry={G.fuselage("vtol", [
          [0.0, -0.78],
          [0.05, -0.74],
          [0.1, -0.5],
          [0.16, -0.1],
          [0.18, 0.2],
          [0.17, 0.45],
          [0.13, 0.62],
          [0.07, 0.72],
          [0.0, 0.75],
        ])}
        material={mats.olive}
      />
      {/* pitot probe */}
      <mesh geometry={G.cyl(0.006, 0.006, 0.18, 6)} material={mats.metal} rotation-x={Math.PI / 2} position={[0, -0.05, -0.83]} />
      {/* GNSS pucks */}
      {[-0.09, 0.09].map((x) => (
        <group key={x} position={[x, 0.17, -0.2]}>
          <mesh geometry={G.cyl(0.012, 0.012, 0.08, 8)} material={mats.black} position-y={0.04} />
          <mesh geometry={G.cyl(0.05, 0.055, 0.025, 20)} material={mats.black} position-y={0.09} />
        </group>
      ))}

      {/* wing */}
      <group position={[0, 0.14, -0.05]}>
        <mesh geometry={G.wing(3.0, chord)} material={mats.olive} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <WingBand x={s * (boomX + 0.16)} chord={chord} width={0.07} mats={mats} />
            <WingBand x={s * (boomX + 0.3)} chord={chord} width={0.07} mats={mats} />
          </group>
        ))}
        <Led color="red" position={[-1.5, 0, 0.05]} size={0.018} halo={0.18} />
        <Led color="green" position={[1.5, 0, 0.05]} size={0.018} halo={0.18} />
      </group>

      {/* booms with lift rotors at both ends */}
      {[-1, 1].map((s) => (
        <group key={s} position-x={s * boomX}>
          <mesh geometry={G.cyl(0.035, 0.035, 1.95, 14)} material={mats.black} rotation-x={Math.PI / 2} position={[0, 0.09, 0.115]} />
          {[-0.84, 1.06].map((z, j) => (
            <group key={z} position={[0, 0.12, z]}>
              <Motor size={1.1} accent={false} />
              <group position-y={0.24}>
                <Propeller radius={0.38} dir={(s * (j ? 1 : -1)) as 1 | -1} />
              </group>
            </group>
          ))}
          {/* tail post, kept forward of the rear prop disc */}
          <group position={[0, 0.37, 0.58]} rotation-z={Math.PI / 2}>
            <mesh geometry={G.wing(0.5, 0.2, 0.1)} material={mats.olive} />
          </group>
        </group>
      ))}
      {/* H-tail bar joining the posts above the rotor plane */}
      <mesh geometry={G.wing(boomX * 2 + 0.06, 0.2, 0.1)} material={mats.olive} position={[0, 0.62, 0.58]} />

      {/* pusher */}
      <mesh geometry={G.cyl(0.05, 0.06, 0.08, 16)} material={mats.motor} rotation-x={Math.PI / 2} position-z={0.8} />
      <AxialProp radius={0.26} z={0.86} dir={-1} />

      {/* belly payload */}
      <group position={[0, -0.16, -0.18]}>
        <Gimbal size={0.65} />
      </group>
    </group>
  );
}

/* ───────────────────────── Kamikaze Drone (tandem scissor wing) ───────────────────────── */

function Munition({ mats }: { mats: MaterialSet }) {
  return (
    <group>
      <mesh
        geometry={G.fuselage("lm-body", [
          [0.0, -0.95],
          [0.08, -0.93],
          [0.12, -0.86],
          [0.13, -0.6],
          [0.13, 0.45],
        ])}
        material={mats.olive}
      />
      <mesh
        geometry={G.fuselage("lm-nose", [
          [0.13, 0.45],
          [0.125, 0.6],
          [0.1, 0.74],
          [0.06, 0.85],
          [0.0, 0.92],
        ])}
        material={mats.black}
      />
      {/* panel seams */}
      {[-0.55, -0.2, 0.15].map((z) => (
        <mesh key={z} geometry={G.torus(0.131, 0.004, 6, 40)} material={mats.black} position-z={z} />
      ))}

      {/* sensor housing */}
      <group position={[0, 0.16, -0.2]}>
        <mesh geometry={G.rbox(0.14, 0.09, 0.3, 0.02)} material={mats.black} />
        <mesh geometry={G.cyl(0.03, 0.03, 0.02, 16)} material={mats.lens} rotation-x={Math.PI / 2} position-z={-0.155} />
      </group>

      {/* scissor wings on a top pivot */}
      <group position={[0, 0.17, 0.1]}>
        <mesh geometry={G.cyl(0.04, 0.04, 0.06, 16)} material={mats.black} />
        <group rotation-y={0.5} position-y={0.03}>
          <mesh geometry={G.wing(2.5, 0.2, 0.08)} material={mats.olive} />
        </group>
        <group rotation-y={-0.5} position-y={0.055}>
          <mesh geometry={G.wing(2.5, 0.2, 0.08)} material={mats.olive} />
        </group>
      </group>

      {/* X tail fins */}
      {[45, 135, 225, 315].map((deg) => (
        <group key={deg} position-z={0.78} rotation-z={(deg * Math.PI) / 180}>
          <group position-x={0.2} rotation-z={0}>
            <mesh geometry={G.wing(0.24, 0.16, 0.08)} material={mats.olive} />
          </group>
        </group>
      ))}

      {/* pusher */}
      <mesh geometry={G.cyl(0.05, 0.07, 0.08, 16)} material={mats.motor} rotation-x={Math.PI / 2} position-z={0.97} />
      <AxialProp radius={0.24} z={1.03} dir={-1} />
      <Led color="orange" position={[0, 0.1, 0.9]} size={0.014} halo={0.14} blink={1.5} />
    </group>
  );
}
