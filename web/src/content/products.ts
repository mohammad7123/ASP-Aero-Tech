/**
 * UAS portfolio.
 *
 * `slug`, `name`, `description`, `image`, `specs`, `features` and `categories`
 * mirror the admin-managed catalogue (product_items table). When ASP_API_URL is
 * set, those fields are refreshed from the API and these entries act as the
 * fallback. Everything below `presentation` exists only on the website: the
 * airframe label used in the UI, and the 3D model to render.
 *
 * Swapping in a real GLB: change a product's `model` to
 *   { kind: "gltf", url: "/models/vtol.glb", scale: 1, rotation: [0, Math.PI, 0] }
 * See README.md → "Swapping in real drone models".
 */

export type SpecKey =
  | "range"
  | "endurance"
  | "payload"
  | "frameSize"
  | "span"
  | "wingSpan"
  | "maxSpeed"
  | "altitude"
  | "agl";

export type ModelPreset =
  | "hero-quad"
  | "surveillance-hexa"
  | "fixed-wing"
  | "vtol-quadplane"
  | "tethered-quad"
  | "fibre-fpv"
  | "fpv-quad"
  | "mini-quad"
  | "micro-whoop"
  | "loitering-munition";

export type ModelConfig =
  | { kind: "procedural"; preset: ModelPreset }
  | {
      kind: "gltf";
      url: string;
      /** Uniform scale applied after loading. */
      scale?: number;
      position?: [number, number, number];
      rotation?: [number, number, number];
      /** Fallback preset used for the SVG blueprint and while the GLB loads. */
      preset: ModelPreset;
    };

export type Product = {
  slug: string;
  name: string;
  description: string;
  image: string | null;
  specs: Partial<Record<SpecKey, string>>;
  features: string[];
  categories: string[];
  presentation: {
    /** Short role label, e.g. "ISR PLATFORM". */
    label: string;
    /** Airframe family shown in spec panels. */
    airframe: string;
    /** Longer marketing summary where the previous site had one. */
    summary?: string;
    model: ModelConfig;
  };
};

/**
 * The quadcopter that flies through the home page and breaks apart in the
 * exploded view. Swap for a GLB the same way as products, e.g.
 *   { kind: "gltf", url: "/models/hero.glb", preset: "hero-quad" }
 */
export const heroModel: ModelConfig = { kind: "procedural", preset: "hero-quad" };

const features = ["Encrypted Comms", "Autonomous", "Mission-Ready"];

export const products: Product[] = [
  {
    slug: "surveillance-drone",
    name: "Surveillance Drone",
    description: "Long Range ISR missions.",
    image: "/product-images/surveillance.jpg",
    specs: { range: "10 KM", endurance: "40 MIN", payload: "5 KG", frameSize: '23"–36"', altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense"],
    presentation: {
      label: "AUTONOMOUS SYSTEM",
      airframe: "Heavy-lift hexacopter",
      summary: "A heavy-lift multirotor for long-range intelligence, surveillance and reconnaissance with a stabilised EO/IR payload.",
      model: { kind: "procedural", preset: "surveillance-hexa" },
    },
  },
  {
    slug: "fixed-wing-drone",
    name: "Fixed Wing Drone",
    description: "Long endurance fixed wing drone for surveillance and reconnaissance.",
    image: "/product-images/fixed-wing.jpg",
    specs: { range: "100 KM", endurance: "120 MIN", payload: "1–2 KG", span: "2.5 M", maxSpeed: "100 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Agriculture", "Delivery", "Mapping & Surveying", "Inspection", "Search & Rescue", "Military & Defense"],
    presentation: {
      label: "LONG-ENDURANCE UAS",
      airframe: "Fixed wing",
      model: { kind: "procedural", preset: "fixed-wing" },
    },
  },
  {
    slug: "vtol-drone",
    name: "VTOL Drone",
    description: "Vertical take-off and landing drone for versatile battlefield operations.",
    image: "/product-images/vtol.jpg",
    specs: { range: "10 KM", endurance: "40 MIN", payload: "3 KG", span: "3 M", maxSpeed: "80 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Delivery", "Mapping & Surveying", "Inspection", "Search & Rescue", "Military & Defense"],
    presentation: {
      label: "ISR PLATFORM",
      airframe: "Quadplane VTOL",
      summary: "A mission-configurable VTOL platform for persistent surveillance, reconnaissance, and rapid situational awareness.",
      model: { kind: "procedural", preset: "vtol-quadplane" },
    },
  },
  {
    slug: "tethered-drone",
    name: "Tethered Drone",
    description: "Persistent surveillance drone with unlimited endurance.",
    image: "/product-images/tethered.jpg",
    specs: { endurance: "8 HRS", payload: "5 KG", frameSize: '23"–36"', altitude: "15500 FT", agl: "150 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense"],
    presentation: {
      label: "INDUSTRIAL UAS",
      airframe: "Tethered multirotor",
      summary: "A stable aerial inspection platform for utilities, infrastructure, mining, solar, and difficult-to-access assets.",
      model: { kind: "procedural", preset: "tethered-quad" },
    },
  },
  {
    slug: "fibre-optics-drone",
    name: "Fibre Optics Drone",
    description: "Immune to jamming with fibre optic controlled operations.",
    image: "/product-images/fibre-optics.jpg",
    specs: { range: "5–10 KM", payload: "500 GMS", frameSize: '15"', altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Inspection", "Military & Defense", "Racing"],
    presentation: {
      label: "JAM-RESISTANT UAS",
      airframe: "Fibre-optic FPV",
      model: { kind: "procedural", preset: "fibre-fpv" },
    },
  },
  {
    slug: "fpv-drone",
    name: "FPV Drone",
    description: "First Person View strike drone for close range precision missions.",
    image: "/product-images/fpv.jpg",
    specs: { range: "2–5 KM", endurance: "15–18 MIN", payload: "500 G–1 KG", frameSize: '3"–15"', maxSpeed: "80–120 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Photography & Videography", "Inspection", "Military & Defense", "Recreational", "Racing"],
    presentation: {
      label: "TACTICAL UAS",
      airframe: "FPV quadcopter",
      summary: "Agile, operator-focused FPV aircraft designed for close-range observation, training, and tactical field missions.",
      model: { kind: "procedural", preset: "fpv-quad" },
    },
  },
  {
    slug: "mini-drone",
    name: "Mini Drone",
    description: "Compact and portable drone for tactical surveillance operations.",
    image: "/product-images/mini.jpg",
    specs: { range: "2 KM", endurance: "10 MIN", frameSize: '5"', maxSpeed: "50 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Search & Rescue", "Military & Defense", "Recreational"],
    presentation: {
      label: "TACTICAL UAS",
      airframe: "Compact quadcopter",
      model: { kind: "procedural", preset: "mini-quad" },
    },
  },
  {
    slug: "micro-drone",
    name: "Micro Drone",
    description: "Palm-sized micro drone for covert reconnaissance missions.",
    image: "/product-images/micro.jpg",
    specs: { range: "1 KM", endurance: "8 MIN", frameSize: '3"', maxSpeed: "40 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense", "Recreational", "Racing"],
    presentation: {
      label: "COVERT RECON UAS",
      airframe: "Ducted micro quadcopter",
      model: { kind: "procedural", preset: "micro-whoop" },
    },
  },
  {
    slug: "loitering-munition",
    name: "Kamikaze Drone",
    description: "Loitering munition drone designed for precision strike missions.",
    image: "/product-images/loitering-munition.jpg",
    specs: { range: "5–10 KM", endurance: "30 MIN", payload: "2–4 KG", wingSpan: "2.5 M", maxSpeed: "80–100 KMPH", altitude: "15500 FT", agl: "500 M" },
    features,
    categories: ["Military & Defense"],
    presentation: {
      label: "LOITERING MUNITION",
      airframe: "Tandem-wing loitering munition",
      model: { kind: "procedural", preset: "loitering-munition" },
    },
  },
];

/** The ten mission categories used by the admin console. */
export const productCategories = [
  "Surveillance",
  "Photography & Videography",
  "Agriculture",
  "Delivery",
  "Mapping & Surveying",
  "Inspection",
  "Search & Rescue",
  "Military & Defense",
  "Recreational",
  "Racing",
];

/**
 * Picks a 3D preset for products created in the admin console that the site
 * doesn't know about yet (best effort, based on the name).
 */
export function inferPreset(name: string): ModelPreset {
  const n = name.toLowerCase();
  if (n.includes("vtol")) return "vtol-quadplane";
  if (n.includes("fixed") || n.includes("wing")) return "fixed-wing";
  if (n.includes("kamikaze") || n.includes("loiter") || n.includes("munition")) return "loitering-munition";
  if (n.includes("tether")) return "tethered-quad";
  if (n.includes("fibre") || n.includes("fiber")) return "fibre-fpv";
  if (n.includes("micro") || n.includes("nano")) return "micro-whoop";
  if (n.includes("mini")) return "mini-quad";
  if (n.includes("fpv")) return "fpv-quad";
  return "surveillance-hexa";
}
