import { telemetryOrigin } from "@/content/highlights";

/**
 * Deterministic fake telemetry for the decorative HUDs — smooth layered sines,
 * so values drift believably without randomness or network traffic.
 */
export function sampleTelemetry(t: number) {
  const alt = 120 + 8 * Math.sin(t * 0.21) + 2 * Math.sin(t * 0.9);
  const vs = 8 * 0.21 * Math.cos(t * 0.21) + 2 * 0.9 * Math.cos(t * 0.9);
  const spd = 54 + 6 * Math.sin(t * 0.17 + 1) + 1.5 * Math.sin(t * 1.3);
  const hdg = (((273 + 25 * Math.sin(t * 0.05) + t * 0.8) % 360) + 360) % 360;
  const bat = 92 - ((t * 0.05) % 40);
  const rssi = -61 - 6 * Math.sin(t * 0.4) - 2 * Math.sin(t * 1.7);
  return {
    alt,
    vs,
    spd,
    hdg,
    roll: 12 * Math.sin(t * 0.35) + 3 * Math.sin(t * 1.1),
    pitch: 4 * Math.sin(t * 0.27),
    bat,
    volts: 21 + bat * 0.019,
    sats: 16 + Math.round(1.5 + 1.5 * Math.sin(t * 0.1)),
    hdop: 0.7 + 0.1 * Math.sin(t * 0.33),
    rssi,
    bars: rssi > -58 ? 4 : rssi > -63 ? 3 : rssi > -67 ? 2 : 1,
    lat: telemetryOrigin.lat + 0.0021 * Math.sin(t * 0.03),
    lng: telemetryOrigin.lng + 0.0025 * Math.cos(t * 0.027),
  };
}

export const fmt = {
  coord: (v: number, pos: string, neg: string) => `${Math.abs(v).toFixed(5)}° ${v >= 0 ? pos : neg}`,
  clock: (s: number) => `${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(Math.floor(s) % 60).padStart(2, "0")}`,
};

export const LOG_LINES = [
  "WP-03 acquired",
  "Gimbal stabilised · OK",
  "Datalink encrypted · OK",
  "Geofence nominal",
  "Auto mode · RTL armed",
  "Telemetry 10 Hz",
  "EO payload · tracking",
  "Battery health · OK",
];
