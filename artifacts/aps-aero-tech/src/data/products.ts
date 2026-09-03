export type Product = {
  slug: string;
  name: string;
  description: string;
  image: string;
  specs: {
    range?: string;
    endurance?: string;
    payload?: string;
    frameSize?: string;
    span?: string;
    wingSpan?: string;
    maxSpeed?: string;
    altitude?: string;
    agl?: string;
  };
  features: string[];
  categories: string[];
};

export const products: Product[] = [
  {
    slug: "surveillance-drone",
    name: "Surveillance Drone",
    description: "Long Range ISR missions.",
    image: "/product-images/surveillance.jpg",
    specs: {
      range: "10 KM",
      endurance: "40 MIN",
      payload: "5 KG",
      frameSize: '23"–36"',
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense"]
  },
  {
    slug: "fixed-wing-drone",
    name: "Fixed Wing Drone",
    description: "Long endurance fixed wing drone for surveillance and reconnaissance.",
    image: "/product-images/fixed-wing.jpg",
    specs: {
      range: "100 KM",
      endurance: "120 MIN",
      payload: "1–2 KG",
      span: "2.5 M",
      maxSpeed: "100 KMPH",
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Surveillance", "Agriculture", "Delivery", "Mapping & Surveying", "Inspection", "Search & Rescue", "Military & Defense"]
  },
  {
    slug: "vtol-drone",
    name: "VTOL Drone",
    description: "Vertical take-off and landing drone for versatile battlefield operations.",
    image: "/product-images/vtol.jpg",
    specs: {
      range: "10 KM",
      endurance: "40 MIN",
      payload: "3 KG",
      span: "3 M",
      maxSpeed: "80 KMPH",
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Surveillance", "Delivery", "Mapping & Surveying", "Inspection", "Search & Rescue", "Military & Defense"]
  },
  {
    slug: "tethered-drone",
    name: "Tethered Drone",
    description: "Persistent surveillance drone with unlimited endurance.",
    image: "/product-images/tethered.jpg",
    specs: {
      endurance: "8 HRS",
      payload: "5 KG",
      frameSize: '23"–36"',
      altitude: "15500 FT",
      agl: "150 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense"]
  },
  {
    slug: "fibre-optics-drone",
    name: "Fibre Optics Drone",
    description: "Immune to jamming with fibre optic controlled operations.",
    image: "/product-images/fibre-optics.jpg",
    specs: {
      range: "5–10 KM",
      payload: "500 GMS",
      frameSize: '15"',
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Inspection", "Military & Defense", "Racing"]
  },
  {
    slug: "fpv-drone",
    name: "FPV Drone",
    description: "First Person View strike drone for close range precision missions.",
    image: "/product-images/fpv.jpg",
    specs: {
      range: "2–5 KM",
      endurance: "15–18 MIN",
      payload: "500 G–1 KG",
      frameSize: '3"–15"',
      maxSpeed: "80–120 KMPH",
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Photography & Videography", "Inspection", "Military & Defense", "Recreational", "Racing"]
  },
  {
    slug: "mini-drone",
    name: "Mini Drone",
    description: "Compact and portable drone for tactical surveillance operations.",
    image: "/product-images/mini.jpg",
    specs: {
      range: "2 KM",
      endurance: "10 MIN",
      frameSize: '5"',
      maxSpeed: "50 KMPH",
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Surveillance", "Photography & Videography", "Search & Rescue", "Military & Defense", "Recreational"]
  },
  {
    slug: "micro-drone",
    name: "Micro Drone",
    description: "Palm-sized micro drone for covert reconnaissance missions.",
    image: "/product-images/micro.jpg",
    specs: {
      range: "1 KM",
      endurance: "8 MIN",
      frameSize: '3"',
      maxSpeed: "40 KMPH",
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Surveillance", "Photography & Videography", "Inspection", "Search & Rescue", "Military & Defense", "Recreational", "Racing"]
  },
  {
    slug: "loitering-munition",
    name: "Kamikaze Drone",
    description: "Loitering munition drone designed for precision strike missions.",
    image: "/product-images/loitering-munition.jpg",
    specs: {
      range: "5–10 KM",
      endurance: "30 MIN",
      payload: "2–4 KG",
      wingSpan: "2.5 M",
      maxSpeed: "80–100 KMPH",
      altitude: "15500 FT",
      agl: "500 M"
    },
    features: ["Encrypted Comms", "Autonomous", "Mission-Ready"],
    categories: ["Military & Defense"]
  }
];

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
  "Racing"
];
