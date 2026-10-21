"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useClientValue } from "@/lib/hooks";

/**
 * Subtle propeller hum, synthesised with the Web Audio API (no audio files):
 * filtered brown noise for rotor wash + two detuned saw tones for blade-pass
 * beating. Off by default; intensity follows scroll speed.
 */
type Hum = { start: () => void; stop: () => void; setIntensity: (v: number) => void; dispose: () => void };

function createHum(): Hum | null {
  const Ctx = typeof window !== "undefined" ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext : undefined;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);

  // rotor wash: brown noise → band-pass
  const len = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.2;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const band = ctx.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 170;
  band.Q.value = 0.8;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.6;
  noise.connect(band).connect(noiseGain).connect(master);

  // blade-pass tone with beating between rotors
  const oscA = ctx.createOscillator();
  const oscB = ctx.createOscillator();
  oscA.type = oscB.type = "sawtooth";
  oscA.frequency.value = 116;
  oscB.frequency.value = 119.5;
  const low = ctx.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 380;
  const toneGain = ctx.createGain();
  toneGain.gain.value = 0.045;
  oscA.connect(low);
  oscB.connect(low);
  low.connect(toneGain).connect(master);

  // slow throttle wander
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.13;
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain).connect(band.frequency);

  noise.start();
  oscA.start();
  oscB.start();
  lfo.start();
  void ctx.suspend();

  let suspendTimer: number | undefined;
  return {
    start() {
      window.clearTimeout(suspendTimer);
      void ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.1, ctx.currentTime, 0.5);
    },
    stop() {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
      suspendTimer = window.setTimeout(() => void ctx.suspend(), 1200);
    },
    setIntensity(v: number) {
      const now = ctx.currentTime;
      oscA.frequency.setTargetAtTime(116 + v * 46, now, 0.25);
      oscB.frequency.setTargetAtTime(119.5 + v * 47, now, 0.25);
      low.frequency.setTargetAtTime(380 + v * 500, now, 0.25);
    },
    dispose() {
      window.clearTimeout(suspendTimer);
      void ctx.close();
    },
  };
}

type SoundCtx = { enabled: boolean; supported: boolean; toggle: () => void };
const SoundContext = createContext<SoundCtx>({ enabled: false, supported: false, toggle: () => {} });
export const useSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const supported = useClientValue(() => "AudioContext" in window || "webkitAudioContext" in window, false);
  const hum = useRef<Hum | null>(null);

  useEffect(() => () => hum.current?.dispose(), []);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  useEffect(() => {
    if (enabled) {
      hum.current ??= createHum();
      hum.current?.start();
    } else {
      hum.current?.stop();
    }
  }, [enabled]);

  // Rotor pitch rises with scroll speed.
  useEffect(() => {
    if (!enabled) return;
    let lastY = window.scrollY;
    let v = 0;
    let raf = 0;
    const loop = () => {
      const y = window.scrollY;
      v += (Math.min(1, Math.abs(y - lastY) / 45) - v) * 0.08;
      lastY = y;
      hum.current?.setIntensity(v);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);

  return <SoundContext.Provider value={{ enabled, supported, toggle }}>{children}</SoundContext.Provider>;
}
