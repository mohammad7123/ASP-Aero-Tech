import type { ModelPreset } from "@/content/products";
import type { FixedWingVariant } from "./FixedWing";
import type { MultirotorSpec } from "./Multirotor";

export type PresetDef =
  | { kind: "multi"; spec: MultirotorSpec; scale: number; offsetY?: number }
  | { kind: "wing"; variant: FixedWingVariant; scale: number; offsetY?: number };

/** The hero quadcopter used in the flight experience and exploded view. */
export const HERO_SPEC: MultirotorSpec = {
  arms: 4,
  armLength: 0.95,
  armRadius: 0.042,
  body: "canopy",
  bodyMat: "shell",
  propRadius: 0.42,
  motorSize: 1.2,
  payload: "gimbal",
  gps: true,
  gear: "skids",
  accentArms: true,
};

/**
 * Display presets. `scale` normalises each airframe to a similar on-screen
 * size in the product viewer; real dimensions are in the spec panel.
 */
export const PRESETS: Record<ModelPreset, PresetDef> = {
  "hero-quad": { kind: "multi", spec: HERO_SPEC, scale: 1 },
  "surveillance-hexa": {
    kind: "multi",
    scale: 1.0,
    spec: {
      arms: 6,
      armLength: 1.0,
      body: "box",
      bodyMat: "camo",
      propRadius: 0.4,
      motorSize: 1.15,
      payload: "gimbal",
      gps: true,
      gear: "legs",
    },
  },
  "tethered-quad": {
    kind: "multi",
    scale: 0.8,
    offsetY: 1.05,
    spec: {
      arms: 8,
      armLength: 1.05,
      armRadius: 0.034,
      body: "box",
      bodyMat: "black",
      propRadius: 0.28,
      motorSize: 0.85,
      payload: "gimbal-sm",
      gear: "skids",
      tether: true,
    },
  },
  "fibre-fpv": {
    kind: "multi",
    scale: 1.15,
    offsetY: 0.25,
    spec: {
      arms: 4,
      layout: "stretch",
      armLength: 0.85,
      armRadius: 0.036,
      body: "fpv",
      bodyMat: "carbon",
      propRadius: 0.42,
      payload: "fpv",
      spool: true,
      antenna: true,
      accentArms: true,
      gear: "none",
    },
  },
  "fpv-quad": {
    kind: "multi",
    scale: 1.55,
    spec: {
      arms: 4,
      layout: "stretch",
      armLength: 0.62,
      armRadius: 0.034,
      body: "fpv",
      bodyMat: "carbon",
      propRadius: 0.3,
      propBlades: 3,
      payload: "fpv",
      battery: "top",
      antenna: true,
      accentArms: true,
      gear: "none",
    },
  },
  "mini-quad": {
    kind: "multi",
    scale: 2.0,
    spec: {
      arms: 4,
      armLength: 0.42,
      armRadius: 0.035,
      armStyle: "flat",
      body: "compact",
      bodyMat: "graphite",
      propRadius: 0.22,
      motorSize: 0.75,
      gear: "fold-legs",
      payload: "none",
      accentArms: false,
    },
  },
  "micro-whoop": {
    kind: "multi",
    scale: 2.8,
    spec: {
      arms: 4,
      armLength: 0.27,
      armRadius: 0.025,
      body: "whoop",
      bodyMat: "black",
      propRadius: 0.15,
      propBlades: 4,
      motorSize: 0.5,
      ducts: true,
      payload: "fpv",
      battery: "top",
      gear: "none",
      accentArms: false,
    },
  },
  "fixed-wing": { kind: "wing", variant: "conventional", scale: 1.05, offsetY: 0.1 },
  "vtol-quadplane": { kind: "wing", variant: "quadplane", scale: 0.92 },
  "loitering-munition": { kind: "wing", variant: "munition", scale: 1.05 },
};
