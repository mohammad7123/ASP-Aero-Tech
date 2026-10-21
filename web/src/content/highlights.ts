/**
 * Smaller content blocks used across the home page.
 *
 * IMPORTANT: everything here must be verifiable. The stats below are derived
 * from the published product specifications. Operational figures such as
 * flight hours, aircraft delivered, pilots trained or states covered were
 * deliberately NOT invented — add them to `stats` once you have verified
 * numbers you are comfortable publishing.
 */

export type Stat = {
  value: number;
  /** Number of digits to zero-pad to, e.g. 2 → "09". */
  pad?: number;
  unit?: string;
  label: string;
  detail: string;
};

/** `value: -1` is replaced with the live product count at render time. */
export const stats: Stat[] = [
  { value: -1, pad: 2, label: "UAS platforms", detail: "From palm-sized micro drones to long-endurance fixed wing" },
  { value: 100, unit: "km", label: "Mission range", detail: "Fixed Wing Drone" },
  { value: 8, unit: "hrs", label: "Persistent endurance", detail: "Tethered Drone" },
  { value: 15500, unit: "ft", label: "Operating altitude", detail: "Across the portfolio" },
];

/**
 * Pins for the globe. These are India's operating ENVIRONMENTS that the
 * portfolio is engineered for — not a list of deployments or clients.
 * To show real deployments, add entries with `kind: "site"`.
 */
export type GlobePin = {
  id: string;
  label: string;
  detail: string;
  lat: number;
  lng: number;
  kind: "environment" | "site";
};

export const globePins: GlobePin[] = [
  { id: "high-altitude", label: "High altitude", detail: "Rated to 15,500 ft", lat: 34.15, lng: 77.58, kind: "environment" },
  { id: "desert", label: "Desert", detail: "Heat, dust and long sight lines", lat: 26.92, lng: 70.9, kind: "environment" },
  { id: "farmland", label: "Farmland", detail: "Crop health & multispectral mapping", lat: 30.9, lng: 75.85, kind: "environment" },
  { id: "urban", label: "Urban & infrastructure", detail: "Inspection of towers, bridges, rail", lat: 19.08, lng: 72.88, kind: "environment" },
  { id: "forest", label: "Dense forest & hills", detail: "Search, rescue and border terrain", lat: 26.14, lng: 91.74, kind: "environment" },
  { id: "coastal", label: "Coastal", detail: "Disaster assessment along the cyclone belt", lat: 20.3, lng: 85.82, kind: "environment" },
  { id: "mining", label: "Mining & energy", detail: "Stockpiles, thermal and site surveys", lat: 23.61, lng: 85.28, kind: "environment" },
  { id: "plateau", label: "Deccan plateau", detail: "Wide-area surveying & mapping", lat: 17.39, lng: 78.49, kind: "environment" },
];

/** Arcs drawn between pins (by id). Purely illustrative flight paths. */
export const globeArcs: Array<[string, string]> = [
  ["plateau", "urban"],
  ["plateau", "coastal"],
  ["plateau", "farmland"],
  ["farmland", "high-altitude"],
  ["farmland", "desert"],
  ["coastal", "forest"],
  ["mining", "forest"],
  ["plateau", "mining"],
];

/**
 * Client testimonials. Left empty on purpose — publish only real, attributable
 * quotes you have permission to use. The section renders automatically once
 * this array has entries.
 */
export type Testimonial = { quote: string; name: string; role: string; organization?: string };
export const testimonials: Testimonial[] = [];

/** Platform anatomy (exploded view). Copy restates the services content. */
export const anatomyParts = [
  { key: "canopy", label: "Airframe", text: "Mission-configurable chassis engineered around payload, endurance and portability." },
  { key: "fc", label: "Flight computer", text: "Flight computers, navigation and redundant subsystems integrated as one platform." },
  { key: "battery", label: "Power system", text: "Power architecture sized for the mission's endurance profile." },
  { key: "motors", label: "Propulsion", text: "Motors and propellers matched to lift, efficiency and payload." },
  { key: "gimbal", label: "EO/IR payload", text: "Stabilised payloads configured for useful aerial intelligence." },
  { key: "gps", label: "Navigation & datalink", text: "GNSS positioning with encrypted command and telemetry links." },
] as const;

export type AnatomyKey = (typeof anatomyParts)[number]["key"];

/** Training content — scope taken from the "Training & Lifecycle Support" service. */
export const training = {
  hero: {
    eyebrow: "Training & lifecycle support",
    title: "Trained crews. Supported aircraft.",
    text: "Operator training, maintenance planning, spares, upgrades, and technical support throughout the aircraft lifecycle.",
  },
  modules: [
    { n: "01", title: "Operator training", text: "Hands-on instruction for the crews who will fly and operate the platform in the field." },
    { n: "02", title: "Mission planning & autonomy", text: "Planning routes, waypoints and automated mission profiles with ASP mission software." },
    { n: "03", title: "Payload operation", text: "Operating EO/IR, mapping and application-specific payloads for useful aerial intelligence." },
    { n: "04", title: "Maintenance planning", text: "Inspection routines and maintenance schedules that keep aircraft mission-ready." },
    { n: "05", title: "Spares & upgrades", text: "Planned spares and platform upgrades across the aircraft lifecycle." },
    { n: "06", title: "Technical support", text: "Ongoing engineering support from the team that designed and built the system." },
  ],
  lifecycle: ["Requirement", "Delivery", "Crew training", "Operations", "Maintenance", "Upgrades"],
};

/** Base coordinate for the decorative telemetry HUD (geographic centre of India). */
export const telemetryOrigin = { lat: 21.1458, lng: 79.0882 };
