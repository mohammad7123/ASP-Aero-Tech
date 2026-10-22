"use client";

import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useTheme } from "@/lib/theme";

/**
 * Cinematic finish for the flight world (capable devices only): HDR bloom on
 * anything brighter than white — LEDs, light strips, the sun, lit windows —
 * then ACES tone mapping (the composer renders to a float buffer, so the
 * renderer's own tone mapping no longer applies) and a soft vignette.
 */
export function PostFx() {
  const light = useTheme() === "light";
  return (
    <EffectComposer multisampling={4} enableNormalPass={false}>
      <Bloom mipmapBlur luminanceThreshold={light ? 1.05 : 0.9} luminanceSmoothing={0.25} intensity={light ? 0.75 : 1.15} radius={0.72} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.32} darkness={light ? 0.32 : 0.62} />
    </EffectComposer>
  );
}
